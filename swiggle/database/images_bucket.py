from supabase import Client
from .client import create_supabase_client


class NounsImagesBucket():
    def __init__(self, client: Client):
        self.client = client
        self.bucket = client.storage.from_("NounsImage")
    
    def _filepath(self, image_id:int) -> str:
        return f"./{image_id}.png"

    def get(self, image_id: int) -> str:
        file_path = self._filepath(image_id)
        return self.bucket.create_signed_url(file_path, 3600)["signedURL"]
    
    def getBytes(self, image_id:int) -> bytes:
        file_path = self._filepath(image_id)
        file_bytes = self.bucket.download(file_path)
        return file_bytes

    def upload(self, from_path: str, destination_path: str):
        with open(from_path, "rb") as file:
            response = self.bucket.upload(destination_path, file)
        return response

if __name__ == '__main__':
    from datasets import load_dataset
    import os
    import io

    dataset = load_dataset('m1guelpf/nouns', split="train")

    client = create_supabase_client()
    image_bucket = NounsImagesBucket(client)

    local_image_dir = '../temp'
    os.makedirs(local_image_dir, exist_ok=True)

    def pil_image_to_bytes(image, format: str = "PNG") -> bytes:
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format=format)
        img_byte_arr.seek(0)
        return img_byte_arr.getvalue()


    for index, data in enumerate(dataset):
        if index <= 1112: continue

        image_content = pil_image_to_bytes(data['image'])
        
        local_image_path = os.path.join(local_image_dir, f'{index}.png')
        
        with open(local_image_path, 'wb') as f:
            f.write(image_content)
        
        # # Define the destination file path in the Supabase bucket
        # destination_filepath = f'./{index}.png'
        
        # # Upload the image to Supabase
        # image_bucket.upload(local_image_path, destination_filepath)
        # print(f"image {index} has been uploaded")

    print("All images have been downloaded and uploaded to Supabase.")




    