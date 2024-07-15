from client import supabase_client

class NounsImageTable:
    def __init__(self):
         self.table = supabase_client.table("NounsImage")

    def add(self, nouns_image):
        return self.table.insert(nouns_image).execute()
    
    def get(self, nouns_image_id):
        return self.table.select("*").eq("id", nouns_image_id).execute()

imagesDB = NounsImageTable()