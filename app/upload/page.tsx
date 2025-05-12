'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  CloudArrowUpIcon, 
  DocumentTextIcon, 
  XCircleIcon, 
  ChartBarIcon, 
  ClipboardDocumentIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';

// Types for processing status and result
type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

type Result = {
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
};

type FileInfo = {
  name: string;
  size: number;
  type: string;
  lastModified: number;
};

export default function UploadPage() {
  // State for file and processing
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result[]>([]);
  const [standardizationInfo, setStandardizationInfo] = useState<string>('');

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setFileInfo({
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        lastModified: selectedFile.lastModified
      });
      setStatus('idle');
      setError(null);
      setResult([]);
      setStandardizationInfo('');
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

    try {
      // Set status to uploading
      setStatus('uploading');
      setError(null);
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Send API request
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      // Check for successful response
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      // Parse the response
      const data = await response.json();
      
      // Store standardization info if available
      if (data.standardization) {
        setStandardizationInfo(data.standardization);
      }

      // Set the result
      setResult(data.data || []);
      setStatus('success');
    } catch (err) {
      console.error('Error uploading file:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  // Reset the form
  const handleReset = () => {
    setFile(null);
    setFileInfo(null);
    setStatus('idle');
    setError(null);
    setResult([]);
    setStandardizationInfo('');
  };

  // Format file size for display
  const formatFileSize = (size: number): string => {
    if (size < 1024) return size + ' B';
    else if (size < 1048576) return (size / 1024).toFixed(1) + ' KB';
    else return (size / 1048576).toFixed(1) + ' MB';
  };

  // Format confidence as percentage
  const formatConfidence = (confidence: number): string => {
    return (confidence * 100).toFixed(1) + '%';
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
              {status !== 'success' && (
                <p className="mt-2 text-sm text-orange-600">Demo Version - Limited Backend Processing Available</p>
              )}
            </div>

            {/* File Upload Section */}
            <div className="bg-white shadow rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-semibold mb-6">Upload CSV File</h2>
              
              {status !== 'success' && (
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
              )}

              {fileInfo && status !== 'success' && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md flex items-center justify-between">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-sm font-medium">{fileInfo.name}</span>
                    <span className="ml-2 text-xs text-gray-500">({formatFileSize(fileInfo.size)})</span>
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

              {status !== 'success' && (
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
              )}

              {/* Error message */}
              {error && (
                <div className="mt-4 p-4 text-sm text-amber-700 bg-amber-100 rounded-md">
                  <div className="flex items-center mb-1">
                    <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                    <p className="font-semibold">Error Processing File</p>
                  </div>
                  <p>{error}</p>
                </div>
              )}
              
              {/* Standardization Info */}
              {standardizationInfo && (
                <div className="mt-4 p-4 text-sm text-green-700 bg-green-100 rounded-md">
                  <div className="flex items-center mb-1">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    <p className="font-semibold">Column Standardization</p>
                  </div>
                  <p>{standardizationInfo}</p>
                </div>
              )}
              
              {/* Results section */}
              {status === 'success' && (
                <div className="mt-6">
                  <div className="flex items-center mb-4 text-teal-600">
                    <CheckCircleIcon className="h-6 w-6 mr-2" />
                    <h3 className="text-lg font-semibold">Processing Complete</h3>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    Successfully analyzed {result.length} surgical cases and assigned CPT codes.
                  </p>
                  
                  <div className="mb-6">
                    <button
                      onClick={() => {/* Export functionality would go here */}}
                      className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700"
                    >
                      Export Results
                    </button>
                    <button
                      onClick={handleReset}
                      className="ml-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Process Another File
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto bg-gray-50 rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Procedure
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            CPT Code
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Confidence
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {result.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.procedure_type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.procedure_date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.predicted_cpt_code}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.cpt_description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span 
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  item.confidence >= 0.9 ? 'bg-green-100 text-green-800' : 
                                  item.confidence >= 0.7 ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {formatConfidence(item.confidence)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {status !== 'success' && (
              <>
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
                      <p className="ml-3 text-gray-700">Enhanced AI-powered analysis for higher accuracy</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-teal-600">
                        <ClipboardDocumentIcon className="h-5 w-5" />
                      </div>
                      <p className="ml-3 text-gray-700">Support for more specialized surgical procedures</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-teal-600">
                        <ClipboardDocumentIcon className="h-5 w-5" />
                      </div>
                      <p className="ml-3 text-gray-700">Real-time progress tracking during processing</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-teal-600">
                        <ClipboardDocumentIcon className="h-5 w-5" />
                      </div>
                      <p className="ml-3 text-gray-700">Interactive results table with sorting and filtering</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-teal-600">
                        <ClipboardDocumentIcon className="h-5 w-5" />
                      </div>
                      <p className="ml-3 text-gray-700">Bulk processing and batch uploads</p>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
} 