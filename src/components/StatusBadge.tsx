import React from 'react';
import { ListingStatus, RequestStatus } from '../types';

interface StatusBadgeProps {
  status: ListingStatus | RequestStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyles = () => {
    switch (status) {
      case 'available':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'requested':
      case 'pending':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'claimed':
      case 'accepted':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'completed':
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
      case 'expired':
      case 'rejected':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'cancelled':
      default:
        return 'bg-neutral-100 text-neutral-600 border-neutral-300';
    }
  };

  const formatText = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-md uppercase tracking-wider ${sizeClasses} ${getStyles()}`}
    >
      {formatText(status)}
    </span>
  );
};
