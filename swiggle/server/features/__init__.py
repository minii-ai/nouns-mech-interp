from typing import TypedDict

import torch
from PIL import Image
from torchvision.transforms import ToPILImage

from swiggle.dataset import NounsDataset
from swiggle.models import SAE, VAE, FeaturesControl


class Feature(TypedDict):
    feature_id: int
    activation: float


class FeaturesService:
    def __init__(self, dataset: NounsDataset, features_control: FeaturesControl):
        self.dataset = dataset
        self.features_control = features_control

    @torch.inference_mode()
    def get_features(self, image_id: int) -> list[Feature]:
        image = self.dataset[image_id]
        features = self.features_control.get_features(image)
        return features

    @torch.inference_mode()
    def modify_image(self, image_id: int, features: dict[int, float]) -> Image.Image:
        image = self.dataset[image_id]
        modified_image = self.features_control.modify_image(image, features)

        # normalize
        modified_image = torch.clamp((modified_image + 1) * 0.5, min=0, max=1)

        # convert tensor to image
        to_pil_image = ToPILImage()
        modified_image = to_pil_image(modified_image)

        return modified_image
