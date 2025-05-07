'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, DocumentTextIcon, XCircleIcon } from '@heroicons/react/24/outline';

// Status types for processing
type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

export default function Home() {
  // State for file and processing
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setStatus('idle');
      setError(null);
    }
  }, []);

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1,
  });

  // Handle file upload
  const handleUpload = async () => {
    if (!file) return;

    // For now, just show a message that uploading is not available in this version
    setStatus('completed');
    setError("Backend processing is not available in this demo version. The full functionality will be implemented soon.");
  };

  // Reset the form
  const handleReset = () => {
    setFile(null);
    setStatus('idle');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ACGME Case Log Assistant</h1>
          <p className="text-xl text-gray-600">Upload your surgical case logs to automatically determine CPT codes</p>
          <p className="mt-2 text-md text-orange-600">Demo Version - Backend Processing Coming Soon</p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* File Upload Section */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Upload Case Logs</h2>
            
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition duration-300 ease-in-out ${
                isDragActive ? 'border-primary-600 bg-primary-50' : 'border-gray-300 hover:border-primary-500'
              }`}
            >
              <input {...getInputProps()} />
              <CloudArrowUpIcon className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                {isDragActive
                  ? "Drop your CSV file here"
                  : "Drag and drop a CSV file here, or click to select a file"}
              </p>
              <p className="text-xs text-gray-400 mt-1">Only CSV files are accepted</p>
            </div>

            {file && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md flex items-center justify-between">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="ml-2 text-xs text-gray-500">({Math.round(file.size / 1024)} KB)</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={status === 'uploading' || status === 'processing'}
              >
                Reset
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || status === 'uploading' || status === 'processing'}
                className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {status === 'uploading' ? 'Uploading...' : status === 'processing' ? 'Processing...' : 'Process Case Logs'}
              </button>
            </div>

            {/* Error message for demo version */}
            {error && (
              <div className="mt-4 p-4 text-sm text-amber-700 bg-amber-100 rounded-md">
                <p>{error}</p>
                <p className="mt-2 text-xs">This is just a frontend demo. Backend processing will be implemented in the next phase.</p>
              </div>
            )}
          </div>

          {/* Coming Soon Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Features Coming Soon</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Backend processing of CSV files</li>
              <li>CPT code inference using AI</li>
              <li>Real-time progress tracking</li>
              <li>Results table with sorting and filtering</li>
              <li>Download processed results</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-500">
            ACGME Case Log Assistant &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
