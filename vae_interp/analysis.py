from dataclasses import dataclass

import torch
from torch.utils.data import DataLoader
from tqdm import tqdm

from .sae import SAE


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

    # make each row represent a feature
    activations = activations.T

    # [D] activation density for each feature
    binary_activations = (activations != 0).float()
    activation_density = torch.sum(binary_activations, dim=1) / activations.shape[0]

    # get top k samples for each feature
    topk_result = torch.topk(activations, k=top_k, dim=1)
    topk_indices = topk_result.indices
    topk_activations = topk_result.values

    return ActivationsInfo(
        activations_per_feature=activations,
        activation_density_per_feature=activation_density,
        top_k_indices_per_feature=topk_indices,
        top_k_activations_per_feature=topk_activations,
    )
