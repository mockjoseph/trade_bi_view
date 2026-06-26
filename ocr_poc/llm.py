import requests
import json

def extract_receipt(text):
    prompt = f"""
You are a receipt parsing engine.

Extract structured data from OCR text.

Return ONLY valid JSON.

Rules:
- No markdown
- No explanations
- Prices must be numbers
- If unknown, use null
- Items must be an array of objects with name and price

JSON schema:
{{
  "merchant": string or null,
  "date": string or null,
  "items": [
    {{
      "name": string,
      "price": number
    }}
  ],
  "subtotal": number or null,
  "tax": number or null,
  "total": number or null
}}

OCR TEXT:
{text}
"""

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3.1",
            "prompt": prompt,
            "stream": False
        }
    )
    print(response.json())
    output = response.json()["response"]

    # IMPORTANT: parse JSON safely
    return json.loads(output)