from fastapi import FastAPI, UploadFile, File
from PIL import Image
import io
import pytesseract
from utils import run_ocr
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
    ocr_result = run_ocr(img)

    # LLM
    receipt_data = (ocr_result)

    return receipt_data
