from fastapi import FastAPI, UploadFile, File
from PIL import Image
import io
import pytesseract
from utils import extract_receipt
app = FastAPI()

@app.post("/api/receipts/parse")
async def parse_receipt(file: UploadFile = File(...)):
    contents = await file.read()

    img = Image.open(io.BytesIO(contents)).convert("RGB")

    # OCR
    ocr_text = run_ocr(img)

    # LLM
    receipt_data = extract_receipt(ocr_text)

    return receipt_data

def run_ocr(img):
    return pytesseract.image_to_string(img)