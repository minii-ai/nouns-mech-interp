import sys
import os
import argparse
import os
import torch
import numpy as np
import umap
import matplotlib.pyplot as plt


sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../"))

from models.sae import SAE


def compute_umap_embeddings(
    sae_checkpoint, save_path, n_neighbors=15, min_dist=0.1, n_components=2
):
    # Load the SAE model
    sae_config_path = os.path.join(sae_checkpoint, "config.json")
    sae_weights_path = os.path.join(sae_checkpoint, "sae.pth")
    sae = SAE.load_from_checkpoint(sae_config_path, sae_weights_path)
    sae.eval()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    sae.to(device)

    # Get the SAE features
    features = sae.features.cpu().detach().numpy()

    # Compute UMAP embeddings
    reducer = umap.UMAP(
        n_neighbors=n_neighbors,
        min_dist=min_dist,
        n_components=n_components,
        random_state=42,
    )
    embeddings = reducer.fit_transform(features)

    # Generate colors using a colormap
    cmap = plt.get_cmap("viridis")
    colors = cmap(np.linspace(0, 1, len(embeddings)))

    # Combine embeddings and colors
    combined = np.hstack((embeddings, colors))

    # Save combined embeddings and colors as a .npy file
    np.save(save_path, combined)
    print(f"UMAP embeddings with colors saved to {save_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Compute UMAP embeddings from SAE features."
    )
    parser.add_argument(
        "--sae_checkpoint",
        type=str,
        required=True,
        help="Path to the directory of the SAE model checkpoint.",
    )
    parser.add_argument(
        "--save_path",
        type=str,
        required=True,
        help="Path to save the UMAP embeddings as a .npy file.",
    )

    args = parser.parse_args()

    compute_umap_embeddings(args.sae_checkpoint, args.save_path, n_neighbors=15)
