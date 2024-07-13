import argparse
import os


def parse_args():
    parser = argparse.ArgumentParser(
        description="Process VAE and SAE checkpoints and embeddings."
    )

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
    print(args)


if __name__ == "__main__":
    args = parse_args()
    main(args)
