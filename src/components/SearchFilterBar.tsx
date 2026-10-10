import React from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { FoodType, ListingStatus } from '../types';

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  foodType: string;
  onFoodTypeChange: (val: string) => void;
  city: string;
  onCityChange: (val: string) => void;
  status?: string;
  onStatusChange?: (val: string) => void;
  sortBy: string;
  onSortByChange: (val: string) => void;
  order: string;
  onOrderChange: (val: string) => void;
  availableCities?: string[];
  showStatusFilter?: boolean;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  search,
  onSearchChange,
  foodType,
  onFoodTypeChange,
  city,
  onCityChange,
  status = 'all',
  onStatusChange,
  sortBy,
  onSortByChange,
  order,
  onOrderChange,
  availableCities = ['All Cities', 'Mumbai', 'Bangalore', 'New Delhi'],
  showStatusFilter = false,
}) => {
  const foodTypes: { label: string; value: string }[] = [
    { label: 'All Types', value: 'all' },
    { label: 'Vegetarian', value: 'veg' },
    { label: 'Non-Vegetarian', value: 'non-veg' },
    { label: 'Vegan', value: 'vegan' },
    { label: 'Bakery', value: 'bakery' },
    { label: 'Packaged', value: 'packaged' },
    { label: 'Other', value: 'other' },
  ];

  return (
    <div className="bg-white border border-neutral-200/80 rounded-xl p-4 shadow-xs space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="relative md:col-span-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search food title, description, or city..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-neutral-50/70 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
          />
        </div>

        {/* Food Type Selector */}
        <div className="md:col-span-3">
          <select
            value={foodType}
            onChange={(e) => onFoodTypeChange(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-neutral-50/70 border border-neutral-200 rounded-lg text-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          >
            {foodTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div className="md:col-span-2">
          <select
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-neutral-50/70 border border-neutral-200 rounded-lg text-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          >
            {availableCities.map((c) => (
              <option key={c} value={c === 'All Cities' ? 'all' : c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Sort & Order */}
        <div className="md:col-span-2 flex items-center gap-1">
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="flex-1 px-2.5 py-2 text-xs bg-neutral-50/70 border border-neutral-200 rounded-lg text-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          >
            <option value="expiryDate">Expiry Date</option>
            <option value="createdAt">Date Listed</option>
            <option value="quantity">Quantity</option>
          </select>
          <button
            type="button"
            onClick={() => onOrderChange(order === 'asc' ? 'desc' : 'asc')}
            title={`Sort ${order === 'asc' ? 'Descending' : 'Ascending'}`}
            className="p-2 border border-neutral-200 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-neutral-700 transition-colors cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showStatusFilter && onStatusChange && (
        <div className="pt-2 border-t border-neutral-100 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Status:</span>
          {['all', 'available', 'requested', 'claimed', 'completed', 'expired'].map((st) => (
            <button
              key={st}
              onClick={() => onStatusChange(st)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                status === st
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
