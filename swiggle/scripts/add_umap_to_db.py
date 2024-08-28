import sys
import numpy as np
import os
from tqdm import tqdm

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../"))


from database import create_client, FeatureTable

features_db = FeatureTable(
    create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
)


if __name__ == "__main__":
    umap_path = "../data/umap.npy"
    umap = np.load(umap_path)

    print(features_db)

    for feature_id, xy in tqdm(enumerate(umap), total=len(umap)):
        xy = xy[:2]
        features_db.table.update({"umap": xy.tolist()}).eq("id", feature_id).execute()

    print("Done!")
