import argparse
import os
import sys

import torch
import torchvision.transforms as transforms
from tqdm import tqdm

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../"))

from vae_interp.sae import SAE
from vae_interp.vae import VAE


def parse_args():
    parser = argparse.ArgumentParser(
        description="Process VAE and SAE checkpoints and embeddings."
    )

    parser.add_argument("--latent_shape", type=str, required=True)
    parser.add_argument(
        "--vae_checkpoint",
        type=str,
        required=True,
        help="Path to the VAE checkpoint file",
    )

    parser.add_argument(
        "--vae_embeddings",
        type=str,
        required=True,
        help="Path to the VAE embeddings .npy file",
    )

    parser.add_argument(
        "--sae_checkpoint",
        type=str,
        required=True,
        help="Path to the SAE checkpoint file",
    )

    parser.add_argument(
        "--output_dir", type=str, required=True, help="Directory to save output files"
    )

    return parser.parse_args()


def main(args):
    os.makedirs(args.output_dir, exist_ok=True)
    latent_shape = [int(dim) for dim in args.latent_shape.split(",")]
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # load vae
    vae = VAE.load_from_dir(args.vae_checkpoint)
    vae.eval()
    vae.to(device)

    # load sae
    sae_config_path = os.path.join(args.sae_checkpoint, "sae_config.json")
    sae_weights_path = os.path.join(args.sae_checkpoint, "sae.pth")
    sae = SAE.load_from_checkpoint(sae_config_path, sae_weights_path)
    sae.eval()
    sae.to(device)

    batch_size = 256
    num_features = sae.features.shape[0]
    to_image = transforms.ToPILImage()

    with torch.no_grad():
        for i in tqdm(range(0, num_features, batch_size)):
            # decode features into image tensors
            batch_features = (
                sae.features[i : i + batch_size].view(-1, *latent_shape).to(device)
            )  # [b, d] -> [b, ...latent_shape]

            decoded = vae.decode(batch_features).cpu()

            # convert image tensors into images
            for decoded_tensor, idx in zip(decoded, range(i, i + batch_size)):
                save_path = os.path.join(args.output_dir, f"{idx}.png")
                image = to_image(decoded_tensor)
                image.save(save_path)


if __name__ == "__main__":
    args = parse_args()
    main(args)
