import argparse
import json
import os
import sys

import matplotlib.pyplot as plt
import numpy as np
import torch
from torch.utils.data import DataLoader
from torch.utils.tensorboard import SummaryWriter
from tqdm import tqdm

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../"))

from torch.optim import Adam

from vae_interp.dataset import load_nouns_dataset
from vae_interp.vae import VAE


def parse_args():
    parser = argparse.ArgumentParser(description="VAE Training Arguments")

    parser.add_argument("--image_size", type=int, default=64)
    parser.add_argument("--max_beta", type=float, default=1.0)
    parser.add_argument(
        "--num_hiddens",
        type=str,
        required=True,
        help="Comma-separated list of integers for hidden layer sizes",
    )
    parser.add_argument(
        "--latent_dim", type=int, required=True, help="Dimension of the latent space"
    )
    parser.add_argument(
        "--lr", type=float, default=0.001, help="Learning rate (default: 0.001)"
    )
    parser.add_argument(
        "--batch_size", type=int, default=32, help="Batch size (default: 32)"
    )
    parser.add_argument(
        "--iterations", type=int, required=True, help="Number of training iterations"
    )
    parser.add_argument(
        "--checkpoint_every",
        type=int,
        default=1000,
        help="Save checkpoint and run evaluation every N iterations",
    )
    parser.add_argument(
        "--save_dir",
        type=str,
        required=True,
        help="Directory to save the trained model",
    )

    return parser.parse_args()


def evaluate(model, dataloader, device, writer, iteration):
    model.eval()
    with torch.no_grad():
        # Get a batch of images
        images = torch.stack([dataloader.dataset[i] for i in range(25)], dim=0).to(
            device
        )

        # Reconstruct images
        reconstructed = model(images)["recon"]

        # Create a pyplot figure
        fig, axes = plt.subplots(5, 10, figsize=(20, 10))
        fig.suptitle(f"Original vs Reconstructed (Iteration {iteration})")

        for i in range(25):
            # Original image
            ax = axes[i // 5, (i % 5) * 2]
            img = images[i].cpu().permute(1, 2, 0).numpy()
            img = (img - img.min()) / (img.max() - img.min())  # Normalize to [0, 1]
            ax.imshow(img)
            ax.axis("off")
            if i < 5:
                ax.set_title("Original")

            # Reconstructed image
            ax = axes[i // 5, (i % 5) * 2 + 1]
            img = reconstructed[i].cpu().permute(1, 2, 0).numpy()
            img = (img - img.min()) / (img.max() - img.min())  # Normalize to [0, 1]
            ax.imshow(img)
            ax.axis("off")
            if i < 5:
                ax.set_title("Recon")

        plt.tight_layout()

        # Convert plot to image
        fig.canvas.draw()
        plot_image = torch.from_numpy(
            np.frombuffer(fig.canvas.tostring_rgb(), dtype=np.uint8)
        )
        plot_image = plot_image.view(fig.canvas.get_width_height()[::-1] + (3,))
        plot_image = plot_image.permute(2, 0, 1)

        # Log to TensorBoard
        writer.add_image("eval", plot_image, iteration)

        plt.close(fig)


def sigmoid_schedule(epoch, total_epochs, max_beta=1.0):
    midpoint = total_epochs / 2
    scale = 10 / total_epochs
    return max_beta / (1 + np.exp(-scale * (epoch - midpoint)))


def main(args):
    # conver num_hiddens from string to list of integers
    num_hiddens = [int(x) for x in args.num_hiddens.split(",")]

    # print the parsed arguments
    print("VAE Training Configuration:")
    print(f"Hidden layers: {num_hiddens}")
    print(f"Latent dimension: {args.latent_dim}")
    print(f"Learning rate: {args.lr}")
    print(f"Batch size: {args.batch_size}")
    print(f"Iterations: {args.iterations}")
    print(f"Save directory: {args.save_dir}")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    if not os.path.exists(args.save_dir):
        os.makedirs(args.save_dir)

    # load model
    vae = VAE(
        in_channels=3,
        num_hiddens=num_hiddens,
        latent_dim=args.latent_dim,
    )

    print(f"Number of parameters: {sum(p.numel() for p in vae.parameters())}")

    vae.to(device)

    # save vae config as json
    config_path = os.path.join(args.save_dir, "config.json")
    with open(config_path, "w") as f:
        json.dump(vae.config, f)

    # set up TensorBoard
    writer = SummaryWriter(log_dir=os.path.join(args.save_dir, "logs"))

    # load dataset
    dataset = load_nouns_dataset(args.image_size, normalize=True)
    dataloader = DataLoader(
        dataset, batch_size=args.batch_size, shuffle=True, pin_memory=True
    )

    # set up the optimizer
    optimizer = Adam(vae.parameters(), lr=args.lr)

    # Training loop
    iteration = 0
    pbar = tqdm(total=args.iterations, desc="Training ...")

    vae.train()
    while iteration < args.iterations:
        for batch in dataloader:
            if iteration >= args.iterations:
                break

            x = batch.to(device)
            # beta = iteration / (args.iterations - 1)
            # beta = sigmoid_schedule(
            #     iteration, args.iterations - 1, max_beta=args.max_beta
            # )
            # beta = args.max_beta
            # loss_dict = vae.loss(x, beta)
            if iteration < 1000:
                beta = 0
            else:
                # beta = sigmoid_schedule(
                #     iteration - 1000, args.iterations - 1 - 1000, max_beta=args.max_beta
                # )
                beta = args.max_beta / (args.iterations - 1000) * (iteration - 1000)
            loss_dict = vae.loss(x, beta)
            loss = loss_dict["loss"]

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            # Log losses to TensorBoard
            writer.add_scalar("loss", loss.item(), iteration)
            writer.add_scalar("recon_loss", loss_dict["recon_loss"].item(), iteration)
            writer.add_scalar("kl_loss", loss_dict["kl_loss"].item(), iteration)
            writer.add_scalar("kl_loss_beta", beta, iteration)

            pbar.update(1)
            pbar.set_postfix({"loss": f"{loss.item():.4f}"})
            iteration += 1

            # Checkpoint and evaluate
            if iteration % args.checkpoint_every == 0:
                # Save the model
                checkpoint_path = os.path.join(args.save_dir, f"vae.pth")
                torch.save(
                    vae.state_dict(),
                    checkpoint_path,
                )
                print(f"\nCheckpoint saved to {checkpoint_path}")

                # Run evaluation
                evaluate(vae, dataloader, device, writer, iteration)
                vae.train()

        if iteration >= args.iterations:
            break

    pbar.close()

    # Save the final model
    final_path = os.path.join(args.save_dir, "vae.pth")
    torch.save(
        vae.state_dict(),
        final_path,
    )
    print(f"Final model saved to {final_path}")

    writer.close()


if __name__ == "__main__":
    args = parse_args()
    main(args)
