from .client import supabase_client
from .features_db import featuresDB
import base64

class ReconstructedImageFeatureBucket:
    def __init__(self):
        self.bucket = supabase_client.storage.from_('ReconstructedFeatureImages')

    def size(self):
        return len(self.bucket.list())

    def isEmpty(self):
        return self.size() == 0
    
    def get(self, feature_id: str,) -> str:
        file_path = f'./{feature_id}.png'
        try:
            response = self.bucket.download(file_path)
            base64_encoded = base64.b64encode(response).decode('utf-8')
            return base64_encoded
        except Exception as e:
            print(f"An error occurred: {e}")
            return ""

    def download(self, file_path: str, download_path: str):
        try:
            response = self.bucket.download(file_path)
            with open(download_path, 'wb') as f:
                f.write(response)
        except:
            return 
 
    def upload(self, file_path: str, destination_path: str):
        with open(file_path, 'rb') as file:
            response =  self.bucket.upload(destination_path, file)
        return response

imageFeaturesBucket = ReconstructedImageFeatureBucket()


def _upload_feature_image(feature_id):
    FEATURE_IMAGES_DIR= '../data/interp_dataset/'
    source = f'{FEATURE_IMAGES_DIR}{feature_id}/feature.png'
    destination = f'./{feature_id}.png'
    imageFeaturesBucket.upload(source, destination)
    print(f'Feature {feature_id} was successfully uploaded')

def _upload_all_feature_images():
    for i in range(0, 1024):
        if not featuresDB._get_is_dead_status_from_csv(i):
            _upload_feature_image(i)


if __name__ == '__main__':
    # _upload_all_feature_images()
    # print(imageFeaturesBucket.get(1))
    pass