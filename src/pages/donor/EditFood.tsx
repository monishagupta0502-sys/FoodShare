import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../../api/client';
import { FoodListing } from '../../types';
import { FoodForm } from '../../components/FoodForm';
import { Loader } from '../../components/Loader';
import { useToast } from '../../context/ToastContext';

export const EditFood: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [listing, setListing] = useState<FoodListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      try {
        const res = await api.get<FoodListing>(`/food/${id}`);
        if (res.success && res.data) {
          if (res.data.status !== 'available') {
            error('Only available listings can be modified.');
            navigate('/donor/listings');
            return;
          }
          setListing(res.data);
        }
      } catch (err: any) {
        error(err.message || 'Could not load listing details.');
        navigate('/donor/listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, navigate, error]);

  const handleUpdate = async (formData: any) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      const res = await api.put(`/food/${id}`, formData);
      if (res.success) {
        success('Food listing updated successfully.');
        navigate('/donor/listings');
      }
    } catch (err: any) {
      error(err.message || 'Failed to update listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Loader text="Loading food listing details..." />;
  }

  if (!listing) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/donor/listings"
          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Edit Food Listing</h1>
          <p className="text-xs text-neutral-500">Update listing details, quantity, or expiration window</p>
        </div>
      </div>

      <FoodForm
        initialData={listing}
        onSubmit={handleUpdate}
        submitLabel="Save Changes"
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
