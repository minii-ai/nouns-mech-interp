import base64
import io
import json
from typing import Union

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from .database import imagesDB
from .services import (features_db, features_service, image_feature_bucket,
                       nouns_dataset, sae)

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow specified origins
    allow_credentials=True,  # Allow cookies and credentials
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


def pil_image_to_bytes(image: Image, format: str = "PNG") -> bytes:
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format=format)
    img_byte_arr.seek(0)
    return img_byte_arr.getvalue()


def pil_image_to_base64(image):
    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return img_str


@app.get("/api/features/")
def get_all_features():
    """
    Gets id, description, and pca of a feature
    """
    all_features = features_db.get_all()
    count = len(all_features)
    return {"features": all_features, "count": count}


@app.get("/api/features/{feature_id}")
def get_feature(feature_id: int, request: Request):
    """
    Gets id, description, pca, top k images, activations, and activation density
    for a feature with id `feature_id`
    """
    feature = features_db.get(feature_id)
    if not feature:
        raise HTTPException(status_code=404, detail=f"Feature {feature_id} not found")

    # HACKY
    # move to using cdn https://supabase.com/docs/guides/storage/serving/downloads
    feature_image_url = image_feature_bucket.get_url(feature_id)
    feature["image"] = feature_image_url

    similar_features = []
    for similar_feature in feature["similar_features"]:
        similar_feature["image"] = image_feature_bucket.get_url(
            similar_feature["feature_id"]
        )
        similar_features.append(similar_feature)

    feature["similar_features"] = similar_features

    return {"feature": feature}


@app.get("/api/features/{feature_id}/image")
def get_feature(feature_id: int):
    """
    Returns the image as base64 string (use CDN for this?)
    """
    try:
        image = image_feature_bucket.get(feature_id, format="bytes")
        return Response(content=image, media_type="image/png", status_code=200)
    except:
        raise HTTPException(status_code=404, detail=f"Feature {feature_id} not found")


# upload all images to bucket
@app.get("/images/{image_id}")  # => Database
def get_image(image_id: int):
    return imagesDB.get(image_id)


@app.get("/api/images/{image_id}")
async def get_image_data(image_id: int):
    valid_image_id = 0 <= image_id < len(nouns_dataset)
    if not valid_image_id:
        raise HTTPException(status_code=404, detail=f"image_id {image_id} not found")

    data = nouns_dataset.dataset[image_id]
    features = features_service.get_features(image_id)

    features_list = []
    for feature in features:
        feature["image"] = image_feature_bucket.get_url(feature["feature_id"])
        features_list.append(feature)

    base64_image = pil_image_to_base64(data["image"])
    image_data = {
        "features": features,
        "text": data["text"],
        "base64": base64_image,
    }

    return {"image": image_data}


@app.post(
    "/api/images/{image_id}/features",
)
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
    # modified_image_bytes = pil_image_to_bytes(modified_image)
    base64_image = pil_image_to_base64(modified_image)

    return {"base64": base64_image}

    # return Response(
    #     content=modified_image_bytes, media_type="image/png", status_code=200
    # )


@app.post("/images/{image_id}/text")  # => On Demand
def get_image(image_id: int):
    """
    Modifies Image based on Natural Language Text
    """
    # TODO: Implement
