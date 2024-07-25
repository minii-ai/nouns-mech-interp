import os
from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

def create_supabase_client() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    return create_client(url, key)
