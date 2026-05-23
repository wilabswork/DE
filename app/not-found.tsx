import Link from 'next/link';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Compass className="w-10 h-10 text-indigo-500" />
        </div>
        <h1 className="text-6xl font-black text-slate-200 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Page not found</h2>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist. It may have been moved or deleted.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
