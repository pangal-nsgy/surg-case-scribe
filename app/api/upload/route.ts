// We need to make sure the csv-parser package is installed
// Install it using: npm install csv-parser @types/csv-parser

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// TOGGLE FLAG: Set to true to just display the CSV data, false to use the normal processing
const USE_DISPLAY_MODE = true;

// Define types for our results
interface CaseResult {
  job_id: string;
  status: string;
  procedure_type: string;
  procedure_date: string;
  patient_id: string;
  hospital: string;
  attending: string;
  predicted_cpt_code: string;
  cpt_description: string;
  confidence: number;
}

interface StandardizationResult {
  job_id: string;
  status: string;
  column_mapping: Record<string, string>;
  standardized_data: Record<string, string>[];
  original_data: Record<string, string>[];
}

// Simple CSV parser with support for quoted values
function parseCSV(text: string): any[] {
  try {
    console.log("Starting CSV parsing, content length:", text.length);
    
    // Split by lines
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    console.log("Lines found in CSV:", lines.length);
    
    if (lines.length === 0) {
      console.log("CSV parsing: No lines found");
      return [];
    }
    
    // Get headers from the first line (simple split for headers)
    const headers = lines[0].split(',').map(header => header.trim());
    console.log("CSV headers:", headers);
    
    // Convert the rest of the lines to objects
    const results = [];
    for (let i = 1; i < lines.length; i++) {
      try {
        // Handle quoted values properly
        const row: Record<string, string> = {};
        const line = lines[i];
        
        // Parse the line character by character to handle quoted fields
        let fieldValue = '';
        let currentField = 0;
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          
          // Handle quotes
          if (char === '"') {
            // Toggle quote state
            inQuotes = !inQuotes;
            continue;
          }
          
          // If we hit a comma and not inside quotes, move to next field
          if (char === ',' && !inQuotes) {
            // Save current field value
            if (currentField < headers.length) {
              row[headers[currentField]] = fieldValue.trim();
            }
            // Reset for next field
            fieldValue = '';
            currentField++;
            continue;
          }
          
          // Add character to current field value
          fieldValue += char;
        }
        
        // Add the last field
        if (currentField < headers.length) {
          row[headers[currentField]] = fieldValue.trim();
        }
        
        // If we didn't find enough fields, try simple split as fallback
        if (Object.keys(row).length < headers.length) {
          const values = line.split(',');
          headers.forEach((header, index) => {
            row[header] = index < values.length ? values[index].trim() : '';
          });
        }
        
        results.push(row);
      } catch (lineError) {
        console.error(`Error parsing line ${i}:`, lineError);
        // Continue to next line instead of failing the whole process
      }
    }
    
    console.log(`CSV parsing complete: ${results.length} rows parsed`);
    return results;
  } catch (error) {
    console.error("CSV parsing error:", error);
    return [];
  }
}

// Generate fixed mock data that doesn't depend on the CSV content
function getMockData() {
  const mockData = [
    {
      job_id: uuidv4(),
      status: 'completed',
      procedure_type: 'Laparoscopic Appendectomy',
      procedure_date: '2023-05-15',
      patient_id: 'P12345',
      hospital: 'General Hospital',
      attending: 'Dr. Smith',
      predicted_cpt_code: '44950',
      cpt_description: 'Appendectomy',
      confidence: 0.92
    },
    {
      job_id: uuidv4(),
      status: 'completed',
      procedure_type: 'Cholecystectomy',
      procedure_date: '2023-05-16',
      patient_id: 'P23456',
      hospital: 'University Medical Center',
      attending: 'Dr. Johnson',
      predicted_cpt_code: '47600',
      cpt_description: 'Cholecystectomy',
      confidence: 0.89
    },
    {
      job_id: uuidv4(),
      status: 'completed',
      procedure_type: 'Hernia Repair',
      procedure_date: '2023-05-17',
      patient_id: 'P34567',
      hospital: 'Memorial Hospital',
      attending: 'Dr. Williams',
      predicted_cpt_code: '49505',
      cpt_description: 'Repair initial inguinal hernia, age 5 years or older',
      confidence: 0.85
    },
    {
      job_id: uuidv4(),
      status: 'completed',
      procedure_type: 'Colectomy',
      procedure_date: '2023-05-18',
      patient_id: 'P45678',
      hospital: 'City Medical Center',
      attending: 'Dr. Brown',
      predicted_cpt_code: '44140',
      cpt_description: 'Colectomy, partial; with anastomosis',
      confidence: 0.88
    },
    {
      job_id: uuidv4(),
      status: 'completed',
      procedure_type: 'Thyroidectomy',
      procedure_date: '2023-05-19',
      patient_id: 'P56789',
      hospital: 'Community Hospital',
      attending: 'Dr. Davis',
      predicted_cpt_code: '60240',
      cpt_description: 'Thyroidectomy, total or complete',
      confidence: 0.90
    }
  ];
  
  return mockData;
}

