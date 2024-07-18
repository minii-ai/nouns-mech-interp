from typing import Union
from database.features_db import featuresDB
from database.images_db import imagesDB
from fastapi import FastAPI
app = FastAPI()


@app.get("/features/")
def get_all_features():
    all_features = featuresDB.get_all()
    return all_features

@app.get("/features/{feature_id}")
def get_feature(feature_id: int):
    feature = featuresDB.get(feature_id)
    return feature

@app.post('/adjust_feature/')
def adjust_feature(image_id: int, feature_id: int, activation:int):
    # for image_features in FEATURE_IMAGE_MOCK_DATA.values():
    #     if image_features['image_id'] == image_id and image_features['feature_id'] == feature_id:
    #         image_features['activation'] = activation
    #         break
    # return IMAGE_MOCK_DATA[image_id]
    pass
    
@app.get("images/")
def get_all_images():
#     return IMAGE_MOCK_DATA.values()
    pass

@app.get("/images/{image_id}")
def get_image(image_id: int):
    return imagesDB.get(image_id)


