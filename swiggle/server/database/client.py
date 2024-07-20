import os

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase_client: Client = create_client(url, key)


def create_supabase_client(supabase_url: str, supabase_key: str):
    return create_client(supabase_url, supabase_key)
