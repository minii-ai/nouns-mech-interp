from supabase import Client
from typing import List
from .types import Feature, BaseFeature, SerializedFeature, SupabaseResponseFeature
import json
import numpy as np

DEFAULT_SELECTION = ["id",
                "description",
                "pca",
                "umap",
                "top_k_images",
                "activations",
                "similar_features",
                "activation_density"]

def deserializer(obj: SupabaseResponseFeature) -> Feature:
    vector_attrs = [
        "description_embedding",
        "vector",
        "pca",
    ]  # TODO: Move vector and pca to vector_attrs
    result = {}
    for k, v in obj.items():
        if k in vector_attrs:
            if v:
                result[k] = json.loads(v)
            else:
                result[k] = []
        else:
            result[k] = v
    return result


def create_denisity_histogram(activations, num_buckets=20):
    mean = np.mean(list(activations.values()))
    std = np.std(list(activations.values()))
    # Define the range for the buckets
    min_activation = mean - 2 * std
    max_activation = mean + 2 * std
    # Initialize the histogram buckets
    bucket_width = (max_activation - min_activation) / num_buckets
    buckets = [
        {"activation": min_activation + i * bucket_width, "count": 0}
        for i in range(num_buckets)
    ]
    # Iterate through activations and count them in the respective buckets
    for _, activation in activations.items():
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


class FeatureTable:
    def __init__(self, client: Client):
        self.client = client
        self.table = client.table("NounsFeature")

    def add(self, feature: Feature) -> None:
        self.table.insert(feature).execute()
        print(f'Feature {feature["id"]} was successfully added')

    def get(self, feature_id: int, selection=[]) -> Feature:
        features = (
            self.table.select(*selection if selection else DEFAULT_SELECTION)
            .eq("id", feature_id)
            .execute()
            .data
        )
        feature_exists = len(features) > 0
        if not feature_exists:
            return None
        return deserializer(features[0])

    def get_all(self) -> List[BaseFeature]:
        features = (
            self.table.select(
                "id",
                "description",
                "pca",
                "umap",
                "max_activation",
                "description_embedding",
            )
            .execute()
            .data
        )
        result = [(deserializer(feature)) for feature in features]
        return result


if __name__ == "__main__":

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

        with open(file_path, "r") as file:
            featuresObj = json.load(file)
        features = featuresObj["features"]
        table = FeatureTable(client)

        for feature in features:
            description = feature["description"]
            if description:
                feature["description_embedding"] = list(
                    map(
                        lambda x: float(x), text_embedder.encode(feature["description"])
                    )
                )
                feature["max_activation"] = max(feature["activations"].values())
                feature["activations"] = create_denisity_histogram(
                    feature["activations"]
                )
            try:
                table.add(feature)
            except Exception as e:
                print(f'Feature {feature["id"]} already exists.')
                continue

        print(f"All features have been uploaded")

    add_features_from_json("./features.json")
