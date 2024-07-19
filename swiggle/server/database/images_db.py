from .client import supabase_client
from datasets import load_dataset
import base64
from io import BytesIO


class NounsImageTable:
    def __init__(self):
         self.hugging_face_db = load_dataset("m1guelpf/nouns", split="train")
         self.supabase_table = supabase_client.table("NounsImage")
         
    def add(self, nouns_image):
        return self.supabase_table.insert(nouns_image).execute()
    
    def get(self, nouns_image_id):
        try:
            combined_data = {"id": nouns_image_id}
            primary_data = self.hugging_face_db[nouns_image_id]
            combined_data['image'] = self._pil_to_base64(primary_data['image'])
            combined_data['text'] = primary_data['text']
            # secondary_data = self.supabase_table.select("*").eq("id", nouns_image_id).execute().data[0]
            # combined_data['non_zero_activations'] = secondary_data['non_zero_activations']
            return combined_data
        except: return None
    
    def _pil_to_base64(self, pil_image):
        buffer = BytesIO()
        pil_image.save(buffer, format='JPEG')
        buffer.seek(0)
        image_bytes = buffer.read()
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        return image_base64



imagesDB = NounsImageTable()

if __name__ == "__main__":
    # print(imagesDB.get(0))
    pass
