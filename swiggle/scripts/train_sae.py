import argparse
import os
import sys

import torch
from torch.utils.data import DataLoader

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../"))


from vae_interp.dataset import NpyDataset
from vae_interp.sae import SAE
from vae_interp.trainer import SAETrainConfig, SAETrainer


def parse_args():
    parser = argparse.ArgumentParser(description="SAE Training Arguments")

    # Model parameters
    parser.add_argument(
        "--in_features", type=int, required=True, help="Number of input features"
    )
    parser.add_argument(
        "--expansion_factor",
        type=int,
        required=True,
        help="Expansion factor for hidden features",
    )

    # Training parameters
    parser.add_argument(
        "--lr", type=float, default=0.001, help="Learning rate (default: 0.001)"
    )
    parser.add_argument(
        "--iterations", type=int, required=True, help="Number of training iterations"
    )
    parser.add_argument(
        "--batch_size", type=int, default=32, help="Batch size (default: 32)"
    )
    parser.add_argument(
        "--lambda_l1",
        type=float,
        default=1e-3,
        help="L1 regularization strength (default: 1e-3)",
    )

    parser.add_argument(
        "--vae_embeddings_path",
        type=str,
        required=True,
        help="Path to vae embeddings .npy file",
    )

    # Save and logging parameters
    parser.add_argument(
        "--save_dir",
        type=str,
        required=True,
        help="Directory to save the trained model and logs",
    )
    parser.add_argument(
        "--checkpoint_every",
        type=int,
        default=1000,
        help="Save checkpoint and run evaluation every N iterations (default: 1000)",
    )

    # Hardware parameters
    parser.add_argument(
        "--device",
        type=str,
        default="cuda" if torch.cuda.is_available() else "cpu",
        help="Device to run the training on (default: cuda if available, else cpu)",
    )

    return parser.parse_args()


def main(args):
    dataset = NpyDataset(args.vae_embeddings_path)
    dataloader = DataLoader(
        dataset,
        batch_size=args.batch_size,
        shuffle=True,
        pin_memory=True,
        num_workers=4,
    )

    sae = SAE(
        in_features=args.in_features,
        expansion_factor=args.expansion_factor,
        dtype=torch.float32,
    )

    train_config = SAETrainConfig(
        lr=args.lr,
        iterations=args.iterations,
        lmbda=args.lambda_l1,
    )
    trainer = SAETrainer(
        model=sae,
        dataloader=dataloader,
        config=train_config,
        save_dir=args.save_dir,
        checkpoint_every=args.checkpoint_every,
        device=args.device,
    )

    trainer.train()


if __name__ == "__main__":
    args = parse_args()
    main(args)
