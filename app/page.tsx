"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, AlertCircle, CheckCircle, FileText, Download, ArrowRightLeft } from 'lucide-react';

// Enhanced response type for view mode
interface ViewResponse {
  status: string;
  message: string;
  fileInfo?: {
    name: string;
    type: string;
    size: number;
  };
  fileType?: 'csv' | 'text';
  data?: {
    headers?: string[];
    rows?: Record<string, string>[];
    totalRows?: number;
    content?: string;
  };
  errorDetails?: string;
}

// Response type for standardize mode
interface StandardizeResponse {
  status: string;
  message: string;
  fileInfo?: {
    name: string;
    type: string;
    size: number;
  };
  standardization?: {
    job_id: string;
    original_headers: string[];
    column_mapping: Record<string, string>;
    standardized_data: Record<string, string>[];
    original_data: Record<string, string>[];
    total_rows: number;
  };
  errorDetails?: string;
}

type ApiResponse = ViewResponse | StandardizeResponse;

// Helper function to generate CSV content from data
function generateCSV(data: Record<string, string>[], headers?: string[]): string {
  if (!data || data.length === 0) return '';
  
  // If headers not provided, use keys from first row
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create header row
  let csvContent = csvHeaders.join(',') + '\n';
  
  // Add data rows
  data.forEach(row => {
    const rowValues = csvHeaders.map(header => {
      // Handle values with commas by wrapping in quotes
      const value = row[header] || '';
      return value.includes(',') ? `"${value}"` : value;
    });
    csvContent += rowValues.join(',') + '\n';
  });
  
  return csvContent;
}

