import React from 'react';

export const Loader: React.FC<{ text?: string }> = ({ text = 'Loading details...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 gap-3">
      <div className="w-8 h-8 border-3 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin" />
      <span className="text-xs font-medium text-neutral-500">{text}</span>
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-neutral-200/80 rounded-xl overflow-hidden animate-pulse">
      <div className="h-44 bg-neutral-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-neutral-200 rounded w-3/4" />
        <div className="h-3 bg-neutral-100 rounded w-1/2" />
        <div className="h-8 bg-neutral-100 rounded w-full mt-4" />
      </div>
    </div>
  );
};
