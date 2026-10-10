import React, { useState, useEffect } from 'react';
import { FoodListing, FoodType, FoodUnit } from '../types';
import { Calendar, Clock, MapPin, Phone, Image as ImageIcon, Utensils, AlertCircle } from 'lucide-react';

interface FoodFormProps {
  initialData?: Partial<FoodListing>;
  onSubmit: (formData: any) => Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export const FoodForm: React.FC<FoodFormProps> = ({
  initialData,
  onSubmit,
  submitLabel = 'Publish Food Listing',
  isSubmitting = false,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [foodType, setFoodType] = useState<FoodType>(initialData?.foodType || 'veg');
  const [quantity, setQuantity] = useState<number>(initialData?.quantity || 50);
  const [unit, setUnit] = useState<FoodUnit>(initialData?.unit || 'plates');
  const [address, setAddress] = useState(initialData?.pickupLocation?.address || '');
  const [city, setCity] = useState(initialData?.pickupLocation?.city || 'Mumbai');
  const [pincode, setPincode] = useState(initialData?.pickupLocation?.pincode || '');

  // Default dates: available now, expires in 12 hours
  const formatDatetimeInput = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const [availableFrom, setAvailableFrom] = useState(
    initialData?.availableFrom
      ? formatDatetimeInput(initialData.availableFrom)
      : formatDatetimeInput(new Date().toISOString())
  );

  const [expiryDate, setExpiryDate] = useState(
    initialData?.expiryDate
      ? formatDatetimeInput(initialData.expiryDate)
      : formatDatetimeInput(new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString())
  );

  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [contactPhone, setContactPhone] = useState(initialData?.contactPhone || '');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Food title is required');
      return;
    }

    if (quantity < 1) {
      setErrorMsg('Quantity must be at least 1');
      return;
    }

    if (!address.trim() || !city.trim()) {
      setErrorMsg('Pickup street address and city are required');
      return;
    }

    const startDate = new Date(availableFrom);
    const endDate = new Date(expiryDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setErrorMsg('Please specify valid dates');
      return;
    }

    if (endDate <= startDate) {
      setErrorMsg('Expiry date and time must be later than Available From date');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      foodType,
      quantity: Number(quantity),
      unit,
      pickupLocation: {
        address: address.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
      },
      availableFrom: startDate.toISOString(),
      expiryDate: endDate.toISOString(),
      imageUrl: imageUrl.trim() || undefined,
      contactPhone: contactPhone.trim(),
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-neutral-200/80 rounded-xl p-6 shadow-xs space-y-6">
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs font-medium text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">1. Food Details</h3>

        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Food Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Fresh Royal Vegetable Biryani & Raita"
            className="w-full px-3.5 py-2 text-xs bg-neutral-50/60 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">Description / Storage Info</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe preparation, containers, packaging (e.g. untouched surplus from buffet, stored in insulated containers at 65°C)."
            className="w-full px-3.5 py-2 text-xs bg-neutral-50/60 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Food Category</label>
            <select
              value={foodType}
              onChange={(e) => setFoodType(e.target.value as FoodType)}
              className="w-full px-3 py-2 text-xs bg-neutral-50/60 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            >
              <option value="veg">Vegetarian</option>
              <option value="non-veg">Non-Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="bakery">Bakery & Breads</option>
              <option value="packaged">Packaged Dry Goods</option>
              <option value="other">Beverages / Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Quantity <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              required
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 text-xs bg-neutral-50/60 border border-neutral-200 rounded-lg font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Unit of Measure</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as FoodUnit)}
              className="w-full px-3 py-2 text-xs bg-neutral-50/60 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            >
              <option value="plates">plates</option>
              <option value="kg">kg (kilograms)</option>
              <option value="packets">packets</option>
              <option value="liters">liters</option>
              <option value="items">items</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pickup Location */}
      <div className="space-y-4 pt-4 border-t border-neutral-100">
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">2. Pickup Location & Logistics</h3>

        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Street Address <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 42 Heritage Boulevard, Bandra West, Rear Loading Dock"
            className="w-full px-3.5 py-2 text-xs bg-neutral-50/60 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              City <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Mumbai"
              className="w-full px-3.5 py-2 text-xs bg-neutral-50/60 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Pincode / Postal Code</label>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="e.g. 400050"
              className="w-full px-3.5 py-2 text-xs bg-neutral-50/60 border border-neutral-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Dates and Timing */}
      <div className="space-y-4 pt-4 border-t border-neutral-100">
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">3. Timeline & Urgency</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Available From <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={availableFrom}
              onChange={(e) => setAvailableFrom(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-50/60 border border-neutral-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Must Be Collected Before (Expiry) <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-50/60 border border-neutral-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Optional Metadata */}
      <div className="space-y-4 pt-4 border-t border-neutral-100">
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">4. Contact & Photos</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Contact Phone (for Driver)</label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full px-3.5 py-2 text-xs bg-neutral-50/60 border border-neutral-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Photo URL (Optional)</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="e.g. /src/assets/images/... or https://..."
              className="w-full px-3.5 py-2 text-xs bg-neutral-50/60 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Form Submission */}
      <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? 'Saving listing...' : submitLabel}
        </button>
      </div>
    </form>
  );
};
