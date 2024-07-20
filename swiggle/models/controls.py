import torch

from .sae import SAE
from .vae import VAE


class FeaturesControl:
    def __init__(self, vae: VAE, sae: SAE, latent_shape: tuple[int]):
        self.vae = vae
        self.sae = sae
        self.latent_shape = latent_shape

    @torch.no_grad()
    def _get_sae_features_from_image(self, image: torch.Tensor) -> torch.Tensor:
        image = image.unsqueeze(0)
        mu, _ = self.vae.encode(image)
        latent = mu.view(1, -1)
        features = self.sae.encode(latent).view(-1)

        return features

    @torch.inference_mode()
    def get_features(self, image: torch.Tensor) -> torch.Tensor:
        features = self._get_sae_features_from_image(image)
        feature_indices = torch.where(features != 0)
        activations = features[feature_indices]

        features_list = []

        for i in range(activations.shape[0]):
            features_list.append(
                {
                    "feature_id": int(feature_indices[0][i].item()),
                    "activation": activations[i].item(),
                }
            )

        features_list = sorted(
            features_list, key=lambda x: x["activation"], reverse=True
        )

        return features_list

    @torch.inference_mode()
    def modify_image(self, image: torch.Tensor, new_features: dict):
        features = self._get_sae_features_from_image(image)
        features_indices = torch.tensor(list(new_features.keys()), dtype=torch.int32)
        activations = torch.tensor(list(new_features.values()), dtype=torch.float32)

        features[features_indices] = activations
        features = features.view(1, -1)
        latent = self.sae.decode(features)
        latent = latent.view(-1, *self.latent_shape)
        modified_image = self.vae.decode(latent).squeeze(0)

        return modified_image
