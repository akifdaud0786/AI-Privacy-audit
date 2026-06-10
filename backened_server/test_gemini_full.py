import os
from google import genai

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY environment variable not set.")
    exit(1)
client = genai.Client(api_key=GEMINI_API_KEY)

try:
    print("Testing generate_content with gemini-2.0-flash...")
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents="Hello, are you working?"
    )
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
