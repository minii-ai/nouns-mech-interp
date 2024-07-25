from supabase import Client
from typing import List
from .types import Feature, BaseFeature, SerializedFeature, SupabaseResponseFeature
import json
import ast


def serializer(obj: Feature) -> SerializedFeature:
    if isinstance(obj, dict):
        return {k: serializer(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        if all(isinstance(item, int) for item in obj):
            return obj
        else:
            return [serializer(item) for item in obj]
    elif hasattr(obj, '__dict__'):
        return serializer(obj.__dict__)
    else:
        return obj
    
def deserializer(obj: SupabaseResponseFeature) -> Feature:
        vector_attrs = ['description_embedding'] #TODO: Move vector and pca to vector_attrs
        json_attrs = ['top_k_images', 'similar_features', 'activations', 'vector', 'pca',]
        result = {}
        for k,v in obj.items():
            if k in vector_attrs: result[k] = ast.literal_eval(v)
            elif k in json_attrs: result[k] = json.loads(v)
            else: result[k] = v
        return result 

class FeatureTable():
    def __init__(self, client: Client):
        self.client = client
        self.table = client.table("NounsFeature")

    def add(self, feature: Feature) -> None:
        serialized_feature:SerializedFeature = serializer(feature)
        self.table.insert(serialized_feature).execute()
        print(f'Feature {feature["id"]} was successfully added')

    def get(self, feature_id:int) -> Feature:
        features = (self.table.select("id", "description", "pca", "top_k_images", "activations", "activation_density").eq("id", feature_id).execute().data)
        feature_exists = len(features) > 0; 
        if not feature_exists: return None
        return deserializer(features[0])
    
    def get_all(self) -> List[BaseFeature]:
        features = self.table.select("id", "description", "pca").execute().data
        result = [(deserializer(feature)) for feature in features]
        return result


if __name__ == '__main__':
    pass
    
      