// Generate a standardized column mapping using OpenAI
async function generateColumnMapping(originalHeaders: string[]): Promise<Record<string, string>> {
  console.log("Generating column mapping for headers:", originalHeaders);
  
  // If OPENAI_API_KEY is not set, return mock mapping
  if (!process.env.OPENAI_API_KEY) {
    console.log("No OpenAI API key found, using mock mapping");
    return mockColumnMapping(originalHeaders);
  }
  
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    // Construct the prompt for the OpenAI API
    const systemPrompt = `You are a helpful AI that specializes in standardizing CSV column names for medical data, particularly surgical case logs. 
    Map the following column names to standard, consistent names that follow these conventions:
    - Use snake_case (lowercase with underscores)
    - Be descriptive but concise
    - Standardize common medical terminology
    - For dates, use procedure_date, surgery_date, or operation_date as appropriate
    - For patient identifiers, use patient_id
    - For surgical procedures, use procedure_type or procedure_name
    - For locations, use hospital or facility
    - For physicians, use surgeon, attending, or physician as appropriate
    
    Return ONLY a JSON object mapping the original column names to their standardized versions, with no additional text.`;
    
    const userPrompt = `These are the original column headers from a surgical case log CSV file:
    ${originalHeaders.join(", ")}
    
    Provide a JSON mapping from each original header to a standardized header name.`;
    
    // Call the OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000
      }),
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log("OpenAI API response:", result);
    
    // Parse the response to extract the mapping
    const contentText = result.choices[0].message.content;
    const mapping = JSON.parse(contentText.trim());
    
    console.log("Extracted column mapping:", mapping);
    return mapping;
  } catch (error) {
    console.error("Error generating column mapping:", error);
    // Fallback to mock mapping
    return mockColumnMapping(originalHeaders);
  }
}

// Mock column mapping for when OpenAI API is not available
function mockColumnMapping(originalHeaders: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  
  for (const header of originalHeaders) {
    const lowerHeader = header.toLowerCase();
    
    // Apply some basic rules
    if (lowerHeader.includes('date') || lowerHeader.includes('dt')) {
      mapping[header] = 'procedure_date';
    }
    else if (lowerHeader.includes('proc') || lowerHeader.includes('surg') || lowerHeader.includes('operation')) {
      mapping[header] = 'procedure_type';
    }
    else if (lowerHeader.includes('patient') || lowerHeader.includes('pt') || lowerHeader.includes('id')) {
      mapping[header] = 'patient_id';
    }
    else if (lowerHeader.includes('hosp') || lowerHeader.includes('fac') || lowerHeader.includes('loc')) {
      mapping[header] = 'hospital';
    }
    else if (lowerHeader.includes('doc') || lowerHeader.includes('phys') || lowerHeader.includes('surg') || lowerHeader.includes('attend')) {
      mapping[header] = 'attending';
    }
    else {
      // For any other headers, just convert to snake_case
      mapping[header] = header
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
    }
  }
  
  console.log("Generated mock column mapping:", mapping);
  return mapping;
}

// Standardize the data using the column mapping
function standardizeData(data: Record<string, string>[], mapping: Record<string, string>): Record<string, string>[] {
  return data.map(row => {
    const standardizedRow: Record<string, string> = {};
    
    // Map each column using the mapping
    for (const [originalCol, value] of Object.entries(row)) {
      const standardCol = mapping[originalCol] || originalCol;
      standardizedRow[standardCol] = value;
    }
    
    // Add empty cpt_code field for future use
    if (!standardizedRow.hasOwnProperty('cpt_code')) {
      standardizedRow['cpt_code'] = '';
    }
    
    return standardizedRow;
  });
}

