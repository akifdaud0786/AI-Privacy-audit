import os
from groq import Groq

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("Error: GROQ_API_KEY environment variable not set.")
    exit(1)
client = Groq(api_key=GROQ_API_KEY)

try:
    print("Listing Groq models...")
    models = client.models.list()
    for model in models.data:
        print(f"Model ID: {model.id}")
except Exception as e:
    print(f"Groq Error: {e}")
