from dataclasses import dataclass

import torch
import torch.nn as nn
import torch.nn.functional as F


@dataclass
class SAEOutput:
    recon: torch.Tensor
    latent: torch.Tensor


@dataclass
class SAELossOutput:
    loss: torch.Tensor
    recon_loss: torch.Tensor
    l1_loss: torch.Tensor


class SAE(nn.Module):
    """Sparse Autoencoder from Anthropic https://transformer-circuits.pub/2023/monosemantic-features#appendix-autoencoder"""

    def __init__(
        self,
        in_features: int,
        expansion_factor: int,
        dtype: torch.dtype | None = torch.float32,
    ):
        super().__init__()
        self.in_features = in_features
        self.expansion_factor = expansion_factor

        hidden_features = in_features * expansion_factor
        self.W_e = nn.Parameter(
            torch.randn((in_features, hidden_features), dtype=dtype)
        )
        self.W_d = nn.Parameter(
            torch.randn((hidden_features, in_features), dtype=dtype)
        )
        self.b_e = nn.Parameter(torch.zeros(hidden_features, dtype=dtype))
        self.b_d = nn.Parameter(torch.zeros(in_features, dtype=dtype))

        # initialization
        nn.init.kaiming_uniform_(self.W_e, mode="fan_in", nonlinearity="relu")
        nn.init.kaiming_uniform_(self.W_d, mode="fan_in", nonlinearity="relu")
        self.set_features_to_unit_norm()

    @property
    def config(self):
        return {
            "in_features": self.in_features,
            "expansion_factor": self.expansion_factor,
        }

    @property
    def features(self):
        """
        Get the features of the sparse autoencoder. Returns a (M, N) tensor where M is the number of features and N
        is the dim of each feature.
        """
        return self.W_d.data

    @torch.no_grad()
    def set_features_to_unit_norm(self):
        """
        Set the features to have unit norm
        """
        mag = self.W_d.pow(2).sum(dim=1, keepdim=True).sqrt()
        eps = torch.finfo(mag.dtype).eps

        self.W_d.data /= mag + eps

    def encode(self, x: torch.Tensor):
        x_bar = x - self.b_d
        f = F.relu(x_bar @ self.W_e + self.b_e)

        return f

    def decode(self, x: torch.Tensor):
        x = x @ self.W_d + self.b_d
        return x

    def forward(self, x: torch.Tensor) -> SAEOutput:
        f = self.encode(x)
        x_hat = self.decode(f)

        return SAEOutput(recon=x_hat, latent=f)

    def loss(self, x: torch.Tensor, lmbda: float) -> SAELossOutput:
        output = self.forward(x)
        recon_loss = F.mse_loss(output.recon, x)
        l1_loss = lmbda * output.latent.abs().sum(dim=1).mean()
        loss = recon_loss + l1_loss

        return SAELossOutput(
            loss=loss, recon_loss=recon_loss.detach(), l1_loss=l1_loss.detach()
        )
