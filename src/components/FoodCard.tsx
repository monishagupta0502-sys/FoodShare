import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Utensils, Calendar, ChevronRight } from 'lucide-react';
import { FoodListing, User } from '../types';
import { StatusBadge } from './StatusBadge';

interface FoodCardProps {
  listing: FoodListing;
  showActions?: boolean;
  onEdit?: (listing: FoodListing) => void;
  onDelete?: (listing: FoodListing) => void;
  isOwner?: boolean;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  listing,
  showActions = true,
  onEdit,
  onDelete,
  isOwner = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const expiry = new Date(listing.expiryDate).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        setIsExpired(true);
        return;
      }

      setIsExpired(false);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d ${hours % 24}h left`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m left`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [listing.expiryDate]);

  const donorName =
    typeof listing.donor === 'object' && listing.donor !== null
      ? (listing.donor as User).name
      : 'Verified Donor';

  const typeColorMap: Record<string, string> = {
    veg: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    'non-veg': 'text-amber-800 bg-amber-50 border-amber-200',
    vegan: 'text-teal-700 bg-teal-50 border-teal-200',
    bakery: 'text-orange-700 bg-orange-50 border-orange-200',
    packaged: 'text-blue-700 bg-blue-50 border-blue-200',
    other: 'text-purple-700 bg-purple-50 border-purple-200',
  };

  return (
    <div className="group bg-white border border-neutral-200/80 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col">
      {/* Visual Header / Image Container */}
      <div className="relative h-44 bg-neutral-100 overflow-hidden">
        {listing.imageUrl && !imgError ? (
          <img
            src={listing.imageUrl}
            alt={listing.title}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-neutral-100 text-neutral-400 p-4">
            <Utensils className="w-10 h-10 text-emerald-600/40 mb-2" />
            <span className="text-xs font-medium text-neutral-500">FoodShare Rescue Meal</span>
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border backdrop-blur-md ${
              typeColorMap[listing.foodType] || 'text-neutral-700 bg-neutral-100 border-neutral-200'
            }`}
          >
            {listing.foodType}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <StatusBadge status={listing.status} size="sm" />
        </div>

        {/* Quantity Overlay */}
        <div className="absolute bottom-3 left-3 bg-neutral-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-xs font-mono font-medium tabular-nums flex items-center gap-1.5 shadow-xs">
          <span>{listing.quantity}</span>
          <span className="text-[11px] font-sans text-neutral-300 lowercase">{listing.unit}</span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 leading-snug line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {listing.title}
          </h3>
          <p className="mt-1 text-xs text-neutral-500 line-clamp-2 leading-relaxed">
            {listing.description || 'Nutritious surplus meal available for quick NGO rescue.'}
          </p>

          <div className="mt-3.5 space-y-1.5 text-xs text-neutral-500">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="truncate">{listing.pickupLocation.city} · {listing.pickupLocation.address}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Clock className={`w-3.5 h-3.5 shrink-0 ${isExpired ? 'text-rose-500' : 'text-amber-500'}`} />
              <span className={`font-mono text-[11px] tabular-nums ${isExpired ? 'text-rose-600 font-semibold' : 'text-neutral-600'}`}>
                {timeLeft}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
          <div className="text-[11px] text-neutral-400 truncate max-w-[130px]">
            Donor: <span className="font-medium text-neutral-700">{donorName}</span>
          </div>

          {showActions && (
            <div className="flex items-center gap-2">
              {isOwner ? (
                <>
                  {listing.status === 'available' && onEdit && (
                    <button
                      onClick={() => onEdit(listing)}
                      className="px-2.5 py-1 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(listing)}
                      className="px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  )}
                </>
              ) : (
                <Link
                  to={`/food/${listing._id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                >
                  <span>Details</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
