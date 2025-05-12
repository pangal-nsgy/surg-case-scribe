/**
 * Initialization script for the API
 * Ensures required directories exist for file uploads and processing
 */

import * as fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

// Directories to ensure exist
const requiredDirs = [
  'uploads',
  'processed'
];

export function ensureDirectories() {
  try {
    // Create directories relative to the project root
    for (const dir of requiredDirs) {
      const dirPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
      }
    }
    return true;
  } catch (error) {
    console.error('Error creating directories:', error);
    return false;
  }
}

// Initialize when imported
ensureDirectories();

export async function GET() {
  const success = ensureDirectories();
  return NextResponse.json({ 
    status: success ? 'success' : 'error',
    message: success ? 'API initialized successfully' : 'Error initializing API'
  });
} 