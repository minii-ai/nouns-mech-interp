import os
from dataclasses import dataclass

import matplotlib.pyplot as plt
import numpy as np
import torch
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from tensorboard.backend.event_processing import event_accumulator
from torch.utils.data import DataLoader
from tqdm import tqdm

from .sae import SAE


class SAEExperimentsResults:
    def __init__(self, experiments_dir: str):
        self.experiments_dir = experiments_dir
        self.experiments = {}

        for experiment_name in tqdm(os.listdir(experiments_dir)):
            experiment_dir = os.path.join(experiments_dir, experiment_name)
            if os.path.isdir(experiment_dir):
                log_dir = os.path.join(experiment_dir, "logs")
                ea = event_accumulator.EventAccumulator(
                    log_dir,
                    size_guidance={
                        event_accumulator.SCALARS: 10000,
                        event_accumulator.IMAGES: 0,
                    },
                )
                ea.Reload()
                self.experiments[experiment_name] = {
                    "experiment_dir": experiment_dir,
                    "log_dir": log_dir,
                    "events": ea,
                }

        self.loss_tag = "loss"
        self.recon_loss_tag = "recon_loss"
        self.l1_loss_tag = "l1_loss"

    def plot_losses(self):
        fig, axs = plt.subplots(1, 3, figsize=(15, 5))

        loss_tags = [
            self.loss_tag,
            self.recon_loss_tag,
            self.l1_loss_tag,
        ]

        for ax, tag in zip(axs, loss_tags):
            for experiment_name, data in self.experiments.items():
                loss = [e.value for e in data["events"].Scalars(tag)]
                steps = [e.step for e in data["events"].Scalars(tag)]
                ax.semilogy(steps, loss, label=experiment_name)

            ax.set_title(tag)
            ax.set_xlabel("Iteration")
            ax.set_ylabel("Log Loss")
            ax.legend()

    def plot_l0_norms(self):
        fig, ax = plt.subplots(1, 1, figsize=(15, 5))

        for experiment_name, data in self.experiments.items():
            l0_norms = [e.value for e in data["events"].Scalars("l0_norm")]
            steps = [e.step for e in data["events"].Scalars("l0_norm")]
            ax.plot(steps, l0_norms, label=experiment_name)

        ax.set_title("l0_norm")
        ax.set_xlabel("Iteration")
        ax.set_ylabel("l0_norm")
        ax.legend()

    @torch.no_grad()
    def plot_feature_density_histogram(
        self, dataset, batch_size: int = 128, bins: int = 35
    ):
        # for each experiment, load sae, compute feature density
        fig, ax = plt.subplots(1, 1, figsize=(15, 5))

        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        for experiment_name, data in self.experiments.items():
            experiment_dir = data["experiment_dir"]
            config_path = os.path.join(experiment_dir, "sae_config.json")
            weights_path = os.path.join(experiment_dir, "sae.pth")

            sae = SAE.load_from_checkpoint(config_path, weights_path)
            sae.eval()
            sae.to(device)

            activations_info = get_activations_info(sae, dataset, batch_size, top_k=1)
            eps = torch.finfo(activations_info.activation_density_per_feature.dtype).eps
            log_activation_density_per_feature = torch.log10(
                activations_info.activation_density_per_feature + eps
            )

            ax.hist(
                log_activation_density_per_feature,
                bins=bins,
                label=experiment_name,
                histtype="step",
            )

        ax.legend()
        ax.set_title("Feature Density Histogram")
        ax.set_xlabel("log10(Activation Density)")
        ax.set_ylabel("Count")

    def plot_dead_features(self, dataset, batch_size: int = 128):
        fig, ax = plt.subplots(1, 1, figsize=(15, 5))
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        columns = []
        values = []
        for experiment_name, data in self.experiments.items():
            experiment_dir = data["experiment_dir"]
            config_path = os.path.join(experiment_dir, "sae_config.json")
            weights_path = os.path.join(experiment_dir, "sae.pth")

            sae = SAE.load_from_checkpoint(config_path, weights_path)
            sae.eval()
            sae.to(device)

            activations_info = get_activations_info(sae, dataset, batch_size, top_k=1)
            dead_neurons = activations_info.dead_neurons

            columns.append(experiment_name)
            values.append(dead_neurons)

        ax.bar(columns, values)
        ax.set_title("Dead Neurons")
        ax.set_ylabel("# of Dead Neurons")
        ax.set_xlabel("Experiment Config")


