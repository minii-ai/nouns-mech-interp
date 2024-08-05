import base64
from supabase import Client

class ReconstructedImageFeatureBucket():
    def __init__(self, client: Client):
        self.client = client
        self.bucket = client.storage.from_("ReconstructedFeatureImages")
    
    def _filepath(self, feature_id:int) -> str:
        return f"./{feature_id}.png"

    def get(self, feature_id: int) -> str:
        file_path = self._filepath(feature_id)
        return self.bucket.create_signed_url(file_path, 3600)["signedURL"]
    
    def getBytes(self, feature_id:int) -> bytes:
        file_path = self._filepath(feature_id)
        file_bytes = self.bucket.download(file_path)
        return file_bytes

    def upload(self, file_path: str, destination_path: str):
        with open(file_path, "rb") as file:
            response = self.bucket.upload(destination_path, file)
        return response

if __name__ == '__main__':
    def upload_reconstructed_images_from_dir(directory, num_features=2048):
        import os
        from dotenv import load_dotenv
        from supabase import create_client

        load_dotenv()
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        client = create_client(url, key)

        bucket = ReconstructedImageFeatureBucket(client)

        for id in range(510, num_features):
            origin = f'{directory}/{id}.png'
            destination = f'./{id}.png'
            try: 
                bucket.upload(origin, destination)
                print(f'Uploaded image {id}')
            except Exception as e:
                if e.args[0]['error'] == 'Duplicate':
                    print(f'Image {id} already exists.')
                    continue
                else:
                    raise Exception(f'Something went wrong when uploading reconstructed image {id}')
        print('All images have been uploaded')
    upload_reconstructed_images_from_dir('./sae_decoded_features')


        
    