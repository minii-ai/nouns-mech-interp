from supabase import Client
from .client import create_supabase_client
from sentence_transformers import SentenceTransformer

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
    from PIL import Image
    import os
    import io

    # Load the Hugging Face dataset
    dataset = load_dataset('m1guelpf/nouns', split="train")

    # Initialize Supabase client and image bucket
    client = create_supabase_client()
    image_bucket = NounsImagesBucket(client)

    # Create a local directory to store downloaded images
    local_image_dir = '../temp'
    os.makedirs(local_image_dir, exist_ok=True)

    def pil_image_to_bytes(image, format: str = "PNG") -> bytes:
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format=format)
        img_byte_arr.seek(0)
        return img_byte_arr.getvalue()

    def resize_image(image: Image, max_size=(128, 128)):
        return image.resize(max_size, Image.LANCZOS)

    for index, data in enumerate(dataset):
        if index <= 2835: continue

        # Convert dataset image to PIL image
        pil_image = data['image']
        
        # Resize the image
        resized_image = resize_image(pil_image)
        
        # Convert the resized image to bytes
        image_content = pil_image_to_bytes(resized_image)
        
        # Save the resized image locally (optional)
        local_image_path = os.path.join(local_image_dir, f'{index}.png')
        with open(local_image_path, 'wb') as f:
            f.write(image_content)
        
        # # Define the destination file path in the Supabase bucket
        # destination_filepath = f'./{index}.png'
        
        # # Upload the image to Supabase
        # image_bucket.upload(local_image_path, destination_filepath)
        print(f"Image {index} has been uploaded")

    print("All images have been resized, downloaded, and uploaded to Supabase.")






    