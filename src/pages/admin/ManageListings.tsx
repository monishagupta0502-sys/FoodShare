import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { FoodListing, User } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { Loader } from '../../components/Loader';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import { Trash2, Eye, MapPin, Building, Utensils } from 'lucide-react';

export const ManageListings: React.FC = () => {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteCandidate, setDeleteCandidate] = useState<FoodListing | null>(null);

  const { success, error } = useToast();

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await api.get<FoodListing[]>('/admin/listings');
      if (res.success && res.data) {
        setListings(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load platform listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    try {
      const res = await api.delete(`/admin/listings/${deleteCandidate._id}`);
      if (res.success) {
        success('Food listing permanently removed.');
        setListings((prev) => prev.filter((l) => l._id !== deleteCandidate._id));
      }
    } catch (err: any) {
      error(err.message || 'Failed to delete listing.');
    } finally {
      setDeleteCandidate(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Manage All Listings</h1>
        <p className="text-xs text-neutral-500">
          Supervise every surplus food batch listed across all donors and locations
        </p>
      </div>

      {loading ? (
        <Loader text="Loading marketplace listings..." />
      ) : (
        <div className="bg-white border border-neutral-200/80 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/75 border-b border-neutral-100 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Listing Title</th>
                  <th className="px-6 py-3.5">Donor</th>
                  <th className="px-6 py-3.5">Quantity</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">Expiry Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {listings.map((l) => {
                  const donor = typeof l.donor === 'object' ? (l.donor as User) : null;

                  return (
                    <tr key={l._id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-neutral-900 max-w-xs truncate">{l.title}</div>
                        <div className="text-[11px] font-mono text-neutral-400">ID: {l._id}</div>
                      </td>

                      <td className="px-6 py-4 text-neutral-800">
                        <div className="font-medium truncate max-w-[150px]">
                          {donor?.name || 'Verified Kitchen'}
                        </div>
                        <div className="text-[11px] text-neutral-400 truncate max-w-[150px]">
                          {donor?.email}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono font-medium tabular-nums text-neutral-900 whitespace-nowrap">
                        {l.quantity} {l.unit}
                      </td>

                      <td className="px-6 py-4 text-neutral-600 capitalize">{l.foodType}</td>

                      <td className="px-6 py-4">
                        <StatusBadge status={l.status} size="sm" />
                      </td>

                      <td className="px-6 py-4 text-neutral-600 max-w-xs truncate">
                        {l.pickupLocation?.city} · {l.pickupLocation?.address}
                      </td>

                      <td className="px-6 py-4 font-mono tabular-nums text-neutral-500 whitespace-nowrap">
                        {new Date(l.expiryDate).toLocaleDateString()}{' '}
                        {new Date(l.expiryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/food/${l._id}`}
                            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => setDeleteCandidate(l)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Remove listing as admin"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteCandidate)}
        title="Admin Delete Listing?"
        message={`Are you sure you want to permanently delete "${deleteCandidate?.title}"? Any pending pickup requests on this listing will also be cancelled.`}
        confirmLabel="Delete Listing"
        isDangerous={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
};