@dataclass
class SimilarFeatures:
    k: int
    top_k_indices_per_feature: torch.Tensor
    top_k_cosine_sim_per_feature: torch.Tensor


@dataclass
class ActivationsInfo:
    activations_per_feature: torch.Tensor
    activation_density_per_feature: torch.Tensor
    top_k_indices_per_feature: torch.Tensor
    top_k_activations_per_feature: torch.Tensor
    mean_activation_per_feature: torch.Tensor
    max_activation_per_feature: torch.Tensor
    variance_activation_per_feature: torch.Tensor
    dead_neurons: int


@torch.no_grad()
def get_similar_features(sae: SAE, k: int):
    sae.eval()
    num_features = len(sae.features)

    # normalize every feature to unit length
    features_norm = sae.features / torch.linalg.norm(sae.features, dim=1, keepdim=True)

    # get pairwise cosine similarity b/w every feature
    cosine_similarity = features_norm @ features_norm.T

    # get the top k + 1 most similar features for each feature
    topk_plus1 = torch.topk(cosine_similarity, k=k + 1, dim=1)
    feature_indices = torch.arange(0, num_features, device=sae.features.device).view(
        -1, 1
    )

    # exclude the feature itself
    topk_indices = topk_plus1.indices[topk_plus1.indices != feature_indices].view(
        num_features, k
    )

    topk_cosine_sim = topk_plus1.values[topk_plus1.indices != feature_indices].view(
        num_features, k
    )

    return SimilarFeatures(
        k=k,
        top_k_indices_per_feature=topk_indices,
        top_k_cosine_sim_per_feature=topk_cosine_sim,
    )


@torch.no_grad()
def get_activations_info(
    sae: SAE, dataset, batch_size: int, top_k: int, device: torch.device = "cpu"
):
    sae.eval()
    sae.to(device)
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=False)

    # [N, D] N = # of samples, D = # of features (dim of sparse embedding)
    activations = None

    for batch in tqdm(dataloader):
        batch = batch.to(device)
        batch_activations = sae.encode(batch).cpu()
        if activations is None:
            activations = batch_activations
        else:
            activations = torch.cat([activations, batch_activations], dim=0)

    # make each row represent a feature [D, N]
    activations = activations.T

    # [D] activation density for each feature
    binary_activations = (activations != 0).float()
    activation_density = torch.sum(binary_activations, dim=1) / activations.shape[1]
    dead_neurons = activation_density[activation_density == 0].shape[0]

    # mean activations
    mean_activations_per_feature = activations.mean(dim=1)

    # max activations
    max_activations_per_feature = activations.max(dim=1).values

    # variance activations
    variance_activations_per_feature = activations.var(dim=1)

    # get top k samples for each feature
    topk_result = torch.topk(activations, k=top_k, dim=1)
    topk_indices = topk_result.indices
    topk_activations = topk_result.values

    return ActivationsInfo(
        activations_per_feature=activations,
        activation_density_per_feature=activation_density,
        top_k_indices_per_feature=topk_indices,
        top_k_activations_per_feature=topk_activations,
        mean_activation_per_feature=mean_activations_per_feature,
        max_activation_per_feature=max_activations_per_feature,
        variance_activation_per_feature=variance_activations_per_feature,
        dead_neurons=dead_neurons,
    )


@torch.no_grad()
def get_features_pca2(sae: SAE) -> np.ndarray:
    scaler = StandardScaler()
    pca = PCA(n_components=2)

    features = sae.features.cpu().numpy()
    features_scaled = scaler.fit_transform(features)
    features_pca = pca.fit_transform(features_scaled)

    return features_pca