// Helper function to download data as a CSV file
function downloadCSV(data: Record<string, string>[], filename: string, headers?: string[]) {
  const csvContent = generateCSV(data, headers);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function Home() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [standardizeMode, setStandardizeMode] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    setError(null);
    setResponse(null);

    if (acceptedFiles.length === 0) {
      setError('No file selected');
      setIsUploading(false);
      return;
    }

    const file = acceptedFiles[0];
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Sending file:', file.name);
      
      // Add mode parameter for standardization
      const url = standardizeMode 
        ? '/api/upload?mode=standardize' 
        : '/api/upload?mode=view';
      
      const fetchResponse = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', fetchResponse.status);
      
      const data = await fetchResponse.json();
      console.log('Response data:', data);

      setResponse(data);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsUploading(false);
    }
  }, [standardizeMode]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
  });

  const resetAll = () => {
    setResponse(null);
    setError(null);
  };

  // Check if response has standardization field (type guard)
  const hasStandardization = (resp: ApiResponse): resp is StandardizeResponse => {
    return 'standardization' in resp && !!resp.standardization;
  };

  // Download handlers
  const handleDownloadStandardized = () => {
    if (!response || !hasStandardization(response) || !response.standardization) return;
    
    const standardizedData = response.standardization.standardized_data;
    const standardizedHeaders = standardizedData.length > 0 ? Object.keys(standardizedData[0]) : [];
    
    // Generate filename based on original filename
    const originalName = response.fileInfo?.name || 'data.csv';
    const newName = originalName.replace('.csv', '_standardized.csv');
    
    downloadCSV(standardizedData, newName, standardizedHeaders);
  };

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Surgical Case File Processor</h1>
          <p className="text-gray-600 mt-2">
            Upload a CSV file to view or standardize its contents
          </p>
        </header>

        {/* Mode Toggle */}
        <div className="mb-6 flex items-center">
          <button 
            onClick={() => setStandardizeMode(!standardizeMode)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
          >
            <ArrowRightLeft className="h-4 w-4 text-gray-500" />
            <span>
              {standardizeMode ? 'Switch to View Mode' : 'Switch to Standardize Mode'}
            </span>
          </button>
          <div className="ml-3 text-sm text-gray-600">
            {standardizeMode ? 
              'Standardize mode maps column names and formats data for consistency' : 
              'View mode displays file contents without modification'}
          </div>
        </div>

        {!response && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center">
              <UploadCloud className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">
                {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {standardizeMode ? 
                  'Only CSV files can be standardized' : 
                  'Upload any file to view its contents'}
              </p>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="border rounded-lg p-6 my-4 bg-white">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-700">
                {standardizeMode ? 'Processing and standardizing file...' : 'Uploading file...'}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="border rounded-lg p-6 my-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
              <div>
                <h3 className="font-medium text-yellow-800">Error</h3>
                <p className="text-yellow-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {response && (
          <div className="border rounded-lg p-6 my-4 bg-white">
            <div className="flex items-start mb-4">
              {response.status === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
              )}
              <div>
                <h3 className={`font-medium ${response.status === 'success' ? 'text-green-800' : 'text-yellow-800'}`}>
                  {response.status === 'success' ? 'Success' : 'Error'}
                </h3>
                <p className={response.status === 'success' ? 'text-green-700' : 'text-yellow-700'}>
                  {response.message}
                </p>
                {response.errorDetails && (
                  <p className="text-red-500 mt-2">{response.errorDetails}</p>
                )}
              </div>
            </div>

            {response.fileInfo && (
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h4 className="font-medium text-gray-700 mb-2">File Information</h4>
                <p><span className="font-medium">Name:</span> {response.fileInfo.name}</p>
                <p><span className="font-medium">Type:</span> {response.fileInfo.type}</p>
                <p><span className="font-medium">Size:</span> {Math.round(response.fileInfo.size / 1024)} KB</p>
              </div>
            )}
            
            {/* Standardization Results */}
            {hasStandardization(response) && response.standardization && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-700">Standardization Results</h4>
                  <button
                    onClick={handleDownloadStandardized}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-md"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Standardized CSV</span>
                  </button>
                </div>
                
                {/* Column Mapping Table */}
                <div className="bg-blue-50 p-4 rounded-md mb-4">
                  <h5 className="font-medium text-blue-800 mb-2">Column Mapping</h5>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-blue-100 rounded-md">
                      <thead className="bg-blue-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-blue-800">Original Column</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-blue-800">Standardized Column</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(response.standardization.column_mapping).map(([original, standardized], index) => (
                          <tr key={index} className="border-t border-blue-100">
                            <td className="px-4 py-2 text-sm">{original}</td>
                            <td className="px-4 py-2 text-sm font-medium text-blue-700">{standardized}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Data Comparison - Before and After */}
                <div className="mt-4">
                  <h5 className="font-medium text-gray-700 mb-2">Data Comparison</h5>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Original Data */}
                    <div>
                      <h6 className="text-sm font-medium text-gray-700 mb-2">Original Data</h6>
                      <div className="overflow-x-auto border rounded-md max-h-96 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {response.standardization.original_headers.map((header, index) => (
                                <th 
                                  key={index}
                                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {response.standardization.original_data.map((row, rowIndex) => (
                              <tr key={rowIndex}>
                                {response.standardization?.original_headers.map((header, cellIndex) => (
                                  <td 
                                    key={`${rowIndex}-${cellIndex}`}
                                    className="px-4 py-2 whitespace-nowrap text-xs text-gray-500"
                                  >
                                    {row[header]}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    {/* Standardized Data */}
                    <div>
                      <h6 className="text-sm font-medium text-gray-700 mb-2">Standardized Data</h6>
                      <div className="overflow-x-auto border rounded-md max-h-96 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {response.standardization.standardized_data.length > 0 && 
                                Object.keys(response.standardization.standardized_data[0]).map((header, index) => (
                                  <th 
                                    key={index}
                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    {header}
                                  </th>
                                ))
                              }
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {response.standardization.standardized_data.map((row, rowIndex) => (
                              <tr key={rowIndex}>
                                {Object.entries(row).map(([header, value], cellIndex) => (
                                  <td 
                                    key={`${rowIndex}-${cellIndex}`}
                                    className="px-4 py-2 whitespace-nowrap text-xs text-gray-500"
                                  >
                                    {value}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-2">
                    Showing first {response.standardization.standardized_data.length} rows of {response.standardization.total_rows} total rows
                  </p>
                </div>
              </div>
            )}
            
            {/* Regular View Mode Results */}
            {'data' in response && response.data && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-700 mb-2">File Contents</h4>
                
                {/* CSV Data */}
                {response.fileType === 'csv' && response.data.headers && response.data.rows && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      {response.data.totalRows && response.data.totalRows > 100 
                        ? `Showing first 100 rows of ${response.data.totalRows} total rows` 
                        : `${response.data.rows.length} rows total`}
                    </p>
                    
                    <div className="overflow-x-auto mt-3">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {response.data.headers.map((header, index) => (
                              <th 
                                key={index}
                                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {response.data.rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {response.data?.headers?.map((header, cellIndex) => (
                                <td 
                                  key={`${rowIndex}-${cellIndex}`}
                                  className="px-4 py-2 whitespace-nowrap text-xs text-gray-500"
                                >
                                  {row[header]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Text Data */}
                {response.fileType === 'text' && response.data.content && (
                  <div className="mt-3">
                    <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto">
                      {response.data.content}
                    </pre>
                    {response.data.content.length >= 50000 && (
                      <p className="text-sm text-gray-500 mt-2">Content truncated (showing first 50,000 characters)</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {response && (
          <div className="flex justify-center mt-6">
            <button
              onClick={resetAll}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 
                hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
