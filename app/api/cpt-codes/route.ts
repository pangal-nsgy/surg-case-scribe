import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

export async function GET() {
  try {
    // Path to the CSV file
    const filePath = path.join(process.cwd(), 'app/data/cpt_codes_reference.csv');
    
    // Read the file content
    const fileContent = await fsPromises.readFile(filePath, 'utf-8');
    
    // Parse CSV content (simple implementation)
    const lines = fileContent.split('\n');
    const headers = lines[0].split(',');
    
    const cptCodes = lines.slice(1).map(line => {
      const values = line.split(',');
      return {
        cpt_code: values[0],
        description: values[1],
        category: values[2]
      };
    }).filter(item => item.cpt_code); // Filter out empty lines
    
    return NextResponse.json({ 
      success: true, 
      cpt_codes: cptCodes
    });
  } catch (error) {
    console.error('Error fetching CPT codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CPT codes' },
      { status: 500 }
    );
  }
} 