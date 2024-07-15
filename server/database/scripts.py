from feature_images_bucket import image_features_db


FEATURE_IMAGES_DIR= '../interp_dataset/'



def upload_feature_image(feature_id):
    source = f'{FEATURE_IMAGES_DIR}{feature_id}/feature.png'
    destination = f'./{feature_id}.png'
    image_features_db.upload(source, destination)
    print(f'Feature {feature_id} was successfully uploaded')

def upload_all_feature_images():
    for i in range(0, 512):
        upload_feature_image(i)



if __name__ == "__main__":
    if image_features_db.is_clear():
        print('true')
        upload_all_feature_images()
    else:
        print('false')


    