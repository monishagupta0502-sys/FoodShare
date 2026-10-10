import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-neutral-100 text-neutral-500 flex items-center justify-center mb-4">
        <HelpCircle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight font-mono">404</h1>
      <h2 className="mt-1 text-lg font-semibold text-neutral-800">Page Not Found</h2>
      <p className="mt-2 text-xs text-neutral-500 max-w-sm leading-relaxed">
        The link you requested does not exist or has been relocated within the FoodShare system.
      </p>
      <div className="mt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
};
