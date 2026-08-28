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


@app.get("/health")
async def health_check():
    '''
     Function returns a generic health check of the application for 
     all of the services hooked into backend
     Currently just FastAPI server and 
    '''

    return {
        "status": "healthy"
    }


@app.get("/api/metrics/revenue_monthly")
async def get_revenue_month():
    '''
     Function will query database for revenue data and will return 
     the amount of total revenue for the month ( past 30 days )
    '''

    return


@app.get("/api/metrics/jobs_completed")
async def get_jobs_completed():
    '''
     Function queries database for job data
     Returns total jobs completed in the past month ( past 30 days )
    '''
    return


@app.get("/api/average_margin")
async def get_average_job_margin():
    '''
     Function queries database for job data
     Return average margin on all jobs completed
    '''
    return

@app.post("/api/add_materials")
async def add_materials(payload: dict):
    '''
     Function add materials from a reciept scan associated with a job
     all data concerning the update is added and changed upon the update
     Returns: a success status based on change
    '''

@app.post("/api/generate_invoice")
async def generate_invoice(payload: dict):
    '''
     Function generates an invoice for a given job (within the payload)
     Returns: Invoice
    '''
    

@app.post("/api/reciepts/insert")
async def input_reciept(payload: dict):
    '''
      Takes in reciept data and inputs it into databse with correlating job
      Returns: Status code of insert operation
    '''



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
