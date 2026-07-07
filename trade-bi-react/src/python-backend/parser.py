from fastapi import FastAPI, UploadFile, File
from PIL import Image
import io
import pytesseract
from utils import run_ocr, extract_receipt, preprocess_for_ocr, run_ocr_with_confidence
from fastapi.middleware.cors import CORSMiddleware

PSM_VAL=6

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
    ocr_result = run_ocr(img)

    processed = preprocess_for_ocr(img)

    ocr_result = run_ocr_with_confidence(processed, psm=PSM_VAL)

    extracted = extract_receipt(ocr_result["text"])

    return extracted
