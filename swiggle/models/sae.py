import json
from dataclasses import dataclass
from typing import Callable

import torch
import torch.nn as nn
import torch.nn.functional as F


@dataclass
class SAEOutput:
    recon: torch.Tensor
    latent: torch.Tensor


def build_sae(
    in_features: int, expansion_factor: int, activation: str = "ReLU", k: int = None
) -> "SAE":
    assert k is not None or activation != "TopK"

    if activation == "TopK":
        activation_fn = ACTIVATIONS[activation](k)
    else:
        activation_fn = ACTIVATIONS[activation]()

    return SAE(
        in_features=in_features,
        expansion_factor=expansion_factor,
        activation=activation_fn,
    )


class SAE(nn.Module):
    """
    Sparse Autoencoder from Anthropic https://transformer-circuits.pub/2023/monosemantic-features#appendix-autoencoder
    and OpenAI (https://openai.com/index/extracting-concepts-from-gpt-4/)
    """

    def __init__(
        self,
        in_features: int,
        expansion_factor: int,
        activation: Callable = nn.ReLU(),
        dtype: torch.dtype | None = torch.float32,
    ):
        super().__init__()
        self.in_features = in_features
        self.expansion_factor = expansion_factor
        self.activation = activation

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


    @staticmethod
    def load_from_checkpoint(config_path: str, weights_path: str):
        with open(config_path, "r") as f:
            config = json.load(f)

        sae = build_sae(**config)
        sae.load_state_dict(torch.load(weights_path, map_location=torch.device("cpu")))
        return sae

    @property
    def config(self):
        return {
            "in_features": self.in_features,
            "expansion_factor": self.expansion_factor,
            "activation": self.activation.__class__.__name__,
            "k": self.activation.k if hasattr(self.activation, "k") else None,
        }

    @property
    def num_features(self):
        return self.W_d.shape[0]

    @property
    def features(self):
        """
        Get the features of the sparse autoencoder. Returns a (M, N) tensor where M is the number of features and N
        is the dim of each feature.
        """
        return self.W_d.data

    @torch.no_grad()
    def set_preencoder_bias(self, bias: torch.Tensor):
        self.b_d.data = bias

    def get_unit_features(self):
        """
        Get the features of the sparse autoencoder with unit norm.
        """
        mag = self.W_d.norm(dim=1, keepdim=True)  # [N, 1]
        eps = torch.finfo(mag.dtype).eps
        norm_W_d = self.W_d / (mag + eps)  # [N, D]

        return norm_W_d

    @torch.no_grad()
    def set_features_and_grad_to_unit_norm(self):
        """
        Set the features to have unit norm and remove parallel component of the gradient.
        """
        # https://github.com/neelnanda-io/1L-Sparse-Autoencoder/blob/main/utils.py#L135
        norm_W_d = self.get_unit_features()

        # project gradient onto unit features [N, D]
        W_d_grad_proj = (self.W_d.grad * norm_W_d).sum(dim=-1, keepdim=True) * norm_W_d

        self.W_d.grad -= W_d_grad_proj  # remove parallel component of the gradient
        self.W_d.data = norm_W_d

    def encode(self, x: torch.Tensor):
        x_bar = x - self.b_d
        f = self.activation(x_bar @ self.W_e + self.b_e)

        return f

    def decode(self, x: torch.Tensor):
        x = x @ self.W_d + self.b_d
        return x

    def forward(self, x: torch.Tensor) -> SAEOutput:
        f = self.encode(x)
        x_hat = self.decode(f)

        return SAEOutput(recon=x_hat, latent=f)


# https://github.com/openai/sparse_autoencoder/blob/main/sparse_autoencoder/model.py
class TopK(nn.Module):
    def __init__(self, k: int, postact_fn: Callable = nn.ReLU()) -> None:
        super().__init__()
        self.k = k
        self.postact_fn = postact_fn

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        topk = torch.topk(x, k=self.k, dim=-1)
        values = self.postact_fn(topk.values)
        # make all other values 0
        result = torch.zeros_like(x)
        result.scatter_(-1, topk.indices, values)
        return result


ACTIVATIONS = {
    "ReLU": nn.ReLU,
    "TopK": TopK,
}
