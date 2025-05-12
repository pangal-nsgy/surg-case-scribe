import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Mock function to simulate backend processing for CPT code prediction
async function processCsvFile(filePath: string) {
  // In a real implementation, this would call the Python backend
  // For now, we'll return a mock result with simulated CPT codes
  return {
    job_id: uuidv4(),
    status: "completed",
    message: "File processed successfully",
    results: [
      {
        procedure_type: "Laparoscopic cholecystectomy",
        procedure_date: "2023-01-15",
        patient_id: "PT12345",
        hospital: "University Medical Center",
        attending: "Dr. Smith",
        predicted_cpt_code: "47562",
        cpt_description: "Laparoscopic cholecystectomy",
        confidence: 0.95
      },
      {
        procedure_type: "Appendectomy",
        procedure_date: "2023-02-10",
        patient_id: "PT23456",
        hospital: "Community Hospital",
        attending: "Dr. Jones",
        predicted_cpt_code: "44950",
        cpt_description: "Appendectomy",
        confidence: 0.97
      }
    ]
  };
}

export async function POST(request: NextRequest) {
  try {
    // Check if the request is multipart/form-data
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Request must be multipart/form-data' },
        { status: 400 }
      );
    }

    // Get the file from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate the file is a CSV
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'File must be a CSV' },
        { status: 400 }
      );
    }

    // Save the file to a temporary location
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a unique filename to avoid collisions
    const uniqueId = uuidv4();
    const tempDir = tmpdir();
    const filePath = join(tempDir, `${uniqueId}-${file.name}`);
    
    await writeFile(filePath, buffer);
    
    // Process the file (in a real implementation, this would be a background task)
    const result = await processCsvFile(filePath);
    
    // Return the result
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error processing upload:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 