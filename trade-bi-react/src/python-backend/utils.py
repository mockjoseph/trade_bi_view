import requests
import json
import re

def extract_receipt(text):
    prompt = f"""
You are a receipt parsing engine.

Extract structured data from OCR text.

Return ONLY valid JSON.

Rules:
- No markdown
- No explanations
- Do not guess, only use the OCR text
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
    output = response.json()["response"]

    cleaned = _strip_markdown_fence(output)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        print("Failed to parse model output as JSON.")
        print("Raw output:", repr(output))
        raise ValueError(
            f"Model returned invalid JSON: {e}"
        ) from e


def _strip_markdown_fence(text):
    """
    Strips ```json ... ``` or ``` ... ``` wrappers if present.
    Falls back to the raw text if no fence is found.
    """
    match = re.search(r"```(?:json)?\s*(.*?)\s*```", text, re.DOTALL)
    return match.group(1) if match else text.strip()



import pytesseract
from pytesseract import Output

def run_ocr_with_confidence(img):
    data = pytesseract.image_to_data(img, output_type=Output.DICT, config="--psm 6")

    words = []
    confidences = []

    for i, word in enumerate(data["text"]):
        word = word.strip()
        conf = int(data["conf"][i])

        # Tesseract returns -1 confidence for non-text regions (whitespace, etc.)
        if word and conf >= 0:
            words.append(word)
            confidences.append(conf)

    full_text = " ".join(words)
    avg_confidence = sum(confidences) / len(confidences) if confidences else 0

    return {
        "text": full_text,
        "avg_confidence": avg_confidence,
        "word_confidences": list(zip(words, confidences)),
    }