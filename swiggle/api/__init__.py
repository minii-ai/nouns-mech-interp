from fastapi import APIRouter
from . import features, images

router = APIRouter(prefix='/api')

router.include_router(features.router, prefix="/features", tags=["features"])
router.include_router(images.router, prefix="/images", tags=["images"])

__all__ = ["router"]