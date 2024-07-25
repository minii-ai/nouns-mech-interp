import argparse
import json
import os
import sys

import torch
from tqdm import tqdm

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../"))

from vae_interp.analysis import (
    get_activations_info,
    get_features_pca2,
    get_similar_features,
)
from vae_interp.dataset import NpyDataset
from vae_interp.sae import SAE


def parse_args():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--sae_checkpoint", type=str, required=True, help="Path to SAE checkpoint"
    )
    parser.add_argument("--vae_embeddings_path", type=str, required=True)
    parser.add_argument(
        "--output_path", type=str, required=True, help="Path to output json file"
    )
    parser.add_argument("--k", type=int, default=9, help="Number of top k images")

    args = parser.parse_args()
    return args


def main(args):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # load sae
    sae_config_path = os.path.join(args.sae_checkpoint, "config.json")
    sae_weights_path = os.path.join(args.sae_checkpoint, "sae.pth")
    sae = SAE.load_from_checkpoint(sae_config_path, sae_weights_path)
    sae.to(device)
    sae.eval()

    # dataset
    vae_embeddings_dataset = NpyDataset(args.vae_embeddings_path)

    # compute stats for each feature
    similar_features = get_similar_features(sae, args.k)
    activations_info = get_activations_info(
        sae, vae_embeddings_dataset, batch_size=256, top_k=args.k, device=device
    )
    features_pca2 = get_features_pca2(sae)

    num_features = sae.num_features
    features = sae.features
    sae.to("cpu")

    features_list = []

    for feature_id in tqdm(range(num_features)):
        feature_vector = features[feature_id].tolist()

        top_k_images = []
        for i, activation in zip(
            activations_info.top_k_indices_per_feature[feature_id],
            activations_info.top_k_activations_per_feature[feature_id],
        ):
            top_k_images.append({"image_id": i.item(), "activation": activation.item()})

        top_k_similar_features = []
        for i, cosine_similarity in zip(
            similar_features.top_k_indices_per_feature[feature_id],
            similar_features.top_k_cosine_sim_per_feature[feature_id],
        ):
            top_k_similar_features.append(
                {"feature_id": i.item(), "cosine_similarity": cosine_similarity.item()}
            )

        activation_per_feature = activations_info.activations_per_feature[
            feature_id
        ].tolist()

        activation_sparse = {}
        for i, activation in enumerate(activation_per_feature):
            if activation != 0:
                activation_sparse[i] = activation

        activation_density = activations_info.activation_density_per_feature[
            feature_id
        ].item()

        pca = features_pca2[feature_id].tolist()

        feature = {
            "id": feature_id,
            "description": None,
            "vector": feature_vector,
            "top_k_images": top_k_images,
            "similar_features": top_k_similar_features,
            "activations": activation_sparse,
            "activation_density": activation_density,
            "pca": pca,
        }

        features_list.append(feature)

    data = {"features": features_list}

    with open(args.output_path, "w") as f:
        json.dump(data, f, indent=4)


if __name__ == "__main__":
    args = parse_args()
    main(args)
