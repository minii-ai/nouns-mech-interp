import torch

from .sae import SAE
from .vae import VAE


class FeaturesControl:
    def __init__(
        self, sae: SAE, vae: VAE, latent_shape: tuple, device: torch.device = "cpu"
    ):
        sae.eval()
        vae.eval()

        self.sae = sae
        self.vae = vae
        self.latent_shape = latent_shape
        self.device = device

    @torch.no_grad()
    def _get_sae_features_from_image(self, image: torch.Tensor) -> torch.Tensor:
        image = image.unsqueeze(0).to(self.device)
        mu, _ = self.vae.encode(image)
        latent = mu.view(1, -1)
        features = self.sae.encode(latent).view(-1)

        return features

    @torch.no_grad()
    def get_features(self, image: torch.Tensor) -> dict[int, float]:
        """
        Returns a dict mapping feature indices to their activation values, excluding zero activations.
        """
        features = self._get_sae_features_from_image(image)

        # get the indices of all features with non zero activations
        nonzero_activations_indices = torch.where(features != 0)[0]
        nonzero_activations = features[nonzero_activations_indices]

        features_list = []

        for i in range(nonzero_activations.shape[0]):
            features_list.append(
                {
                    "feature_id": int(nonzero_activations_indices[i].item()),
                    "activation": nonzero_activations[i].item(),
                }
            )

        features_list = sorted(
            features_list, key=lambda x: x["activation"], reverse=True
        )

        return features_list

    @torch.no_grad()
    def modify_image(self, image: torch.Tensor, new_features: dict) -> torch.Tensor:
        """
        Params:
            - image: (C, H, W) image to modify
            - features: list of features to modify in the form of (feature_index, value)
        """
        features = self._get_sae_features_from_image(image)
        features_indices = torch.tensor(list(new_features.keys()), dtype=torch.int32)
        activations = torch.tensor(list(new_features.values()), dtype=torch.float32)

        features[features_indices] = activations
        features = features.view(1, -1)
        latent = self.sae.decode(features)
        latent = latent.view(-1, *self.latent_shape)
        modified_image = self.vae.decode(latent).squeeze(0)

        return modified_image
