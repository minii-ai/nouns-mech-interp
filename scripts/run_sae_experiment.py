import argparse
import asyncio
import itertools
import os
import sys
from dataclasses import dataclass

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
        "--lr",
        type=str,
        default="0.001",
        help="List of learning rates (default: 0.001)",
    )
    parser.add_argument(
        "--iterations", type=int, required=True, help="Number of training iterations"
    )
    parser.add_argument(
        "--batch_size", type=int, default=32, help="Batch size (default: 32)"
    )
    parser.add_argument(
        "--lambda_l1",
        type=str,
        default="1e-3",
        help="List of l1 regularization strength (default: 1e-3)",
    )

    parser.add_argument(
        "--vae_embeddings_path",
        type=str,
        required=True,
        help="Path to vae embeddings .npy file",
    )

    parser.add_argument(
        "--concurrent_experiments",
        type=int,
        default=3,
        help="Number of concurrent experiments",
    )

    # Save and logging parameters
    parser.add_argument(
        "--save_dir",
        type=str,
        required=True,
        help="Directory to save the experiment",
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


@dataclass
class ExperimentConfig:
    lr: float
    l1_weight: float
    iterations: int
    dataloader: DataLoader


async def experiment_worker(queue: asyncio.Queue):
    await asyncio.sleep(1)

    print("Done!")


async def run_experiment():
    pass


async def main(args):
    lrs = [float(lr) for lr in args.lr.split(",")]
    l1_weights = [float(l1_weight) for l1_weight in args.lambda_l1.split(",")]
    configs = list(itertools.product(lrs, l1_weights))

    # load dataset
    dataset = NpyDataset(args.vae_embeddings_path)
    dataloader = DataLoader(
        dataset,
        batch_size=args.batch_size,
        shuffle=True,
        num_workers=4,
        pin_memory=True,
    )

    # put jobs in the queue
    queue = asyncio.Queue()
    for config in configs:
        experiment_config = ExperimentConfig(
            lr=config[0],
            l1_weight=config[1],
            iterations=args.iterations,
            dataloader=dataloader,
        )
        await queue.put(experiment_config)

    workers = []
    for i in range(args.concurrent_experiments):
        worker = asyncio.create_task(experiment_worker(queue))
        workers.append(worker)

    await queue.join()


if __name__ == "__main__":
    args = parse_args()
    asyncio.run(main(args))
