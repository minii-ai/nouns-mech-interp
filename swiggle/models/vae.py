import json
import os

import torch
import torch.nn as nn
import torch.nn.functional as F


class Encoder(nn.Module):
    def __init__(self, in_channels: int, num_hiddens: list[int]):
        super().__init__()

        blocks = []
        for h_dim in num_hiddens:
            blocks.append(
                nn.Sequential(
                    nn.Conv2d(in_channels, h_dim, kernel_size=3, stride=2, padding=1),
                    nn.BatchNorm2d(h_dim),
                    nn.ReLU(),
                )
            )
            in_channels = h_dim

        self.encoder = nn.Sequential(*blocks)

    def forward(self, x: torch.Tensor):
        return self.encoder(x)


class Decoder(nn.Module):
    def __init__(self, num_hiddens: list[int], out_channels: int):
        super().__init__()

        blocks = []

        for i in range(len(num_hiddens) - 1):
            blocks.append(
                nn.Sequential(
                    nn.ConvTranspose2d(
                        num_hiddens[i],
                        num_hiddens[i + 1],
                        kernel_size=4,
                        stride=2,
                        padding=1,
                    ),
                    nn.BatchNorm2d(num_hiddens[i + 1]),
                    nn.ReLU(),
                )
            )

        blocks.append(
            nn.Sequential(
                nn.ConvTranspose2d(
                    num_hiddens[-1],
                    num_hiddens[-1],
                    kernel_size=4,
                    stride=2,
                    padding=1,
                ),
                nn.BatchNorm2d(num_hiddens[-1]),
                nn.ReLU(),
                nn.Conv2d(
                    num_hiddens[-1], out_channels, kernel_size=3, stride=1, padding=1
                ),
            )
        )

        self.decoder = nn.Sequential(*blocks)

    def forward(self, x: torch.Tensor):
        return self.decoder(x)


class VAE(nn.Module):
    def __init__(self, in_channels: int, num_hiddens: list[int], latent_dim: int):
        super().__init__()
        self.in_channels = in_channels
        self.num_hiddens = num_hiddens
        self.latent_dim = latent_dim

        self.encoder = Encoder(in_channels, num_hiddens)
        self.mu_logvar = nn.Conv2d(
            num_hiddens[-1], latent_dim * 2, kernel_size=1, stride=1, padding=0
        )
        self.decoder_input = nn.Conv2d(
            latent_dim, num_hiddens[-1], kernel_size=1, stride=1, padding=0
        )
        self.decoder = Decoder(list(reversed(num_hiddens)), in_channels)

    @staticmethod
    def load_from_dir(path: str):
        config_path = os.path.join(path, "config.json")
        weights_path = os.path.join(path, "vae.pth")

        return VAE.load_from_checkpoint(config_path, weights_path)

    @staticmethod
    def load_from_checkpoint(config_path: str, weights_path: str):
        with open(config_path, "r") as f:
            config = json.load(f)

        vae = VAE(**config)
        vae.load_state_dict(torch.load(weights_path, map_location=torch.device('cpu')))
        return vae

    @property
    def config(self):
        return {
            "in_channels": self.in_channels,
            "num_hiddens": self.num_hiddens,
            "latent_dim": self.latent_dim,
        }

    def sample(self, mu: torch.Tensor, logvar: torch.Tensor):
        eps = torch.randn_like(logvar)
        std = torch.exp(0.5 * logvar)
        z = mu + std * eps

        return z

    def encode(self, x: torch.Tensor):
        x = self.encoder(x)
        x = self.mu_logvar(x)
        mu, logvar = x.chunk(2, dim=1)

        return mu, logvar

    def decode(self, x: torch.Tensor):
        x = self.decoder_input(x)
        x = self.decoder(x)

        return x

    def forward(self, x: torch.Tensor):
        mu, logvar = self.encode(x)
        z = self.sample(mu, logvar)
        recon = self.decode(z)

        return {"recon": recon, "mu": mu, "logvar": logvar, "z": z}

    def loss(self, x: torch.Tensor, beta: float = 1.0):
        data = self.forward(x)
        recon_loss = F.mse_loss(data["recon"], x)
        kl_loss = torch.mean(
            -0.5
            * torch.sum(
                1 + data["logvar"] - data["mu"] ** 2 - data["logvar"].exp(),
                dim=(1, 2, 3),
            )
        )

        loss = recon_loss + beta * kl_loss

        return {
            "loss": loss,
            "recon_loss": recon_loss.detach(),
            "kl_loss": kl_loss.detach(),
        }
