from client import supabase_client

class ReconstructedImageFeatureBucket:
    def __init__(self):
        self.bucket = supabase_client.storage.from_('ReconstructedFeatureImages')

    def size(self):
        print('I was called')
        return len(self.bucket.list())

    def is_clear(self):
        images_list = self.bucket.list()
        return len(images_list) == 0

    def download(self, file_path: str, download_path: str):
        response = self.bucket.download(file_path)
        with open(download_path, 'wb') as f:
            f.write(response)
 
    def upload(self, file_path: str, destination_path: str):
        with open(file_path, 'rb') as file:
            response =  self.bucket.upload(destination_path, file)
        return response

image_features_db = ReconstructedImageFeatureBucket()

if __name__ == '__main__':
    print(image_features_db.size())