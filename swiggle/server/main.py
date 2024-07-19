from typing import Union
from database import featuresDB, imagesDB, imageFeaturesBucket
from fastapi import FastAPI
import json
app = FastAPI()


@app.get("/features/") # => Database
def get_all_features():
    all_features = featuresDB.get_all(deserialize=False)
    return all_features

@app.get("/features/{feature_id}") # => Database
def get_feature(feature_id: int):
    feature = featuresDB.get(feature_id)
    return feature

@app.get("/features/{feature_id}/image") # => Database
def get_feature(feature_id: int):
    return imageFeaturesBucket.get(feature_id)
    
@app.get("/images/{image_id}") # => Database
def get_image(image_id: int):
    return imagesDB.get(image_id)

@app.post("/images/{image_id}/features") # => On Demand
def get_image(image_id: int):
    '''
    Modifies Image based on explicit Feature Adjustments
    '''
    return imagesDB.get(image_id)

@app.post("/images/{image_id}/text") # => On Demand
def get_image(image_id: int):
    '''
    Modifies Image based on Natural Language Text
    '''
    return imagesDB.get(image_id)

if __name__ == '__main__':
    get_feature(1)


