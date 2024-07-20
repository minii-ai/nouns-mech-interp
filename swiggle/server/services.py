import os

from dotenv import load_dotenv

from swiggle.dataset import load_nouns_dataset
from swiggle.models import SAE, VAE

from .database import create_supabase_client
from .features import FeaturesService

load_dotenv()

# load supabase client
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase_client = create_supabase_client(url, key)

# create features db

# load datase
nouns_dataset = load_nouns_dataset(image_size=64, normalize=True)

# load sae
sae_checkpoint = "../weights/sae"
sae_config_path = os.path.join(sae_checkpoint, "config.json")
sae_weights_path = os.path.join(sae_checkpoint, "sae.pth")
sae = SAE.load_from_checkpoint(sae_config_path, sae_weights_path)


# load vae
vae_checkpoint = "../weights/vae"
vae_config_path = os.path.join(vae_checkpoint, "config.json")
vae_weights_path = os.path.join(vae_checkpoint, "vae.pth")
vae = VAE.load_from_checkpoint(vae_config_path, vae_weights_path)


# init features service
features_service = FeaturesService(dataset=nouns_dataset, vae=vae, sae=sae)
