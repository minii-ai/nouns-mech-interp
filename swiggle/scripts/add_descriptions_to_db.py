import sys
import numpy as np
import os
from tqdm import tqdm
import pandas as pd

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../"))


from database import create_client, FeatureTable

features_db = FeatureTable(
    create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
)


def update_descriptions(csv_path):
    # Read the CSV file into a DataFrame
    df = pd.read_csv(csv_path)

    # Iterate over each row in the CSV
    for index, row in tqdm(df.iterrows(), total=len(df)):
        feature_id = row["FeatureId"]
        description = row["Explanation"] if pd.notna(row["Explanation"]) else "unclear"

        # Update the description in Supabase based on the FeatureID
        features_db.table.update({"description": description}).eq(
            "id", feature_id
        ).execute()


if __name__ == "__main__":
    umap_path = "../data/umap.npy"
    umap = np.load(umap_path)

    print(features_db)

    update_descriptions("../data/features.csv")

    print("Done!")
