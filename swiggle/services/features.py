from typing import TypedDict
import io

import torch
from PIL import Image
from torchvision.transforms import ToPILImage

from swiggle.models import SAE, VAE, FeaturesControl
from ..database import FeatureTable, Feature, BaseFeature, ReconstructedImageFeatureBucket, NounsImagesBucket
from ..dataset import NounsDataset
from typing import List

class Feature(TypedDict):
    feature_id: int
    activation: float

class FeaturesService:
    def __init__(
            self, 
            nouns_dataset: NounsDataset, 
            image_db: NounsImagesBucket,
            features_db: FeatureTable,
            feature_reconstructed_db: ReconstructedImageFeatureBucket,
            features_control: FeaturesControl
            ):
        self.image_db = image_db
        self.features_db = features_db
        self.feature_reconstructed_db = feature_reconstructed_db
        self.features_control = features_control
        self.nouns_dataset = nouns_dataset
        self.num_images = 50000


    def get_image(self, image_id:int):
        return self.image_db.get(image_id)
    
    def is_valid_image(self, image_id:int):
        return 0 <= image_id < self.num_images
    
    def get_top_k_similar_features():
        pass

    def get_feature(self, feature_id:int):
        feature = self.features_db.get(feature_id)
        feature['image'] = self.feature_reconstructed_db.get(feature_id)
        return feature
    
    def get_reconstructed_feature_image_bytes(self, feature_id):
        return self.feature_reconstructed_db.getBytes(feature_id)
    
    def get_all_features(self) -> List[BaseFeature]:
        return self.features_db.get_all()

    @torch.inference_mode()
    def get_image_features(self, image_id: int) -> List[Feature]:
        image = self.nouns_dataset[image_id]
        features = self.features_control.get_features(image)
        return features

    @torch.inference_mode()
    def modify_image(self, image_id: int, features: dict[int, float]) -> Image.Image:
        image = self.nouns_dataset[image_id]
        modified_image = self.features_control.modify_image(image, features)

        # normalize
        modified_image = torch.clamp((modified_image + 1) * 0.5, min=0, max=1)

        # convert tensor to image
        to_pil_image = ToPILImage()
        modified_image = to_pil_image(modified_image)

        return modified_image
