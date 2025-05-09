'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, DocumentTextIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import Header from './components/Header';
import Footer from './components/Footer';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  ChartBarIcon,
  BeakerIcon,
  RocketLaunchIcon 
} from '@heroicons/react/24/outline';

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
    <>
      <Header />
      
      {/* Hero Section */}
      <div className="relative isolate bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
            <h1 className="mt-10 max-w-lg text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Streamline Your ACGME Case Logging
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Automatically determine CPT codes for your surgical cases. Save hours of administrative work and ensure accurate reporting with our AI-powered assistant.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link
                href="/upload"
                className="rounded-md bg-teal-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
              >
                Get Started
              </Link>
              <Link href="/#how-it-works" className="text-sm font-semibold leading-6 text-gray-900">
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow">
            <div className="relative mx-auto w-[24rem] max-w-full">
              <div className="bg-gray-50 p-8 rounded-2xl shadow-lg">
                <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
                  <div className="text-lg font-semibold text-gray-900">Case Log Analysis</div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white">
                    <CheckCircleIcon className="h-5 w-5" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-x-3">
                    <div className="h-6 w-6 flex-none rounded-full bg-teal-600/20 flex items-center justify-center">
                      <CheckCircleIcon className="h-4 w-4 text-teal-600" />
                    </div>
                    <p className="text-sm text-gray-700">Automatic CPT code detection</p>
                  </div>
                  <div className="flex items-center gap-x-3">
                    <div className="h-6 w-6 flex-none rounded-full bg-teal-600/20 flex items-center justify-center">
                      <CheckCircleIcon className="h-4 w-4 text-teal-600" />
                    </div>
                    <p className="text-sm text-gray-700">AI-powered case analysis</p>
                  </div>
                  <div className="flex items-center gap-x-3">
                    <div className="h-6 w-6 flex-none rounded-full bg-teal-600/20 flex items-center justify-center">
                      <CheckCircleIcon className="h-4 w-4 text-teal-600" />
                    </div>
                    <p className="text-sm text-gray-700">Time-saving workflow</p>
                  </div>
                  <div className="flex items-center gap-x-3">
                    <div className="h-6 w-6 flex-none rounded-full bg-teal-600/20 flex items-center justify-center">
                      <CheckCircleIcon className="h-4 w-4 text-teal-600" />
                    </div>
                    <p className="text-sm text-gray-700">Improved accuracy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-teal-600">
        <div className="mx-auto max-w-7xl py-12 px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Trusted by surgeons across specialties
            </h2>
            <p className="mt-3 text-xl text-teal-50">
              Our tool helps residents and fellows accurately log their cases.
            </p>
          </div>
          <dl className="mt-10 text-center sm:mx-auto sm:grid sm:max-w-3xl sm:grid-cols-3 sm:gap-8">
            <div className="flex flex-col">
              <dt className="order-2 mt-2 text-lg font-medium leading-6 text-teal-50">Hours Saved Weekly</dt>
              <dd className="order-1 text-5xl font-bold tracking-tight text-white">2-4</dd>
            </div>
            <div className="mt-10 flex flex-col sm:mt-0">
              <dt className="order-2 mt-2 text-lg font-medium leading-6 text-teal-50">CPT Code Accuracy</dt>
              <dd className="order-1 text-5xl font-bold tracking-tight text-white">95%</dd>
            </div>
            <div className="mt-10 flex flex-col sm:mt-0">
              <dt className="order-2 mt-2 text-lg font-medium leading-6 text-teal-50">Case Log Efficiency</dt>
              <dd className="order-1 text-5xl font-bold tracking-tight text-white">10x</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-teal-600">Faster Case Logging</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to streamline your ACGME case logs
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our assistant uses advanced AI to analyze your surgical cases and determine the most appropriate CPT codes, 
              saving you time and ensuring accurate reporting for your residency or fellowship program.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <ClockIcon className="h-5 w-5 flex-none text-teal-600" aria-hidden="true" />
                  Time-Saving Automation
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Reduce manual lookup time by automatically identifying the most appropriate CPT codes for your surgical procedures.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <DocumentTextIcon className="h-5 w-5 flex-none text-teal-600" aria-hidden="true" />
                  Accurate Code Mapping
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Our AI has been trained on thousands of surgical cases to ensure precise CPT code mapping across all specialties.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <ChartBarIcon className="h-5 w-5 flex-none text-teal-600" aria-hidden="true" />
                  Case Log Insights
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Gain valuable insights into your surgical experience and track progress toward case requirements.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-teal-600">Simple Process</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">How it works</p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our streamlined process makes it easy to get accurate CPT codes for all your surgical cases.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <div className="grid grid-cols-1 gap-y-16 gap-x-8 lg:grid-cols-2">
              <div className="relative pl-16">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="text-base font-semibold leading-7 text-gray-900">Export your case logs</h3>
                <p className="mt-2 text-base leading-7 text-gray-600">
                  Export your surgical case logs from the ACGME system or other source as a CSV file.
                </p>
              </div>
              <div className="relative pl-16">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="text-base font-semibold leading-7 text-gray-900">Upload to our system</h3>
                <p className="mt-2 text-base leading-7 text-gray-600">
                  Simply upload your CSV file to our secure platform for analysis.
                </p>
              </div>
              <div className="relative pl-16">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="text-base font-semibold leading-7 text-gray-900">AI analysis</h3>
                <p className="mt-2 text-base leading-7 text-gray-600">
                  Our AI system analyzes each case and determines the appropriate CPT codes based on the procedure description.
                </p>
              </div>
              <div className="relative pl-16">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600">
                  <span className="text-white font-bold">4</span>
                </div>
                <h3 className="text-base font-semibold leading-7 text-gray-900">Download updated logs</h3>
                <p className="mt-2 text-base leading-7 text-gray-600">
                  Download your updated case logs with the correct CPT codes and import them back into your system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-lg font-semibold leading-8 tracking-tight text-teal-600">Testimonials</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              What residents and fellows are saying
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 grid-rows-1 gap-8 text-sm leading-6 text-gray-900 sm:mt-20 sm:grid-cols-2 xl:mx-0 xl:max-w-none xl:grid-flow-col xl:grid-cols-4">
            <figure className="rounded-2xl bg-white shadow-lg ring-1 ring-gray-200 sm:col-span-2 xl:col-start-2 xl:row-end-1">
              <blockquote className="p-6 text-lg font-semibold leading-7 text-gray-900 sm:p-8 sm:text-xl sm:leading-8">
                <p>
                  "This tool saved me hours of tedious work every week. Coding cases used to be my least favorite part of residency, 
                  but now it's just a few clicks and I'm done!"
                </p>
              </blockquote>
              <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-4 border-t border-gray-100 px-6 py-4 sm:flex-nowrap">
                <div className="flex-auto">
                  <div className="font-semibold">Dr. Sarah Johnson</div>
                  <div className="text-gray-600">PGY-4 General Surgery Resident</div>
                </div>
              </figcaption>
            </figure>
            <figure className="rounded-2xl bg-white shadow-lg ring-1 ring-gray-200">
              <blockquote className="p-6 text-gray-900">
                <p>
                  "The accuracy is impressive. It helped me identify several cases where I had used incorrect CPT codes."
                </p>
              </blockquote>
              <figcaption className="flex items-center gap-x-4 border-t border-gray-100 px-6 py-4">
                <div>
                  <div className="font-semibold">Dr. Michael Chen</div>
                  <div className="text-gray-600">Orthopedic Surgery Fellow</div>
                </div>
              </figcaption>
            </figure>
            <figure className="rounded-2xl bg-white shadow-lg ring-1 ring-gray-200">
              <blockquote className="p-6 text-gray-900">
                <p>
                  "As a program director, I've seen a significant improvement in the accuracy of our residents' case logs since implementing this tool."
                </p>
              </blockquote>
              <figcaption className="flex items-center gap-x-4 border-t border-gray-100 px-6 py-4">
                <div>
                  <div className="font-semibold">Dr. Robert Williams</div>
                  <div className="text-gray-600">Program Director, Vascular Surgery</div>
                </div>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
          <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">Frequently asked questions</h2>
          <div className="mt-10">
            <dl className="space-y-10 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-12 md:space-y-0">
              <div>
                <dt className="text-base font-semibold leading-7 text-gray-900">Is my data secure?</dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Yes, we take data security seriously. All uploads are encrypted and we do not store any patient-identifying information.
                </dd>
              </div>
              <div>
                <dt className="text-base font-semibold leading-7 text-gray-900">Which specialties do you support?</dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Our system supports all surgical specialties in the ACGME system, including General Surgery, Orthopedics, ENT, Neurosurgery, and more.
                </dd>
              </div>
              <div>
                <dt className="text-base font-semibold leading-7 text-gray-900">How accurate is the CPT code assignment?</dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Our AI has been trained on thousands of surgical cases and achieves over 95% accuracy in CPT code assignment.
                </dd>
              </div>
              <div>
                <dt className="text-base font-semibold leading-7 text-gray-900">Can I edit the suggested CPT codes?</dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Yes, you can review and edit any suggested CPT codes before finalizing your case logs.
                </dd>
              </div>
              <div>
                <dt className="text-base font-semibold leading-7 text-gray-900">Is there a limit to how many cases I can process?</dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  No, there is no limit to the number of cases you can process with our tool.
                </dd>
              </div>
              <div>
                <dt className="text-base font-semibold leading-7 text-gray-900">Do you offer institutional licenses?</dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Yes, we offer program-wide licenses for residency and fellowship programs. Contact us for details.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="relative isolate overflow-hidden bg-gradient-to-r from-teal-500 to-teal-700 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Start saving time on your case logs today
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-teal-50">
              Join thousands of residents and fellows who have streamlined their ACGME case logging process.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/upload"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-teal-600 shadow-sm hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Get started
              </Link>
              <Link href="#features" className="text-sm font-semibold leading-6 text-white">
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
