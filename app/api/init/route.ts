import { ensureDirectories } from '../init';
import { NextResponse } from 'next/server';

export async function GET() {
  const success = ensureDirectories();
  return NextResponse.json({ 
    status: success ? 'success' : 'error',
    message: success ? 'API initialized successfully' : 'Error initializing API',
    timestamp: new Date().toISOString()
  });
} 