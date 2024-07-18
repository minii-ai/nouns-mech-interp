import argparse
import os
import sys

import numpy as np
import torch
from torch.utils.data import DataLoader
from tqdm import tqdm

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../"))

from vae_interp.dataset import load_nouns_dataset
from vae_interp.vae import VAE


def parse_args():
    parser = argparse.ArgumentParser(
        description="Process VAE checkpoint and create output NPY file"
    )
    parser.add_argument(
        "--checkpoint", type=str, required=True, help="Path to the VAE checkpoint file"
    )
    parser.add_argument(
        "--output", type=str, required=True, help="Path to the output NPY file"
    )
    parser.add_argument(
        "--batch_size",
        type=int,
        default=256,
    )

    return parser.parse_args()


def main(args):
    assert args.output.endswith(".npy"), "Output file must be an NPY file"

    # load vae
    config_path = os.path.join(args.checkpoint, "config.json")
    weights_path = os.path.join(args.checkpoint, "vae.pth")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    vae = VAE.load_from_checkpoint(config_path, weights_path)
    vae.to(device)
    vae.eval()

    # load dataset
    dataset = load_nouns_dataset(image_size=64, normalize=True)
    dataloader = DataLoader(
        dataset,
        batch_size=args.batch_size,
        shuffle=False,
        pin_memory=True,
        num_workers=4,
    )

    # create encodings
    embeddings = []

    with torch.no_grad():
        for batch in tqdm(dataloader):
            batch = batch.to(device)
            mu, logvar = vae.encode(batch)
            B = mu.shape[0]
            batch_embedding = mu.view(B, -1)
            embeddings.append(batch_embedding.cpu().numpy())

    embeddings = np.concatenate(embeddings, axis=0)

    # save embeddings to output file
    np.save(args.output, embeddings)

    print("Done!")


if __name__ == "__main__":
    args = parse_args()
    main(args)
