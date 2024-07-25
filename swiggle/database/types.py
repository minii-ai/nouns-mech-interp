from dataclasses import dataclass
from typing import List, Union
import json

@dataclass
class FeatureActivation:
    id: int
    activation: float

@dataclass
class FeatureSimilarity:
    id: int
    cosine_similarity: float

@dataclass
class FeatureActivationsBucket:
    activation: float
    count: float

@dataclass
class FeatureActivationsHistogramData:
    buckets: List[FeatureActivationsBucket]
    mean: float
    std: float
    bucket_width: float

@dataclass 
class BaseFeature(object):
    id: int
    description: str
    pca: List[float]

@dataclass 
class ExtraFeatureInfo(object):
    vector: List[float]
    top_k_images: List[FeatureActivation]
    similar_features: List[FeatureSimilarity]
    activations: FeatureActivationsHistogramData
    activation_density: float
    description_embedding: List[float]

Feature = Union[BaseFeature, ExtraFeatureInfo]

@dataclass
class SerializedFeature(object):
    id: int
    description: str
    vector: List[float]
    pca: List[float]
    top_k_images: json
    similar_features: json
    activations: json
    activation_density: float
    description_embedding: List[float]

@dataclass
class SupabaseResponseFeature(object):
    id: int
    description: str
    vector: str
    pca: str
    top_k_images: str
    similar_features: str
    activations: str
    activation_density: float
    description_embedding: str
