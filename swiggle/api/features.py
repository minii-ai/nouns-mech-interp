from fastapi import APIRouter, HTTPException, Request, Response
from typing import List
from ..services import features_service

router = APIRouter()

@router.get("/")
def get_all_features():
    """
    Gets id, description, and pca of a feature
    """
    all_features = features_service.get_all_features()
    count = len(all_features)
    return {"features": all_features, "count": count}


@router.get("/{feature_id}")
def get_feature(feature_id: int, request: Request):
    """
    Gets id, description, pca, top k images, activations, image, and activation density
    for a feature with id `feature_id`
    """
    feature = features_service.get_feature(feature_id)
    return {"feature": feature}


@router.get("/{feature_id}/image")
def get_reconstructed_feature_image(feature_id: int):
    """
    Returns the image as base64 string (use CDN for this?)
    """
    try:
        image = features_service.get_reconstructed_feature_image_bytes(feature_id)
        return Response(content=image, media_type="image/png", status_code=200)
    except:
        raise HTTPException(status_code=404, detail=f"Feature {feature_id} not found")