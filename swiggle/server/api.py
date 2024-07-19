from typing import Union
from database.features_db import featuresDB
from database.images_db import imagesDB
from fastapi import FastAPI
app = FastAPI()


@app.get("/features/") # => Database
def get_all_features():
    all_features = featuresDB.get_all()
    return all_features

@app.get("/features/{feature_id}") # => Database
def get_feature(feature_id: int):
    feature = featuresDB.get(feature_id)
    return feature

@app.get("/features/{feature_id}/image") # => On Demand
def get_feature(feature_id: int):
    feature = featuresDB.get(feature_id)
    return feature
    
@app.get("images/") # => Database
def get_all_images():
#     return IMAGE_MOCK_DATA.values()
    pass

@app.get("/images/{image_id}") # => Database
def get_image(image_id: int):
    return imagesDB.get(image_id)

@app.post("/images/{image_id}/features")
def get_image(image_id: int):
    '''
    Modifies Image based on explicit Feature Adjustments
    '''
    return imagesDB.get(image_id)

@app.post("/images/{image_id}/text")
def get_image(image_id: int):
    '''
    Modifies Image based on Natural Language Text
    '''
    return imagesDB.get(image_id)



