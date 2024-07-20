import io
import json
from typing import Union

from fastapi import FastAPI, HTTPException, Request, Response
from PIL import Image

# from .database import featuresDB, imageFeaturesBucket, imagesDB
from .database import imagesDB
from .services import features_db, features_service, image_feature_bucket, nouns_dataset

app = FastAPI()


def pil_image_to_bytes(image: Image, format: str = "PNG") -> bytes:
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format=format)
    img_byte_arr.seek(0)
    return img_byte_arr.getvalue()


@app.get("/features/")  # => Database
def get_all_features():
    """
    Gets id, description
    """
    all_features = features_db.get_all(deserialize=False)
    return all_features


@app.get("/features/{feature_id}")  # => Database
def get_feature(feature_id: int):
    """
    Gets id, description, pca, top k images, activations, and activation density
    for a feature with id `feature_id`
    """

    feature = features_db.get(feature_id)
    return feature


@app.get("/features/{feature_id}/image")  # => Database
def get_feature(feature_id: int):
    """
    Returns the image as base64 string (use CDN for this?)
    """
    return image_feature_bucket.get(feature_id)


@app.get("/images/{image_id}")  # => Database
def get_image(image_id: int):
    return imagesDB.get(image_id)


@app.get("/images/{image_id}/features")
async def get_image_features(image_id: int):
    """
    Returns the features sorted by activation in descending order for image_id
    """
    valid_image_id = 0 <= image_id < len(nouns_dataset)
    if not valid_image_id:
        raise HTTPException(status_code=404, detail=f"image_id {image_id} not found")

    features = features_service.get_features(image_id)
    return {"image_id": image_id, "features": features}


@app.post(
    "/images/{image_id}/features",
    responses={200: {"content": {"image/png": {}}}},
    response_class=Response,
)  # => On Demand
async def get_image(image_id: int, request: Request):
    """
    Modifies image given new features
    """
    valid_image_id = 0 <= image_id < len(nouns_dataset)
    if not valid_image_id:
        raise HTTPException(status_code=400, detail=f"image_id {image_id} not found")

    body = await request.json()
    features = body["features"]
    features_dict = {}

    for feature in features:
        feature_id = int(feature["feature_id"])
        activation = feature["activation"]
        features_dict[feature_id] = activation

    modified_image = features_service.modify_image(image_id, features_dict)
    modified_image_bytes = pil_image_to_bytes(modified_image)

    return Response(
        content=modified_image_bytes, media_type="image/png", status_code=200
    )


@app.post("/images/{image_id}/text")  # => On Demand
def get_image(image_id: int):
    """
    Modifies Image based on Natural Language Text
    """
    # TODO: Implement
