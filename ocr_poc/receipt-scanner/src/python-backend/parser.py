from fastapi import FastAPI, UploadFile, File
from PIL import Image
import io
import pytesseract
from utils import extract_receipt
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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