'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, DocumentTextIcon, XCircleIcon, ChartBarIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Status types for processing
type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

export default function UploadPage() {
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
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50 pt-10 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-2">Upload Your Case Logs</h1>
              <p className="text-xl text-gray-600">Get accurate CPT codes for your surgical cases</p>
              <p className="mt-2 text-sm text-orange-600">Demo Version - Backend Processing Coming Soon</p>
            </div>

            {/* File Upload Section */}
            <div className="bg-white shadow rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-semibold mb-6">Upload CSV File</h2>
              
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition duration-300 ease-in-out ${
                  isDragActive ? 'border-teal-600 bg-teal-50' : 'border-gray-300 hover:border-teal-500'
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
                  className={`px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed`}
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

            {/* Instructions Section */}
            <div className="bg-white shadow rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-semibold mb-4">How to Use</h2>
              <ol className="list-decimal pl-5 space-y-3">
                <li className="text-gray-700">
                  <span className="font-medium">Export your case logs</span>: Download your case logs from the ACGME system as a CSV file.
                </li>
                <li className="text-gray-700">
                  <span className="font-medium">Upload the file</span>: Drag and drop your CSV file in the upload section above.
                </li>
                <li className="text-gray-700">
                  <span className="font-medium">Process the data</span>: Click "Process Case Logs" to analyze your surgical cases.
                </li>
                <li className="text-gray-700">
                  <span className="font-medium">Review results</span>: The system will suggest appropriate CPT codes for each case.
                </li>
                <li className="text-gray-700">
                  <span className="font-medium">Download updated logs</span>: Get your updated case logs with the correct CPT codes.
                </li>
              </ol>
            </div>
            
            {/* Features Coming Soon Section */}
            <div className="bg-white shadow rounded-xl p-8">
              <h2 className="text-2xl font-semibold mb-4">
                <div className="flex items-center">
                  <ChartBarIcon className="h-6 w-6 mr-2 text-teal-600" />
                  <span>Features Coming Soon</span>
                </div>
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-teal-600">
                    <ClipboardDocumentIcon className="h-5 w-5" />
                  </div>
                  <p className="ml-3 text-gray-700">Backend processing of CSV files with AI-powered analysis</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-teal-600">
                    <ClipboardDocumentIcon className="h-5 w-5" />
                  </div>
                  <p className="ml-3 text-gray-700">CPT code inference using machine learning algorithms</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-teal-600">
                    <ClipboardDocumentIcon className="h-5 w-5" />
                  </div>
                  <p className="ml-3 text-gray-700">Real-time progress tracking during file processing</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-teal-600">
                    <ClipboardDocumentIcon className="h-5 w-5" />
                  </div>
                  <p className="ml-3 text-gray-700">Interactive results table with sorting and filtering capabilities</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-teal-600">
                    <ClipboardDocumentIcon className="h-5 w-5" />
                  </div>
                  <p className="ml-3 text-gray-700">Downloadable processed results in multiple formats</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
} 