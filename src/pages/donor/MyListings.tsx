import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit2, Clock, MapPin, Eye } from 'lucide-react';
import { api } from '../../api/client';
import { FoodListing, ListingStatus } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { ConfirmModal } from '../../components/ConfirmModal';
import { Loader } from '../../components/Loader';
import { EmptyState } from '../../components/EmptyState';
import { useToast } from '../../context/ToastContext';

export const MyListings: React.FC = () => {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteCandidate, setDeleteCandidate] = useState<FoodListing | null>(null);

  const navigate = useNavigate();
  const { success, error } = useToast();

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const res = await api.get<FoodListing[]>('/food/my');
      if (res.success && res.data) {
        setListings(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to fetch food listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    try {
      const res = await api.delete(`/food/${deleteCandidate._id}`);
      if (res.success) {
        success('Food listing deleted and any pending requests cancelled.');
        setListings((prev) => prev.filter((l) => l._id !== deleteCandidate._id));
      }
    } catch (err: any) {
      error(err.message || 'Failed to delete listing.');
    } finally {
      setDeleteCandidate(null);
    }
  };

  const filteredListings = listings.filter((l) => {
    if (statusFilter === 'all') return true;
    return l.status === statusFilter;
  });

  const statuses: { label: string; value: string }[] = [
    { label: 'All Listings', value: 'all' },
    { label: 'Available', value: 'available' },
    { label: 'Requested', value: 'requested' },
    { label: 'Claimed', value: 'claimed' },
    { label: 'Completed', value: 'completed' },
    { label: 'Expired', value: 'expired' },
  ];

  if (loading) {
    return <Loader text="Loading your listings..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">My Food Listings</h1>
          <p className="text-xs text-neutral-500">
            Track and manage all surplus food items created by your kitchen
          </p>
        </div>

        <Link
          to="/donor/add-food"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Food Listing</span>
        </Link>
      </div>

      {/* Segmented Status Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl overflow-x-auto">
        {statuses.map((st) => (
          <button
            key={st.value}
            onClick={() => setStatusFilter(st.value)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              statusFilter === st.value
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {st.label}{' '}
            <span className="font-mono text-[11px] opacity-75 tabular-nums">
              ({st.value === 'all' ? listings.length : listings.filter((l) => l.status === st.value).length})
            </span>
          </button>
        ))}
      </div>

      {/* Listings Table / Grid */}
      {filteredListings.length > 0 ? (
        <div className="bg-white border border-neutral-200/80 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/75 border-b border-neutral-100 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Listing Title</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Quantity</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Pickup Location</th>
                  <th className="px-6 py-3.5">Expiry Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredListings.map((item) => (
                  <tr key={item._id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-neutral-900 max-w-xs truncate">{item.title}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">ID: {item._id}</div>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 capitalize">{item.foodType}</td>
                    <td className="px-6 py-4 font-mono font-medium tabular-nums text-neutral-800">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-neutral-600 max-w-xs truncate">
                      {item.pickupLocation.city} · {item.pickupLocation.address}
                    </td>
                    <td className="px-6 py-4 font-mono tabular-nums text-neutral-500 whitespace-nowrap">
                      {new Date(item.expiryDate).toLocaleDateString()}{' '}
                      {new Date(item.expiryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/food/${item._id}`}
                          className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        {item.status === 'available' && (
                          <Link
                            to={`/donor/edit-food/${item._id}`}
                            className="p-1.5 text-neutral-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Edit Listing"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        <button
                          onClick={() => setDeleteCandidate(item)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title={`No ${statusFilter === 'all' ? '' : statusFilter} listings found`}
          description="You do not have any listings matching this status category."
          actionText="Create New Listing"
          onAction={() => navigate('/donor/add-food')}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteCandidate)}
        title="Delete Food Listing?"
        message={`Are you sure you want to permanently delete "${deleteCandidate?.title}"? Any pending pickup requests on this listing will be automatically cancelled.`}
        confirmLabel="Yes, Delete"
        isDangerous={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
};