// View Mode: Just display the file contents
async function handleViewMode(file: File) {
  const fileInfo = {
    name: file.name,
    type: file.type,
    size: file.size
  };
  
  console.log("View mode - File received:", fileInfo);
  
  try {
    // Read the file content
    const fileContent = await file.text();
    console.log("File content read, length:", fileContent.length);
    
    // For CSV files, try to parse into structured data
    if (file.name.endsWith('.csv')) {
      const parsedData = parseCSV(fileContent);
      
      // Get row count and headers
      if (parsedData.length > 0) {
        const headers = Object.keys(parsedData[0]);
        
        return NextResponse.json({
          status: 'success',
          message: 'CSV file processed successfully',
          fileInfo,
          fileType: 'csv',
          data: {
            headers,
            rows: parsedData.slice(0, 100), // Limit to first 100 rows for safety
            totalRows: parsedData.length
          }
        });
      }
    }
    
    // For text files (non-CSV or empty CSV), return the content directly
    return NextResponse.json({
      status: 'success',
      message: 'File processed successfully',
      fileInfo,
      fileType: 'text',
      data: {
        content: fileContent.substring(0, 50000) // Limit to first 50K characters for safety
      }
    });
  } catch (fileError) {
    console.error("Error reading file:", fileError);
    return NextResponse.json({
      status: 'error',
      message: 'Error reading file content',
      fileInfo,
      errorDetails: fileError instanceof Error ? fileError.message : String(fileError)
    });
  }
}

// Standardize Mode: Process the CSV and standardize column names and data
async function handleStandardizeMode(file: File) {
  const fileInfo = {
    name: file.name,
    type: file.type,
    size: file.size
  };
  
  console.log("Standardize mode - File received:", fileInfo);
  
  if (!file.name.endsWith('.csv')) {
    return NextResponse.json({
      status: 'error',
      message: 'File must be a CSV for standardization',
      fileInfo
    });
  }
  
  try {
    // Read the file content
    const fileContent = await file.text();
    console.log("File content read, length:", fileContent.length);
    
    // Parse the CSV data
    const parsedData = parseCSV(fileContent);
    
    if (parsedData.length === 0) {
      return NextResponse.json({
        status: 'error',
        message: 'Could not parse any data from the CSV file',
        fileInfo
      });
    }
    
    // Get the headers
    const headers = Object.keys(parsedData[0]);
    console.log("Headers detected:", headers);
    
    // Generate column mapping using OpenAI or mock
    const columnMapping = await generateColumnMapping(headers);
    
    // Apply the standardization to the data
    const standardizedData = standardizeData(parsedData, columnMapping);
    
    // Return the results
    return NextResponse.json({
      status: 'success',
      message: 'CSV standardization completed successfully',
      fileInfo,
      standardization: {
        job_id: uuidv4(),
        original_headers: headers,
        column_mapping: columnMapping,
        standardized_data: standardizedData.slice(0, 100), // First 100 rows
        original_data: parsedData.slice(0, 100), // First 100 rows
        total_rows: parsedData.length
      }
    });
    
  } catch (error) {
    console.error("Error in standardize mode:", error);
    return NextResponse.json({
      status: 'error',
      message: 'Error standardizing CSV file',
      fileInfo,
      errorDetails: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function POST(request: NextRequest) {
  console.log("API Upload route called");
  
  try {
    // Check if we're in standardize mode
    const url = new URL(request.url);
    const mode = url.searchParams.get('mode') || 'view';
    console.log(`Processing in ${mode} mode`);
    
    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({
        status: 'error',
        message: 'No file received'
      });
    }
    
    // Process based on selected mode
    if (mode === 'standardize') {
      return handleStandardizeMode(file);
    } else {
      return handleViewMode(file);
    }
    
  } catch (error) {
    console.error("Error in upload endpoint:", error);
    return NextResponse.json({
      status: 'error',
      message: 'Server error processing upload',
      errorDetails: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 