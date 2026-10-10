import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../../api/client';
import { FoodForm } from '../../components/FoodForm';
import { useToast } from '../../context/ToastContext';

export const AddFood: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { success, error } = useToast();

  const handleCreateFood = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/food', formData);
      if (res.success) {
        success('Food listing published successfully!');
        navigate('/donor/listings');
      }
    } catch (err: any) {
      error(err.message || 'Failed to publish food listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/donor/dashboard"
          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Add Food Listing</h1>
          <p className="text-xs text-neutral-500">
            List surplus prepared food, bakery goods, or groceries for verified NGO collection
          </p>
        </div>
      </div>

      <FoodForm
        onSubmit={handleCreateFood}
        submitLabel="Publish Food Listing"
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
