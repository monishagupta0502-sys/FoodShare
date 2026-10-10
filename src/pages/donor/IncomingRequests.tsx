import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { PickupRequest, User, FoodListing } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { Loader } from '../../components/Loader';
import { EmptyState } from '../../components/EmptyState';
import { useToast } from '../../context/ToastContext';
import { Check, X, CheckCircle, MessageSquare, Phone, Building, UserCheck } from 'lucide-react';

export const IncomingRequests: React.FC = () => {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { success, error } = useToast();

  const fetchIncoming = async () => {
    try {
      setLoading(true);
      const res = await api.get<PickupRequest[]>('/requests/incoming');
      if (res.success && res.data) {
        setRequests(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to fetch incoming requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncoming();
  }, []);

  const handleAccept = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await api.put(`/requests/${id}/accept`);
      if (res.success) {
        success('Pickup request accepted! The listing is now claimed.');
        await fetchIncoming();
      }
    } catch (err: any) {
      error(err.message || 'Could not accept request.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await api.put(`/requests/${id}/reject`);
      if (res.success) {
        success('Pickup request rejected.');
        await fetchIncoming();
      }
    } catch (err: any) {
      error(err.message || 'Could not reject request.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleComplete = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await api.put(`/requests/${id}/complete`);
      if (res.success) {
        success('Donation marked as successfully completed!');
        await fetchIncoming();
      }
    } catch (err: any) {
      error(err.message || 'Could not complete request.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <Loader text="Loading incoming NGO pickup requests..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Incoming Pickup Requests</h1>
        <p className="text-xs text-neutral-500">
          Review requests submitted by registered humanitarian organizations for your food listings
        </p>
      </div>

      {requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((req) => {
            const ngo = req.ngo as User;
            const listing = req.listing as FoodListing;

            return (
              <div
                key={req._id}
                className="bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs hover:shadow-sm transition-shadow space-y-4"
              >
                {/* Top Row: Listing Title & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-neutral-100">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-mono text-neutral-400">Request #{req._id}</span>
                    <h3 className="text-sm font-bold text-neutral-900">{listing?.title || 'Food Listing'}</h3>
                    <div className="text-xs text-neutral-500 font-mono tabular-nums">
                      Quantity: <span className="font-semibold text-neutral-800">{listing?.quantity} {listing?.unit}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={req.status} />
                  </div>
                </div>

                {/* NGO Information & Message */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5 bg-neutral-50/70 p-3.5 rounded-lg border border-neutral-100">
                    <div className="flex items-center gap-2 font-semibold text-neutral-900">
                      <Building className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{ngo?.organizationName || ngo?.name || 'Verified NGO'}</span>
                    </div>
                    {ngo?.registrationNumber && (
                      <div className="text-neutral-500 font-mono text-[11px]">
                        Reg: {ngo.registrationNumber}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{ngo?.phone || 'No phone provided'}</span>
                    </div>
                    <div className="text-neutral-500">
                      Address: {ngo?.address || 'City Center'}
                    </div>
                  </div>

                  <div className="space-y-1.5 bg-neutral-50/70 p-3.5 rounded-lg border border-neutral-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 font-semibold text-neutral-700 mb-1">
                        <MessageSquare className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Pickup Notes from NGO</span>
                      </div>
                      <p className="text-neutral-600 leading-relaxed italic">
                        "{req.message || 'We can arrange immediate pickup with our team.'}"
                      </p>
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono pt-2">
                      Received: {new Date(req.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  {req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleReject(req._id)}
                        disabled={processingId === req._id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleAccept(req._id)}
                        disabled={processingId === req._id}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept & Claim</span>
                      </button>
                    </>
                  )}

                  {req.status === 'accepted' && (
                    <button
                      onClick={() => handleComplete(req._id)}
                      disabled={processingId === req._id}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Mark Pickup Completed</span>
                    </button>
                  )}

                  {req.status === 'completed' && (
                    <span className="text-xs font-semibold text-neutral-500 inline-flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Donation Successfully Handed Over
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No incoming requests yet"
          description="When an NGO requests food from your listings, their pickup message and ETA will appear right here."
        />
      )}
    </div>
  );
};
