import os

from dotenv import load_dotenv

from swiggle.dataset import load_nouns_dataset
from swiggle.models import SAE, VAE, FeaturesControl

# from swiggle.models import SAE, VAE, FeaturesControls

from ..database import (
    create_supabase_client,
    ReconstructedImageFeatureBucket,
    FeatureTable,
    NounsImagesBucket,
)
from ..dataset import load_nouns_dataset

from .features_service import FeaturesService
from sentence_transformers import SentenceTransformer


# load supabase client
supabase_client = create_supabase_client()

# creat features images bucket
image_feature_bucket = ReconstructedImageFeatureBucket(supabase_client)

# create features db
features_db = FeatureTable(supabase_client)

image_db = NounsImagesBucket(supabase_client)

# load datase
nouns_dataset = load_nouns_dataset(image_size=128, normalize=True)
# nouns_dataset = load_nouns_dataset(image_size=64, normalize=True)

text_embedder = SentenceTransformer("all-MiniLM-L6-v2")


# load sae
sae_checkpoint = "./weights/sae"
sae_config_path = os.path.join(sae_checkpoint, "config.json")
sae_weights_path = os.path.join(sae_checkpoint, "sae.pth")
sae = SAE.load_from_checkpoint(sae_config_path, sae_weights_path)

# load vae
vae_checkpoint = "./weights/vae"
vae_config_path = os.path.join(vae_checkpoint, "config.json")
vae_weights_path = os.path.join(vae_checkpoint, "vae.pth")
vae = VAE.load_from_checkpoint(vae_config_path, vae_weights_path)

# init features service
features_control = FeaturesControl(vae=vae, sae=sae, latent_shape=(4, 8, 8))
features_service = FeaturesService(
    image_db=image_db,
    features_db=features_db,
    feature_reconstructed_db=image_feature_bucket,
    features_control=features_control,
    nouns_dataset=nouns_dataset,
    text_embedder=text_embedder,
)
