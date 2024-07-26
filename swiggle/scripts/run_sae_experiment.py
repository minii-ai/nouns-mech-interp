import argparse
import asyncio
import itertools
import os
import sys
import time
from dataclasses import dataclass

import torch

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../"))


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
    parser.add_argument("--activation", default="ReLU", help="Activation function")

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
        "--k", type=str, default="10", help="List of top k activation parameter"
    )
    parser.add_argument(
        "--lambda_l1",
        type=str,
        default="1e-3",
        help="List of l1 regularization strength (default: 1e-3)",
    )

    parser.add_argument(
        "--vae_checkpoint", type=str, required=True, help="Path to vae checkpoint"
    )

    parser.add_argument(
        "--vae_embeddings_path",
        type=str,
        required=True,
        help="Path to vae embeddings .npy file",
    )

    parser.add_argument(
        "--latent_shape",
        type=str,
        required=True,
        help="VAE latent shape",
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

    parser.add_argument("--seed", type=int, default=0, help="Random seed")

    return parser.parse_args()


@dataclass
class ExperimentConfig:
    in_features: int
    expansion_factor: int
    lr: float
    l1_weight: float
    batch_size: int
    iterations: int
    save_dir: str
    checkpoint_every: int
    vae_embeddings_path: str
    vae_checkpoint: str
    latent_shape: str
    activation: str
    k: int | None
    seed: int


async def experiment_worker(queue: asyncio.Queue):
    while True:
        config = await queue.get()

        if config.k is not None:
            print(f"[INFO] Running Experiment | lr={config.lr}, k={config.k}")
        else:
            print(f"[INFO] Running Experiment | lr={config.lr}, l1={config.l1_weight}")

        await run_experiment(config)
        queue.task_done()

        if config.k is not None:
            print(f"[INFO] Experiment Done | lr={config.lr}, k={config.k}")
        else:
            print(f"[INFO] Experiment Done | lr={config.lr}, l1={config.l1_weight}")


def create_command(script: str, args: dict) -> str:
    command_parts = [f"python {script}"]
    for key, value in args.items():
        if isinstance(value, bool):
            if value:
                command_parts.append(f"--{key}")
        else:
            if value:
                command_parts.append(f"--{key}={value}")
    return " ".join(command_parts)


async def run_experiment(config: ExperimentConfig):
    command = create_command(
        "train_sae.py",
        {
            "in_features": config.in_features,
            "expansion_factor": config.expansion_factor,
            "lr": config.lr,
            "iterations": config.iterations,
            "batch_size": config.batch_size,
            "lambda_l1": config.l1_weight,
            "save_dir": config.save_dir,
            "vae_embeddings_path": config.vae_embeddings_path,
            "vae_checkpoint": config.vae_checkpoint,
            "checkpoint_every": config.checkpoint_every,
            "latent_shape": config.latent_shape,
            "activation": config.activation,
            "k": config.k,
            "seed": config.seed,
        },
    )

    process = await asyncio.create_subprocess_shell(command, stdout=None, stderr=None)

    await process.wait()

    print(f"Exit code: {process.returncode}")


def scientific_notation(num):
    return "{:.1e}".format(num)


async def main(args):
    lrs = [float(lr) for lr in args.lr.split(",")]
    l1_weights = [float(l1_weight) for l1_weight in args.lambda_l1.split(",")]
    ks = [int(k) for k in args.k.split(",")]

    use_topk = args.activation == "TopK"

    if use_topk:
        configs = list(itertools.product(lrs, ks))
    else:
        configs = list(itertools.product(lrs, l1_weights))

    print(configs)

    os.makedirs(args.save_dir, exist_ok=True)

    # put jobs in the queue
    queue = asyncio.Queue()
    for config in configs:
        lr_label = scientific_notation(config[0])

        if args.activation == "TopK":
            k_label = config[1]
            experiment_dir = os.path.join(args.save_dir, f"lr={lr_label}_k={k_label}")
        else:
            l1_label = scientific_notation(config[1])
            experiment_dir = os.path.join(args.save_dir, f"lr={lr_label}_l1={l1_label}")

        l1_weight = 0 if use_topk else config[1]
        k = config[1] if use_topk else None
        experiment_config = ExperimentConfig(
            in_features=args.in_features,
            expansion_factor=args.expansion_factor,
            lr=config[0],
            l1_weight=l1_weight,
            batch_size=args.batch_size,
            iterations=args.iterations,
            save_dir=experiment_dir,
            vae_embeddings_path=args.vae_embeddings_path,
            vae_checkpoint=args.vae_checkpoint,
            checkpoint_every=args.checkpoint_every,
            latent_shape=args.latent_shape,
            activation=args.activation,
            k=k,
            seed=args.seed,
        )
        await queue.put(experiment_config)

    # create workers
    workers = []
    for i in range(args.concurrent_experiments):
        worker = asyncio.create_task(experiment_worker(queue))
        workers.append(worker)

    started_at = time.monotonic()
    await queue.join()
    total_time = time.monotonic() - started_at

    # cancel workers after queue is empty
    for worker in workers:
        worker.cancel()

    await asyncio.gather(*workers, return_exceptions=True)

    print("[INFO] All Experiments Ran!")
    print(f"[INFO] Total Time: {total_time:.2f} seconds")


if __name__ == "__main__":
    args = parse_args()
    asyncio.run(main(args))
