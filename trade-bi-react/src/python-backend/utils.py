# use file to test ocr piece of the reciept scanner to gauge where it is at since it is the first
# piece of the backend of this appliation feature


import sys
import pytesseract
import argparse
import requests
import json

import cv2
import numpy as np
from PIL import Image
from pytesseract import Output

import re

from collections import defaultdict

def is_noise_token(word: str) -> bool:
    stripped = word.strip()
    if not stripped:
        return True
    if re.fullmatch(r"[*\-_.=~#^]+", stripped):
        return True
    if len(stripped) == 1 and not stripped.isalnum():
        return True
    return False


def run_ocr_with_confidence(img, psm: int = 6, min_line_confidence: int = 43) -> dict:
    config = f"--psm {psm}"
    data = pytesseract.image_to_data(img, output_type=Output.DICT, config=config)

    # Group word indices by (block, paragraph, line) so we can rebuild
    # line structure and filter out whole noisy lines (asterisk borders, etc.)
    lines = defaultdict(list)
    n = len(data["text"])
    for i in range(n):
        word = data["text"][i].strip()
        conf = int(data["conf"][i])
        if not word:
            continue
        line_key = (data["block_num"][i], data["par_num"][i], data["line_num"][i])
        lines[line_key].append({"word": word, "conf": conf, "top": data["top"][i]})

    # Sort lines top-to-bottom so reconstructed text reads in the right order
    ordered_line_keys = sorted(
        lines.keys(),
        key=lambda k: min(entry["top"] for entry in lines[k])
    )

    kept_lines_text = []
    kept_confidences = []
    low_confidence_words = []

    for line_key in ordered_line_keys:
        entries = lines[line_key]
        confs = [e["conf"] for e in entries if e["conf"] >= 0]
        if not confs:
            continue

        avg_line_conf = sum(confs) / len(confs)
        if avg_line_conf < min_line_confidence:
            # Whole line looks like noise (e.g. asterisk border misread as letters)
            continue

        line_words = []
        for entry in entries:
            word, conf = entry["word"], entry["conf"]
            if conf < 0 or is_noise_token(word):
                continue
            line_words.append(word)
            kept_confidences.append(conf)
            if conf < 60:
                low_confidence_words.append((word, conf))

        if line_words:
            kept_lines_text.append(" ".join(line_words))

    full_text = "\n".join(kept_lines_text)
    avg_confidence = sum(kept_confidences) / len(kept_confidences) if kept_confidences else 0.0

    return {
        "text": full_text,
        "avg_confidence": avg_confidence,
        "low_confidence_words": low_confidence_words,
        "word_count": len(kept_confidences),
    }


def preprocess_for_ocr(img: Image.Image) -> Image.Image:
    """
    Cleans up a photographed receipt for better OCR accuracy:
    grayscale -> denoise -> upscale (if small) -> adaptive threshold (binarize).
    """
    cv_img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
 
    # 1. Grayscale
    gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
 
    # 2. Denoise
    denoised = cv2.fastNlMeansDenoising(gray, h=10)
 
    # 3. Upscale if small (helps Tesseract with low-res photos)
    h, w = denoised.shape
    if max(h, w) < 1800:
        scale = 1800 / max(h, w)
        denoised = cv2.resize(
            denoised, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC
        )
 
    # 4. Adaptive threshold -> binarize (push faint/gray text to solid black)
    binarized = cv2.adaptiveThreshold(
        denoised,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        blockSize=31,
        C=15,
    )
 
    return Image.fromarray(binarized)
 
 
'''

def run_ocr_with_confidence(img: Image.Image, psm: int = 6) -> dict:
    """
    Runs Tesseract via image_to_data to get per-word confidence scores,
    and also grabs the cleanly formatted multi-line text via image_to_string.
    """
    config = f"--psm {psm}"
 
    # Structured output -> gives us confidence per word
    data = pytesseract.image_to_data(img, output_type=Output.DICT, config=config)
 
    words = []
    confidences = []
    for i, word in enumerate(data["text"]):
        word = word.strip()
        conf = int(data["conf"][i])
        if word and conf >= 0:
            words.append(word)
            confidences.append(conf)
 
    avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
 
    # Plain text output -> preserves line breaks better, this is what you'd
    # feed to the LLM
    full_text = pytesseract.image_to_string(img, config=config)
 
    return {
        "text": full_text,
        "avg_confidence": avg_confidence,
        "word_confidences": list(zip(words, confidences)),
        "low_confidence_words": [
            (w, c) for w, c in zip(words, confidences) if c < 60
        ],
    }
 '''
 
def run_ocr(img, psm: int = 6):
    print("\n--- Pre-processing image ---")
    print(f"Original size: {img.size}")

    processed = preprocess_for_ocr(img)
    print(f"Preprocessed size: {processed.size}")

    print("\n--- Running OCR ---")
    result = run_ocr_with_confidence(processed, psm=psm)

    return result
 
    print("\n=== EXTRACTED TEXT ===")
    print(result["text"])
 
    print("\n=== CONFIDENCE ===")
    print(f"Average confidence: {result['avg_confidence']:.1f}")
 
    if result["low_confidence_words"]:
        print(f"\nLow-confidence words (<60):")
        for word, conf in result["low_confidence_words"]:
            print(f"  '{word}' -> {conf}")
    else:
        print("No low-confidence words found.")
 
    print(f"\nTotal words detected: {result['word_count']}")
 
def clean_json_output(output: str) -> str:
    cleaned = output.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()

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
            "model": "mistral",
            "prompt": prompt,
            "stream": False,
            "format": "json",
        }
    )
    output = response.json()["response"]

    try:
        return json.loads(output)
    except json.JSONDecodeError as e:
        cleaned = clean_json_output(output)
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            print(f"Still failed to parse: {e}")
            print(f"Raw output: {output!r}")
            return {
                "merchant": None, "date": None, "items": [],
                "subtotal": None, "tax": None, "total": None,
            }