import argparse
import math
import os
import sys

import torch
from PIL import Image
from tqdm import tqdm

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../"))

import matplotlib.pyplot as plt
from torchvision.transforms import ToPILImage
from analysis import get_activations_info
from dataset import NpyDataset, load_nouns_dataset
from models.sae import SAE
from utils import make_image_grid
from models.vae import VAE


def parse_args():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--sae_checkpoint", type=str, required=True, help="Path to SAE checkpoint"
    )
    parser.add_argument(
        "--vae_checkpoint", type=str, required=True, help="Path to VAE checkpoint"
    )
    parser.add_argument("--vae_embeddings_path", type=str, required=True)
    parser.add_argument(
        "--output_dir", type=str, required=True, help="Path to output directory"
    )
    parser.add_argument(
        "--decoded_features_dir",
        type=str,
        required=True,
        help="Path to decoded features directory",
    )
    parser.add_argument("--k", type=int, default=9, help="Number of top k images")

    args = parser.parse_args()
    return args


@torch.no_grad()
def main(args):
    os.makedirs(args.output_dir, exist_ok=True)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # load vae
    vae = VAE.load_from_dir(args.vae_checkpoint)
    vae.eval()
    vae.to(device)

    # load sae
    sae_config_path = os.path.join(args.sae_checkpoint, "config.json")
    sae_weights_path = os.path.join(args.sae_checkpoint, "sae.pth")
    sae = SAE.load_from_checkpoint(sae_config_path, sae_weights_path)
    sae.eval()
    sae.to(device)

    # load datasets
    vae_embeddings_dataset = NpyDataset(args.vae_embeddings_path)
    nouns_dataset = load_nouns_dataset(image_size=64)

    num_features = sae.num_features
    to_image = ToPILImage()

    activations_info = get_activations_info(
        sae, vae_embeddings_dataset, batch_size=256, top_k=args.k, device="cuda"
    )

    for feature_idx in tqdm(range(num_features)):
        features_dir = os.path.join(args.output_dir, str(feature_idx))
        os.makedirs(features_dir, exist_ok=True)

        # get decoded feature image
        feature_image_path = os.path.join(
            args.decoded_features_dir, f"{feature_idx}.png"
        )
        feature_image = Image.open(feature_image_path)

        # get top k images w/ highest feature activation
        rows = cols = math.ceil(args.k**0.5)
        topk_image_indices = activations_info.top_k_indices_per_feature[feature_idx]
        topk_images_tensor = [
            (nouns_dataset[i.item()] + 1) * 0.5 for i in topk_image_indices
        ]
        topk_images = [to_image(image) for image in topk_images_tensor]
        topk_images_grid = make_image_grid(topk_images, rows, cols)

        # ablation -> remove feature and get decoded image
        latents = torch.stack(
            [vae_embeddings_dataset[i.item()] for i in topk_image_indices]
        )
        sparse_encoding = sae.encode(latents.to(device))
        sparse_encoding[:, feature_idx] = 0
        recon_latent = sae.decode(sparse_encoding).view(-1, 4, 4, 4)
        recon_images = vae.decode(recon_latent).cpu()
        recon_images_list = [
            to_image((image - image.min()) / (image.max() - image.min()))
            for image in recon_images
        ]
        ablations = make_image_grid(recon_images_list, rows, cols)

        # get text descriptions of top k images
        text_descriptions = [
            nouns_dataset.get_text(i.item()) for i in topk_image_indices
        ]

        # plot features, topk, and ablations
        fig, axes = plt.subplots(1, 3, figsize=(15, 5))
        images = [feature_image, topk_images_grid, ablations]
        titles = ["Feature", "Top K Images", "Ablations"]

        for i, (img, ax) in enumerate(zip(images, axes)):
            ax.imshow(img)

            # Set title if provided
            if titles and i < len(titles):
                ax.set_title(titles[i])

            # Remove axes ticks
            ax.set_xticks([])
            ax.set_yticks([])

        # save feature image
        feature_save_path = os.path.join(features_dir, "feature.png")
        feature_image.save(feature_save_path)

        # save top k images
        topk_save_path = os.path.join(features_dir, "topk.png")
        topk_images_grid.save(topk_save_path)

        # save ablations
        ablations_save_path = os.path.join(features_dir, "ablations.png")
        ablations.save(ablations_save_path)

        # save figure
        save_path = os.path.join(features_dir, "feature_topk_ablations.png")
        plt.savefig(save_path)

        # save text descriptions
        text_save_path = os.path.join(features_dir, "descriptions.txt")
        with open(text_save_path, "w") as f:
            for text in text_descriptions:
                f.write(f"{text}\n")


if __name__ == "__main__":
    args = parse_args()
    main(args)
