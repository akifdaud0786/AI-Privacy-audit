import os
from groq import Groq

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("Error: GROQ_API_KEY environment variable not set.")
    exit(1)
client = Groq(api_key=GROQ_API_KEY)

try:
    print("Testing Groq completion...")
    completion = client.chat.completions.create(
        model="llama-3.1-70b-versatile",
        messages=[{"role": "user", "content": "Hello, is this working?"}],
    )
    print(f"Response: {completion.choices[0].message.content}")
except Exception as e:
    print(f"Groq Error: {e}")
