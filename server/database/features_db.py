from client import supabase_client

class NounsFeatureTable:
    def __init__(self):
        self.table = supabase_client.table("NounsFeature")

    def add(self, nouns_feature):
        return self.table.insert(nouns_feature).execute()
    
    def get(self, nouns_feature_id):
        return self.table.select("*").eq("id", nouns_feature_id).execute()

featuresDB = NounsFeatureTable()