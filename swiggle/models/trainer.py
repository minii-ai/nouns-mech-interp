import json
import os
from dataclasses import asdict, dataclass
from io import BytesIO

import matplotlib.pyplot as plt
import numpy as np
import torch
from PIL import Image
from torch.optim import Adam
from torch.utils.data import DataLoader
from torch.utils.tensorboard import SummaryWriter
from torchvision import transforms
from tqdm import tqdm

from .sae import SAE
from .vae import VAE


@dataclass
class SAETrainConfig:
    lr: float
    iterations: int
    lmbda: float


class SAETrainer:
    def __init__(
        self,
        model: SAE,
        vae: VAE,
        latent_shape: tuple,
        dataloader: DataLoader,
        config: SAETrainConfig,
        save_dir: str,
        checkpoint_every: int,
        dtype: torch.dtype = torch.float32,
        device: torch.device = "cpu",
    ):
        self.model = model
        self.vae = vae
        self.latent_shape = latent_shape
        self.dataloader = dataloader
        self.config = config
        self.save_dir = save_dir
        self.checkpoint_every = checkpoint_every
        self.dtype = dtype
        self.device = device

        # set up tensorboard
        self.writer = SummaryWriter(log_dir=os.path.join(self.save_dir, "logs"))

    def train(self):
        print("SAE Training Configuration:")
        print(f"in_features: {self.model.in_features}")
        print(f"expansion_factor: {self.model.expansion_factor}")
        print(f"lr: {self.config.lr}")
        print(f"iterations: {self.config.iterations}")
        print(f"save_dir: {self.save_dir}")
        print(f"num_parameters: {sum(p.numel() for p in self.model.parameters())}")

        if not os.path.exists(self.save_dir):
            os.makedirs(self.save_dir)

        # save train config
        train_config_path = os.path.join(self.save_dir, "train_config.json")
        with open(train_config_path, "w") as f:
            json.dump(asdict(self.config), f)

        model = self.model
        model.to(self.device)

        # initialize pre-encoder bias of sae to be the median of the dataset (Anthropic)
        median = self.get_median_of_dataset().to(self.device)
        model.set_preencoder_bias(median)

        print(median)

        # save model config
        sae_config_path = os.path.join(self.save_dir, "config.json")
        with open(sae_config_path, "w") as f:
            json.dump(model.config, f)

        # set up the optimizer
        optimizer = Adam(model.parameters(), lr=self.config.lr)

        # training loop
        iteration = 0
        pbar = tqdm(total=self.config.iterations, desc="Training ...")
        model.train()

        while iteration < self.config.iterations:
            for batch in self.dataloader:
                if iteration >= self.config.iterations:
                    break

                x = batch.to(self.device)
                loss_output = model.loss(x, self.config.lmbda)

                optimizer.zero_grad()
                loss_output.loss.backward()
                model.set_features_and_grad_to_unit_norm()
                optimizer.step()

                # log losses to tensorboard
                self.writer.add_scalar("loss", loss_output.loss.item(), iteration)
                self.writer.add_scalar(
                    "recon_loss", loss_output.recon_loss.item(), iteration
                )
                self.writer.add_scalar("l1_loss", loss_output.l1_loss.item(), iteration)

                pbar.update(1)
                pbar.set_postfix(
                    {
                        "loss": f"{loss_output.loss.item():.4f}",
                        "recon_loss": f"{loss_output.recon_loss.item():.4f}",
                        "l1_loss": f"{loss_output.l1_loss.item():.4f}",
                    }
                )
                iteration += 1

                # Checkpoint and evaluate
                if iteration % self.checkpoint_every == 0:
                    # Save the model
                    checkpoint_path = os.path.join(self.save_dir, f"sae.pth")
                    torch.save(
                        model.state_dict(),
                        checkpoint_path,
                    )
                    print(f"\nCheckpoint saved to {checkpoint_path}")

                    # Run evaluation
                    self.checkpoint(iteration)

                    model.train()

            if iteration >= self.config.iterations:
                break

        checkpoint_path = os.path.join(self.save_dir, f"sae.pth")
        torch.save(
            model.state_dict(),
            checkpoint_path,
        )

        self.writer.close()

    def get_median_of_dataset(self) -> torch.Tensor:
        data = None
        for batch in tqdm(self.dataloader, desc="Getting median of dataset"):
            if data is None:
                data = batch
            else:
                data = torch.cat((data, batch), dim=0)

        median = torch.median(data, dim=0)[0]

        return median

    def checkpoint(self, iteration: int):
        # compare recon image from recon latent to recon image from original latent
        self.log_reconstructions(iteration)

        # count dead neurons
        dead_neurons = self.get_num_dead_neurons()
        self.writer.add_scalar("dead_neurons", dead_neurons, iteration)

        l0_norm = self.get_l0_norm()
        self.writer.add_scalar("l0_norm", l0_norm, iteration)

        log_feature_density_plot = self.get_log_feature_density_plot()
        plot_tensor = transforms.ToTensor()(log_feature_density_plot)
        self.writer.add_image("log_feature_density", plot_tensor, iteration)

    @torch.no_grad()
    def log_reconstructions(self, iteration: int):
        model = self.model
        vae = self.vae
        vae.to(self.device)

        model.eval()
        vae.eval()
        with torch.no_grad():
            # Get a batch of images
            latents = torch.stack(
                [self.dataloader.dataset[i] for i in range(25)], dim=0
            ).to(self.device)

            # Reconstruct images
            original_images = vae.decode(latents.view(-1, *self.latent_shape))

            # Get reconstructed latents
            recon_latents = model(latents).recon
            recon_latents = recon_latents.view(-1, *self.latent_shape)
            recon_images_from_recon_latents = vae.decode(recon_latents)

            # Create a pyplot figure
            fig, axes = plt.subplots(5, 10, figsize=(20, 10))
            fig.suptitle(f"Original vs Reconstructed (Iteration {iteration})")

            for i in range(25):
                # Original image
                ax = axes[i // 5, (i % 5) * 2]
                img = original_images[i].cpu().permute(1, 2, 0).numpy()
                img = (img - img.min()) / (img.max() - img.min())  # Normalize to [0, 1]
                ax.imshow(img)
                ax.axis("off")
                if i < 5:
                    ax.set_title("Original")

                # Reconstructed image
                ax = axes[i // 5, (i % 5) * 2 + 1]
                img = recon_images_from_recon_latents[i].cpu().permute(1, 2, 0).numpy()
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
            self.writer.add_image("eval", plot_image, iteration)

            plt.close(fig)

    @torch.no_grad()
    def get_num_dead_neurons(self) -> int:
        model = self.model
        model.eval()
        activations = None

        for batch in tqdm(self.dataloader, desc="Counting dead neurons"):
            batch = batch.to(self.device)
            features = model(batch).latent
            sum_features = features.sum(dim=0)

            if activations is None:
                activations = sum_features
            else:
                activations += sum_features

        dead_neurons = (activations == 0).sum().item()

        return dead_neurons

    @torch.no_grad()
    def get_l0_norm(self) -> float:
        model = self.model
        model.eval()
        N = len(self.dataloader.dataset)
        l0_norm = 0

        for batch in tqdm(self.dataloader, desc="Computing L0 norm"):
            batch = batch.to(self.device)
            sparse_code = model(batch).latent
            nonzeros = (sparse_code != 0).sum()
            l0_norm += nonzeros.item()

        l0_norm /= N
        return l0_norm

    @torch.no_grad()
    def get_feature_density(self) -> torch.Tensor:
        model = self.model
        model.eval()
        feature_density = None
        N = len(self.dataloader.dataset)

        # count up total number of activations for each feature
        for batch in tqdm(self.dataloader, desc="Computing feature densities"):
            batch = batch.to(self.device)
            sparse_code = model(batch).latent
            activations = (sparse_code != 0).to(self.dtype)
            densities = activations.sum(dim=0)

            if feature_density is None:
                feature_density = densities
            else:
                feature_density += densities

        feature_density /= N  # total activations / number of samples
        return feature_density.cpu()

    def get_log_feature_density_plot(self, num_bins=25):
        eps = torch.finfo(self.dtype).eps
        feature_density = self.get_feature_density()
        log_feature_density = torch.log10(feature_density + eps)

        fig, ax = plt.subplots()
        n, bins, patches = ax.hist(log_feature_density, num_bins)
        ax.set_title("Feature Density")
        ax.set_xlabel("log10(Feature Density)")
        ax.set_ylabel("Count")
        plt.tight_layout()

        buf = BytesIO()
        plt.savefig(buf, format="png")
        plt.close(fig)

        buf.seek(0)
        img = Image.open(buf)

        return img
