import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  Building,
  Calendar,
  Utensils,
  Send,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Edit2,
  LogIn,
} from 'lucide-react';
import { api } from '../../api/client';
import { FoodListing, User } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { Loader } from '../../components/Loader';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const FoodDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [listing, setListing] = useState<FoodListing | null>(null);
  const [loading, setLoading] = useState(true);

  // Request modal state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [hasAlreadyRequested, setHasAlreadyRequested] = useState(false);

  // Admin delete modal state
  const [isAdminDeleteModalOpen, setIsAdminDeleteModalOpen] = useState(false);

  const fetchListingDetails = async () => {
    if (!id) return;
    try {
      const res = await api.get<FoodListing>(`/food/${id}`);
      if (res.success && res.data) {
        setListing(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Could not load listing details.');
      navigate('/browse');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListingDetails();
  }, [id]);

  // Check if NGO already requested this listing
  useEffect(() => {
    const checkExistingRequest = async () => {
      if (user?.role === 'ngo' && id) {
        try {
          const res = await api.get('/requests/my');
          if (res.success && Array.isArray(res.data)) {
            const match = res.data.find(
              (r: any) =>
                (typeof r.listing === 'object' ? r.listing._id : r.listing) === id &&
                r.status !== 'cancelled' &&
                r.status !== 'rejected'
            );
            if (match) setHasAlreadyRequested(true);
          }
        } catch (e) {
          // ignore
        }
      }
    };
    checkExistingRequest();
  }, [user, id]);

  const handleSendPickupRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) return;

    setIsSubmittingRequest(true);
    try {
      const res = await api.post('/requests', {
        listingId: listing._id,
        message: requestMessage.trim(),
      });

      if (res.success) {
        success('Pickup request submitted to donor! They will be notified.');
        setIsRequestModalOpen(false);
        setHasAlreadyRequested(true);
        await fetchListingDetails();
      }
    } catch (err: any) {
      error(err.message || 'Failed to submit pickup request.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleAdminDelete = async () => {
    if (!listing) return;
    try {
      const res = await api.delete(`/admin/listings/${listing._id}`);
      if (res.success) {
        success('Listing removed by Administrator.');
        navigate('/admin/listings');
      }
    } catch (err: any) {
      error(err.message || 'Failed to delete listing.');
    } finally {
      setIsAdminDeleteModalOpen(false);
    }
  };

  if (loading) {
    return <Loader text="Loading food listing details..." />;
  }

  if (!listing) return null;

  const donor = typeof listing.donor === 'object' ? (listing.donor as User) : null;
  const isAvailable = listing.status === 'available' || listing.status === 'requested';
  const isExpired = new Date(listing.expiryDate).getTime() <= Date.now();
  const isOwner = user?.role === 'donor' && donor?._id === user._id;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      <div className="bg-white border border-neutral-200/80 rounded-2xl overflow-hidden shadow-xs">
        {/* Top Banner image */}
        <div className="relative h-64 sm:h-80 bg-neutral-100">
          <img
            src={listing.imageUrl || '/src/assets/images/foodshare_hero_community_1791608388536.jpg'}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4">
            <StatusBadge status={listing.status} />
          </div>
          <div className="absolute bottom-4 left-4 bg-neutral-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-sm font-mono font-bold tabular-nums">
            {listing.quantity} {listing.unit} Available
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                Category: {listing.foodType}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight leading-snug">
              {listing.title}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              {listing.description || 'Nutritious surplus meal available for community relief.'}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-neutral-100 text-xs">
            <div className="p-4 bg-neutral-50/70 rounded-xl space-y-3 border border-neutral-100">
              <div className="font-semibold text-neutral-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Pickup Location & Coordinates</span>
              </div>
              <div className="text-neutral-700 pl-6 space-y-0.5">
                <p className="font-medium">{listing.pickupLocation.address}</p>
                <p className="text-neutral-500">
                  {listing.pickupLocation.city} {listing.pickupLocation.pincode && `· ${listing.pickupLocation.pincode}`}
                </p>
              </div>
            </div>

            <div className="p-4 bg-neutral-50/70 rounded-xl space-y-3 border border-neutral-100">
              <div className="font-semibold text-neutral-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Timeline & Expiry Window</span>
              </div>
              <div className="text-neutral-700 pl-6 space-y-1 font-mono text-[11px] tabular-nums">
                <p>Available: {new Date(listing.availableFrom).toLocaleString()}</p>
                <p className={isExpired ? 'text-rose-600 font-bold' : 'text-neutral-800 font-medium'}>
                  Expires: {new Date(listing.expiryDate).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Donor & Contact Info */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-neutral-900">
                <Building className="w-4 h-4 text-emerald-600" />
                <span>Donor: {donor?.name || 'Verified Kitchen'}</span>
              </div>
              <span className="text-[11px] text-neutral-400">Donor ID: {donor?._id || 'Registered'}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600">
              <Phone className="w-3.5 h-3.5 text-neutral-400" />
              <span>Contact Phone: </span>
              <span className="font-mono font-medium text-neutral-900">{listing.contactPhone}</span>
            </div>
            {listing.contactPhone === 'Visible upon request acceptance' && (
              <p className="text-[11px] text-neutral-400 italic">
                * Direct phone numbers are unlocked once the donor accepts your NGO pickup request.
              </p>
            )}
          </div>

          {/* Role-Specific Action Area (STRICT RBAC ENFORCEMENT) */}
          <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-xs text-neutral-500 font-mono">
              Listed on {new Date(listing.createdAt).toLocaleDateString()}
            </div>

            {/* NGO Role Action */}
            {user?.role === 'ngo' && (
              <div>
                {hasAlreadyRequested ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 bg-sky-50 px-3 py-2 rounded-lg border border-sky-200">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pickup Request Submitted</span>
                  </div>
                ) : isAvailable && !isExpired ? (
                  <button
                    onClick={() => setIsRequestModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Request Pickup</span>
                  </button>
                ) : (
                  <span className="text-xs font-medium text-neutral-400">
                    Listing is not currently available for pickup requests.
                  </span>
                )}
              </div>
            )}

            {/* Donor Role Action (Owner vs Non-Owner) */}
            {user?.role === 'donor' && (
              <div>
                {isOwner ? (
                  <div className="flex items-center gap-2">
                    {listing.status === 'available' && (
                      <Link
                        to={`/donor/edit-food/${listing._id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 border border-neutral-300 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Your Listing</span>
                      </Link>
                    )}
                    <Link
                      to="/donor/requests"
                      className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                    >
                      View Requests
                    </Link>
                  </div>
                ) : (
                  <span className="text-xs text-neutral-500 italic">
                    Viewing as a donor. Only verified NGOs can request pickups.
                  </span>
                )}
              </div>
            )}

            {/* Admin Role Action */}
            {user?.role === 'admin' && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-2.5 py-1 rounded border border-purple-200">
                  Admin Oversight
                </span>
                <button
                  onClick={() => setIsAdminDeleteModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Listing</span>
                </button>
              </div>
            )}

            {/* Guest Action */}
            {!user && (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign in as NGO to Request</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Pickup Request Modal (Only accessible to NGO) */}
      {isRequestModalOpen && user?.role === 'ngo' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="space-y-1 mb-4">
              <h3 className="text-base font-bold text-neutral-900">Request Food Pickup</h3>
              <p className="text-xs text-neutral-500">
                Specify your vehicle or estimated pickup arrival time to help the donor prepare.
              </p>
            </div>

            <form onSubmit={handleSendPickupRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Pickup Message / Estimated Time (Optional)
                </label>
                <textarea
                  rows={3}
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="e.g. Our insulated van can arrive within 45 minutes for this batch."
                  className="w-full px-3.5 py-2 text-xs bg-neutral-50/70 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRequest}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingRequest ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isAdminDeleteModalOpen}
        title="Admin Delete Listing?"
        message={`Are you sure you want to delete "${listing.title}" as platform administrator? This action is permanent.`}
        confirmLabel="Confirm Delete"
        isDangerous={true}
        onConfirm={handleAdminDelete}
        onCancel={() => setIsAdminDeleteModalOpen(false)}
      />
    </div>
  );
};
