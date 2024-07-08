import torch
import torch.nn as nn


class SAE(nn.Module):
    """Sparse Autoencoder from Anthropic https://transformer-circuits.pub/2023/monosemantic-features#appendix-autoencoder"""

    def __init__(self, in_features: int, num_hidden: int):
        super().__init__()

    def forward(self, x: torch.Tensor):
        pass

    def loss(self, x: torch.Tensor):
        pass
