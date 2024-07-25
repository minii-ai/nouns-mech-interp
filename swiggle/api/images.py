from fastapi import APIRouter, HTTPException, Response, Request
from typing import List
from PIL import Image
from ..services import features_service
import io

router = APIRouter()

def pil_image_to_bytes(image: Image, format: str = "PNG") -> bytes:
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format=format)
    img_byte_arr.seek(0)
    return img_byte_arr.getvalue()


@router.get("/{image_id}")
def get_image(image_id: int):
    ''' Gets a Nouns Dataset Image via ID '''
    if not features_service.is_valid_image(image_id):
        raise HTTPException(status_code=404, detail=f"image_id {image_id} not found")
    url = features_service.get_image(image_id)
    features = features_service.get_image_features(image_id)
    image_data = { "url": url , "features": features}
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
    features_dict = {feature["feature_id"]: feature["activation"] for feature in features }
    modified_image = features_service.modify_image(image_id, features_dict)
    modified_image_bytes = pil_image_to_bytes(modified_image)
    return Response(
        content=modified_image_bytes, 
        media_type="image/png", 
        status_code=200
    )


@router.post(
    "/{image_id}/text",
    responses={200: {"content": {"image/png": {}}}},
    response_class=Response,
)
async def get_image(image_id: int, request:Request):
    """
    Modifies Image based on Natural Language Text
    """
    body = await request.json()
    text = body["text"]
    feature_ids = features_service.get_top_k_similar_features(text)

    features_dict = {}
    for feature_id in feature_ids:
        features_dict[feature_id] = 2

    modified_image = features_service.modify_image(image_id, features_dict)
    modified_image_bytes = pil_image_to_bytes(modified_image)
    return Response(
        content=modified_image_bytes, media_type="image/png", status_code=200
    )
    