from client import supabase_client

class ReconstructedImageFeatureBucket:
    def __init__(self):
        self.bucket = supabase_client.storage.from_('ReconstructedFeatureImages')

    def size(self):
        return len(self.bucket.list())

    def isEmpty(self):
        return self.size() == 0

    def download(self, file_path: str, download_path: str):
        response = self.bucket.download(file_path)
        with open(download_path, 'wb') as f:
            f.write(response)
 
    def upload(self, file_path: str, destination_path: str):
        with open(file_path, 'rb') as file:
            response =  self.bucket.upload(destination_path, file)
        return response

image_features_db = ReconstructedImageFeatureBucket()


def _upload_feature_image(feature_id):
    FEATURE_IMAGES_DIR= '../data/interp_dataset/'
    source = f'{FEATURE_IMAGES_DIR}{feature_id}/feature.png'
    destination = f'./{feature_id}.png'
    image_features_db.upload(source, destination)
    print(f'Feature {feature_id} was successfully uploaded')

def _upload_all_feature_images():
    for i in range(0, 512):
        _upload_feature_image(i)


if __name__ == '__main__':
    if image_features_db.isEmpty(): _upload_all_feature_images()