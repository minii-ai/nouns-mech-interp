import json
import ast

import numpy as np
import pandas as pd
from supabase import Client
from client import supabase_client

from scipy.spatial.distance import cosine

from utils import deserialize_json_values, serialize_non_json_values

from sentence_transformers import SentenceTransformer

class TextEmbedder:
    def __init__(self):
        self.model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

    def encode(self, text: str):
        return self.model.encode(text).tolist()
    


class NounsFeatureTable:
    def __init__(self, supabase_client: Client):
        self.supabase_client = supabase_client
        self.table = supabase_client.table("NounsFeature")
        self.embedder = TextEmbedder()

        # NOTE: careful with user of repo might not have this file
        # ideally all the operations on this file should be done in a seperate file ie. script
        # self.descriptions = pd.read_csv("./data/descriptions.csv")

    def isEmpty(self):
        response = self.table.select("*").limit(1).execute()
        return len(response.data) == 0

    def add(self, nouns_feature, serialize=True):
        nouns_feature = (
            serialize_non_json_values(nouns_feature) if serialize else nouns_feature
        )
        if nouns_feature['description']: # embed description into vector
            description_embedding = self.embedder.encode('description')
            result['description_embedding'] = description_embedding
        result = self.table.insert(nouns_feature).execute()
        print(f'Feature {nouns_feature["id"]} was successfully added')
        return result
    

    def get(self, feature_id, columns = '*'):
        try:
            features = (self.table.select(columns).eq("id", feature_id,).execute().data)
            feature_exists = len(features) > 0; 
            if not feature_exists: return None
            result = deserialize_json_values(features[0])
            return result
        except:
            return None
    
    def get_top_k_similar(self, text: str, k: int = 5):
        query_embedding = self.embedder.encode(text)
        response = self.table.select("id, description_embedding").execute()
        embeddings = response.data
        similarities = []
        for item in embeddings:
            if item["description_embedding"] is not None:
                description_embedding = ast.literal_eval(item['description_embedding'])
                similarity = 1 - self._cosine_similarity(query_embedding, description_embedding)
                similarities.append((item["id"], similarity))
        similarities.sort(key=lambda x: x[1], reverse=True)
        top_k = similarities[:k]
        return top_k

    def get_all(self):
        features = self.table.select("id", "description", "pca").limit(2).execute().data
        result = [(deserialize_json_values(feature)) for feature in features]
        return result

    def _add_json_file(self, json_dir):
        with open(json_dir, "r") as f:
            json_features = f.read()
        features = json.loads(json_features)["features"]
        for feature in features:
            if self._get_is_dead_status_from_csv(feature["id"]):
                continue
            feature["description"] = self._get_description_from_csv(feature["id"])
            feature["activations"] = self._create_denisity_histogram(
                feature["activations"]
            )
            self.add(feature)

    def _create_denisity_histogram(self, activations, num_buckets=20):
        mean = np.mean(list(activations.values()))
        std = np.std(list(activations.values()))

        # Define the range for the buckets
        min_activation = mean - 3 * std
        max_activation = mean + 3 * std

        # Initialize the histogram buckets
        bucket_width = (max_activation - min_activation) / num_buckets
        buckets = [
            {"activation": min_activation + i * bucket_width, "count": 0}
            for i in range(num_buckets)
        ]

        # Iterate through activations and count them in the respective buckets
        for image_id, activation in activations.items():
            bucket_index = int((activation - min_activation) / bucket_width)
            if 0 <= bucket_index < num_buckets:
                buckets[bucket_index]["count"] += 1
            elif bucket_index >= num_buckets:
                buckets[-1]["count"] += 1
        return {
            "buckets": buckets,
            "mean": mean,
            "std": std,
            "bucket_width": bucket_width,
        }

    def _get_description_from_csv(self, feature_id):
        row = self.descriptions[self.descriptions["Feature Index"] == feature_id]
        return row["Explanation"].to_list()[0]

    def _get_is_dead_status_from_csv(self, feature_id):
        row = self.descriptions[self.descriptions["Feature Index"] == feature_id]
        dead_feature = row["Dead (T/F)"].to_list()[0]
        return dead_feature == 1
    
    def _cosine_similarity(self, vec1, vec2):
        vec1 = np.array(vec1, dtype=float)
        vec2 = np.array(vec2, dtype=float)
        
        dot_product = np.dot(vec1, vec2)
        norm_vec1 = np.linalg.norm(vec1)
        norm_vec2 = np.linalg.norm(vec2)
        
        if norm_vec1 == 0 or norm_vec2 == 0:
            return 0.0
        
        return dot_product / (norm_vec1 * norm_vec2)


if __name__ == "__main__":
     print(NounsFeatureTable(supabase_client).get_top_k_similar('Hotdog'))
