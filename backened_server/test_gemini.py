import os
from google import genai

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY environment variable not set.")
    exit(1)
client = genai.Client(api_key=GEMINI_API_KEY)

try:
    print("Listing available models and their supported methods...")
    models = client.models.list()
    for model in models:
        # The modern SDK uses different attribute names
        print(f"Model Name: {model.name}")
except Exception as e:
    print(f"Error listing models: {e}")
