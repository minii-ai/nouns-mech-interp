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
        features = (self.table.select("id", "description", "pca", "top_k_images", "activations", "similar_features", "activation_density").eq("id", feature_id).execute().data)
        feature_exists = len(features) > 0; 
        if not feature_exists: return None
        return deserializer(features[0])
    
    def get_all(self) -> List[BaseFeature]:
        features = self.table.select("id", "description", "pca", "description_embedding").execute().data
        result = [(deserializer(feature)) for feature in features]
        return result


if __name__ == '__main__':

    def add_features_from_json(file_path):
        import os
        from dotenv import load_dotenv
        from supabase import create_client
        from sentence_transformers import SentenceTransformer

        load_dotenv()
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        client = create_client(url, key)

        text_embedder = SentenceTransformer("all-MiniLM-L6-v2")

        with open(file_path, 'r') as file:
            features = json.load(file)
        table = FeatureTable(client)

        for feature in features:
            description = feature["description"]
            if description:
                feature["description_embedding"] = text_embedder(feature["description"])
            table.add(feature)
            print(f'Feature {feature["id"]} has been uploaded')
        print(f'All features have been uploaded')

    
      
