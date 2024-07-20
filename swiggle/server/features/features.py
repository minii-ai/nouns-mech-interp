from typing import TypedDict

import torch
from PIL import Image

from ...dataset import NounsDataset
from ...models import SAE, VAE


class Feature(TypedDict):
    feature_id: int
    activation: float


class FeaturesService:
    def __init__(self, dataset: NounsDataset, vae: VAE, sae: SAE):
        self.dataset = dataset
        self.sae = sae
        self.vae = vae

    @torch.inference_mode()
    def get_features(self, image_id: int) -> list[Feature]:
        image = self.dataset[image_id].unsqueeze(0)

        # get latent from vae
        mu, _ = self.vae.encode(image)
        latent = mu.view(1, -1)

        # get sparse features with sae
        features = self.sae.encode(latent)
        features = features.squeeze(0)

        # get nonzero activation features
        nonzero_feature_indices = torch.where(features != 0)[0]
        activations = features[nonzero_feature_indices]

        features_list = []
        for feature_id, activation in zip(nonzero_feature_indices, activations):
            features_list.append(
                {"feature_id": feature_id.int().item(), "activation": activation.item()}
            )

        # sort features by activation in descending order
        features_list = sorted(
            features_list, key=lambda x: x["activation"], reverse=True
        )

        return features_list

    @torch.inference_mode()
    def modify_features(self, image_id: int, features: dict[int, float]) -> Image.Image:
        pass
