from client import supabase_client
from utils import serialize_non_json_values, deserialize_json_values
import json
import numpy as np

class NounsFeatureTable:
    def __init__(self):
        self.table = supabase_client.table("NounsFeature")        

    def isEmpty(self):
        response = self.table.select('*').limit(1).execute()
        return len(response.data) == 0
        
    def add(self, nouns_feature, serialize = True):
        nouns_feature = serialize_non_json_values(nouns_feature) if serialize else nouns_feature
        result = self.table.insert(nouns_feature).execute()
        print(f'Feature {nouns_feature["id"]} was successfully added')
        return result

    def get(self, nouns_feature_id, deserialize = True):
        feature = self.table.select("*").eq("id", nouns_feature_id).execute().data[0]
        result = deserialize_json_values(feature) if deserialize else feature
        return result
    
    def get_all(self, deserialize = True):
        features = self.table.select("*").execute().data
        result = [deserialize_json_values(feature) if deserialize else feature for feature in features]
        return result
    
    def _add_json_file(self, json_dir):
        with open(json_dir, 'r') as f:
            json_features = f.read()
        features = json.loads(json_features)['features']
        for feature in features:
            feature["activations"] = self.create_denisity_histogram(feature['activations'])
            featuresDB.add(feature)
            
    def _create_denisity_histogram(self, activations, num_buckets = 20):
        mean = np.mean(list(activations.values()))
        std = np.std(list(activations.values()))

        # Define the range for the buckets
        min_activation = mean - 3 * std
        max_activation = mean + 3 * std

        # Initialize the histogram buckets
        bucket_width = (max_activation - min_activation) / num_buckets
        buckets = [{'activation': min_activation + i * bucket_width, 'count': 0} for i in range(num_buckets)]

        # Iterate through activations and count them in the respective buckets
        for image_id, activation in activations.items():
            bucket_index = int((activation - min_activation) / bucket_width)
            if 0 <= bucket_index < num_buckets:
                buckets[bucket_index]['count'] += 1
            elif bucket_index >= num_buckets:
                buckets[-1]['count'] += 1
        return buckets

featuresDB = NounsFeatureTable()


if __name__ == "__main__":
    FEATURES_DIR = '../data/features.json'
    # if featuresDB.isEmpty(): featuresDB.add_json_file(FEATURES_DIR)
    print(featuresDB.get_all())
