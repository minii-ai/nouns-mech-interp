from fastapi import APIRouter, HTTPException, Response, Request
from typing import List
from PIL import Image
from ..services import features_service
import io
from io import BytesIO
import base64
from fastapi.responses import JSONResponse

router = APIRouter()


def convert_keys_to_int(dictionary):
    return {int(key): value for key, value in dictionary.items()}


def pil_image_to_bytes(image: Image, format: str = "PNG") -> bytes:
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format=format)
    img_byte_arr.seek(0)
    return img_byte_arr.getvalue()


def pil_image_to_base64(image: Image) -> str:
    buffered = BytesIO()
    image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")


@router.get("/{image_id}")
def get_image(image_id: int):
    """Gets a Nouns Dataset Image via ID"""
    if not features_service.is_valid_image(image_id):
        raise HTTPException(status_code=404, detail=f"image_id {image_id} not found")
    url = features_service.get_image(image_id)
    features = features_service.get_image_features(image_id)
    image_data = {"url": url, "features": features}
    return {"image": image_data}


@router.post(
    "/{image_id}/features",
    responses={200: {"content": {"image/png": {}}}},
    response_class=Response,
)
async def modify_image(image_id: int, request: Request):
    """
    Modifies activations of features of an image and returns modified image
    """
    if not features_service.is_valid_image(image_id):
        raise HTTPException(status_code=400, detail=f"image_id {image_id} not found")

    body = await request.json()
    features = body["features"]
    features_dict = {
        int(feature["feature_id"]): feature["activation"] for feature in features
    }
    modified_image = features_service.modify_image(image_id, features_dict)
    modified_image_bytes = pil_image_to_bytes(modified_image)
    return Response(
        content=modified_image_bytes, media_type="image/png", status_code=200
    )


@router.post(
    "/{image_id}/features",
    responses={200: {"content": {"image/png": {}}}},
    response_class=Response,
)
async def modify_image(image_id: int, request: Request):
    """
    Modifies activations of features of an image and returns modified image
    """
    if not features_service.is_valid_image(image_id):
        raise HTTPException(status_code=400, detail=f"image_id {image_id} not found")

    body = await request.json()
    features = body["features"]
    features_dict = {
        int(feature["feature_id"]): feature["activation"] for feature in features
    }
    modified_image = features_service.modify_image(image_id, features_dict)
    modified_image_bytes = pil_image_to_bytes(modified_image)
    return Response(
        content=modified_image_bytes, media_type="image/png", status_code=200
    )


@router.post(
    "/{image_id}/text",
    responses={200: {"content": {"application/json": {}}}},
    response_class=JSONResponse,
)
async def get_image(image_id: int, request: Request):
    """
    Modifies Image based on Natural Language Text
    """
    # text = 'Bell Head'
    print("[IFNO] Request")

    try:
        body = await request.json()
        text = body["text"]
        print("it worked")
        adjustments = body["feature_adjustments"] or {}
    except:
        print("it failed")
        text = "Bell Head"
        adjustments = {}

    print("helloooooooo")
    print("[INFO] Text: ", text)

    feature_adjustments = adjustments
    # Remove most active feature
    max_activated_feature = max(
        features_service.get_image_features(image_id),
        key=lambda feature: feature["activation"],
    )
    feature_adjustments[max_activated_feature["feature_id"]] = 0

    print("got here")
    # Increase features similar to text
    features = features_service.get_top_k_similar_features(text, 1)
    for feature in features:
        feature_adjustments[feature["id"]] = feature["max_activation"]

    feature_adjustments = convert_keys_to_int(feature_adjustments)

    print(feature_adjustments)

    # Modify image
    modified_image = features_service.modify_image(image_id, feature_adjustments)
    modified_image_base64 = pil_image_to_base64(modified_image)

    # Build Ouput
    response_data = {
        "image_id": image_id,
        "feature_adjustments": feature_adjustments,
        "modified_image": modified_image_base64,
    }

    return JSONResponse(content=response_data, status_code=200)
