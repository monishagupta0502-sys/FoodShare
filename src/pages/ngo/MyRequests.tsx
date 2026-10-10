import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { PickupRequest, FoodListing, User } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { Loader } from '../../components/Loader';
import { EmptyState } from '../../components/EmptyState';
import { useToast } from '../../context/ToastContext';
import { X, Building, Phone, MapPin, Eye } from 'lucide-react';

export const MyRequests: React.FC = () => {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const { success, error } = useToast();

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get<PickupRequest[]>('/requests/my');
      if (res.success && res.data) {
        setRequests(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Could not fetch your requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      const res = await api.put(`/requests/${id}/cancel`);
      if (res.success) {
        success('Pickup request cancelled.');
        await fetchMyRequests();
      }
    } catch (err: any) {
      error(err.message || 'Failed to cancel request.');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return <Loader text="Loading your pickup requests..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">My Pickup Requests</h1>
        <p className="text-xs text-neutral-500">
          Track pickup requests submitted by your organization and coordinate collections
        </p>
      </div>

      {requests.length > 0 ? (
        <div className="bg-white border border-neutral-200/80 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/75 border-b border-neutral-100 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Food Listing</th>
                  <th className="px-6 py-3.5">Donor Kitchen</th>
                  <th className="px-6 py-3.5">Request Status</th>
                  <th className="px-6 py-3.5">Pickup Location</th>
                  <th className="px-6 py-3.5">Contact Phone</th>
                  <th className="px-6 py-3.5">Requested On</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {requests.map((r) => {
                  const listing = r.listing as FoodListing;
                  const donor = r.donor as User;
                  const isAccepted = r.status === 'accepted' || r.status === 'completed';

                  return (
                    <tr key={r._id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-neutral-900 max-w-xs truncate">
                          {listing?.title || 'Listing unavailable'}
                        </div>
                        <div className="text-[11px] font-mono text-neutral-500">
                          {listing?.quantity} {listing?.unit}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-neutral-800">{donor?.name || 'Verified Donor'}</div>
                        <div className="text-[11px] text-neutral-400">{donor?.email}</div>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={r.status} size="sm" />
                      </td>

                      <td className="px-6 py-4 text-neutral-600 max-w-xs truncate">
                        {listing?.pickupLocation?.city} · {listing?.pickupLocation?.address}
                      </td>

                      <td className="px-6 py-4 font-mono text-[11px]">
                        {isAccepted ? (
                          <span className="text-emerald-700 font-semibold">{donor?.phone || 'Contact Donor'}</span>
                        ) : (
                          <span className="text-neutral-400 italic">Unlocked when accepted</span>
                        )}
                      </td>

                      <td className="px-6 py-4 font-mono text-neutral-500 tabular-nums whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {listing && (
                            <Link
                              to={`/food/${listing._id}`}
                              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
                              title="View Food Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          {r.status === 'pending' && (
                            <button
                              onClick={() => handleCancel(r._id)}
                              disabled={cancellingId === r._id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No pickup requests submitted"
          description="Browse available surplus food listings in your city and submit your first pickup request."
          actionText="Browse Available Food"
          onAction={() => {}}
        />
      )}
    </div>
  );
};
