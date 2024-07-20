import json
from typing import Union

from fastapi import FastAPI, HTTPException

from .database import featuresDB, imageFeaturesBucket, imagesDB
from .services import features_service, nouns_dataset

app = FastAPI()


@app.get("/features/")  # => Database
def get_all_features():
    all_features = featuresDB.get_all(deserialize=False)
    return all_features


@app.get("/features/{feature_id}")  # => Database
def get_feature(feature_id: int):
    feature = featuresDB.get(feature_id)
    return feature


@app.get("/features/{feature_id}/image")  # => Database
def get_feature(feature_id: int):
    return imageFeaturesBucket.get(feature_id)


@app.get("/images/{image_id}")  # => Database
def get_image(image_id: int):
    return imagesDB.get(image_id)


@app.get("/images/{image_id}/features")
async def get_image_features(image_id: int):
    valid_image_id = 0 <= image_id < len(nouns_dataset)
    if not valid_image_id:
        raise HTTPException(status_code=404, detail=f"image_id {image_id} not found")

    features = features_service.get_features(image_id)
    return {"image_id": image_id, "features": features}


@app.post("/images/{image_id}/features")  # => On Demand
def get_image(image_id: int):
    """
    Modifies Image based on explicit Feature Adjustments
    """
    return imagesDB.get(image_id)


@app.post("/images/{image_id}/text")  # => On Demand
def get_image(image_id: int):
    """
    Modifies Image based on Natural Language Text
    """
    return imagesDB.get(image_id)
