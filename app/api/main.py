"""
FastAPI backend for the ACGME Case Log Assistant.
"""
import os
import sys
import tempfile
import logging
from pathlib import Path
from typing import List, Dict, Any

import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn

# Import OpenAI client for processing
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from src.openai_client import OpenAIClient
from src.csv_processor import CSVProcessor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="ACGME Case Log Assistant",
    description="API for processing surgical case logs and determining CPT codes",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize clients
openai_client = OpenAIClient()
csv_processor = CSVProcessor()

# In-memory storage for processing jobs
processing_jobs = {}

class ProcessingStatus(BaseModel):
    """Model for processing status response."""
    job_id: str
    status: str
    progress: float
    total_cases: int = 0
    processed_cases: int = 0
    
class CPTCode(BaseModel):
    """Model for CPT code reference."""
    code: str
    description: str
    category: str

# Load CPT code reference data
CPT_CODES_FILE = Path(__file__).parent.parent / "data" / "cpt_codes_reference.csv"
cpt_codes_reference = []

def load_cpt_codes():
    """Load CPT codes from reference file."""
    global cpt_codes_reference
    if CPT_CODES_FILE.exists():
        try:
            df = pd.read_csv(CPT_CODES_FILE)
            cpt_codes_reference = df.to_dict(orient="records")
            logger.info(f"Loaded {len(cpt_codes_reference)} CPT codes from reference file")
        except Exception as e:
            logger.error(f"Error loading CPT codes: {str(e)}")
            cpt_codes_reference = []
    else:
        logger.warning(f"CPT codes reference file not found: {CPT_CODES_FILE}")
        cpt_codes_reference = []

@app.on_event("startup")
async def startup_event():
    """Run on application startup."""
    load_cpt_codes()

def process_csv_file(job_id: str, file_path: str):
    """
    Process a CSV file to determine CPT codes.
    
    Args:
        job_id (str): Unique identifier for the processing job
        file_path (str): Path to the CSV file to process
    """
    try:
        # Update job status
        processing_jobs[job_id]["status"] = "processing"
        
        # Read the CSV file
        df = csv_processor.read_csv(file_path)
        
        # Update job progress
        total_cases = len(df)
        processing_jobs[job_id]["total_cases"] = total_cases
        
        # Process in batches to provide progress updates
        processed_df = pd.DataFrame()
        batch_size = 5  # Process 5 rows at a time
        
        for i in range(0, len(df), batch_size):
            # Get the batch
            batch_df = df.iloc[i:i+batch_size].copy()
            
            # Process the batch
            batch_processed_df = openai_client.process_cases_dataframe(batch_df)
            
            # Append to the processed dataframe
            processed_df = pd.concat([processed_df, batch_processed_df])
            
            # Update progress
            processed_cases = min(i + batch_size, total_cases)
            processing_jobs[job_id]["processed_cases"] = processed_cases
            processing_jobs[job_id]["progress"] = processed_cases / total_cases
        
        # Save the processed data
        output_path = Path(file_path).with_suffix('.processed.csv')
        csv_processor.write_csv(processed_df, output_path)
        
        # Save the results in the job
        processing_jobs[job_id]["status"] = "completed"
        processing_jobs[job_id]["progress"] = 1.0
        processing_jobs[job_id]["result"] = processed_df.to_dict(orient="records")
        processing_jobs[job_id]["output_path"] = str(output_path)
        
    except Exception as e:
        logger.error(f"Error processing CSV file: {str(e)}")
        processing_jobs[job_id]["status"] = "failed"
        processing_jobs[job_id]["error"] = str(e)

@app.post("/api/upload")
async def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """
    Upload a CSV file for processing.
    
    Args:
        file (UploadFile): CSV file to process
        
    Returns:
        dict: Job information including ID for status checking
    """
    try:
        # Check file type
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV")
        
        # Save the uploaded file to a temporary location
        temp_dir = tempfile.mkdtemp()
        temp_file = Path(temp_dir) / file.filename
        
        with open(temp_file, "wb") as f:
            contents = await file.read()
            f.write(contents)
        
        # Generate a job ID
        import uuid
        job_id = str(uuid.uuid4())
        
        # Initialize the job
        processing_jobs[job_id] = {
            "status": "queued",
            "progress": 0.0,
            "file_path": str(temp_file),
            "original_filename": file.filename,
            "total_cases": 0,
            "processed_cases": 0
        }
        
        # Start processing in the background
        background_tasks.add_task(process_csv_file, job_id, str(temp_file))
        
        return {
            "job_id": job_id,
            "message": "File uploaded and processing started",
            "status": "queued"
        }
        
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/status/{job_id}")
async def get_status(job_id: str):
    """
    Get the status of a processing job.
    
    Args:
        job_id (str): ID of the processing job
        
    Returns:
        ProcessingStatus: Current status of the job
    """
    if job_id not in processing_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = processing_jobs[job_id]
    
    return ProcessingStatus(
        job_id=job_id,
        status=job["status"],
        progress=job["progress"],
        total_cases=job.get("total_cases", 0),
        processed_cases=job.get("processed_cases", 0)
    )

@app.get("/api/result/{job_id}")
async def get_result(job_id: str):
    """
    Get the results of a completed processing job.
    
    Args:
        job_id (str): ID of the processing job
        
    Returns:
        list: Processed case log data with CPT codes
    """
    if job_id not in processing_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = processing_jobs[job_id]
    
    if job["status"] != "completed":
        raise HTTPException(status_code=400, detail=f"Job is not completed. Current status: {job['status']}")
    
    return {
        "data": job["result"]
    }

@app.get("/api/cpt-codes")
async def get_cpt_codes():
    """
    Get the reference list of CPT codes.
    
    Returns:
        list: List of CPT codes with descriptions
    """
    return {
        "cpt_codes": cpt_codes_reference
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 