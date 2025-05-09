import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-xs leading-5 text-gray-500">
            &copy; {currentYear} ACGME Case Log Assistant. All rights reserved.
          </p>
        </div>
        <div className="flex justify-center space-x-6 md:order-2">
          <Link href="/upload" className="text-gray-600 hover:text-teal-600 text-sm">
            Upload Logs
          </Link>
          <Link href="/#features" className="text-gray-600 hover:text-teal-600 text-sm">
            Features
          </Link>
          <Link href="/#how-it-works" className="text-gray-600 hover:text-teal-600 text-sm">
            How It Works
          </Link>
          <Link href="/privacy-policy" className="text-gray-600 hover:text-teal-600 text-sm">
            Privacy
          </Link>
          <Link href="/terms" className="text-gray-600 hover:text-teal-600 text-sm">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
} 