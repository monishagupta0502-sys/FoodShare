import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartHandshake, UserPlus, AlertCircle, Building, Utensils } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const Register: React.FC = () => {
  const [role, setRole] = useState<'donor' | 'ngo'>('donor');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = 'Full name is required';
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (role === 'ngo') {
      if (!organizationName.trim()) errs.organizationName = 'Organization legal name is required';
      if (!registrationNumber.trim()) errs.registrationNumber = 'NGO registration number is required';
      if (!address.trim()) errs.address = 'Official NGO address is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        phone: phone.trim(),
        address: address.trim(),
      };

      if (role === 'ngo') {
        payload.organizationName = organizationName.trim();
        payload.registrationNumber = registrationNumber.trim();
      }

      const newUser = await register(payload);
      if (newUser.role === 'donor') navigate('/donor/dashboard');
      else navigate('/ngo/browse');
    } catch (err: any) {
      setGeneralError(err.message || 'Registration failed. Please check form details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-600 text-white mb-3 shadow-xs">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Create your FoodShare account</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Join our verified network to list excess food or claim it for relief shelters
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          {generalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs font-medium text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Role Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('donor')}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                  role === 'donor'
                    ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 shadow-xs'
                    : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    role === 'donor' ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  <Utensils className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold leading-tight">Food Donor</div>
                  <div className="text-[11px] text-neutral-500">Hotel, Caterer, Restaurant</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('ngo')}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                  role === 'ngo'
                    ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 shadow-xs'
                    : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    role === 'ngo' ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  <Building className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold leading-tight">NGO / Non-Profit</div>
                  <div className="text-[11px] text-neutral-500">Shelter, Food Bank, Trust</div>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Full Name / Contact Person <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikram Menon"
                  className="w-full px-3.5 py-2 text-xs bg-neutral-50/70 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
                {errors.name && <p className="mt-1 text-[11px] text-rose-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.org"
                  className="w-full px-3.5 py-2 text-xs bg-neutral-50/70 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
                {errors.email && <p className="mt-1 text-[11px] text-rose-600">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Password (min 6 characters) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-xs bg-neutral-50/70 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
                {errors.password && <p className="mt-1 text-[11px] text-rose-600">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-xs bg-neutral-50/70 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-[11px] text-rose-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98450 77123"
                  className="w-full px-3.5 py-2 text-xs bg-neutral-50/70 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Address / Headquarters</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 75 Koramangala 4th Block, Bangalore"
                  className="w-full px-3.5 py-2 text-xs bg-neutral-50/70 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
                {errors.address && <p className="mt-1 text-[11px] text-rose-600">{errors.address}</p>}
              </div>
            </div>

            {/* Extra NGO Fields (Rendered only when role === 'ngo') */}
            {role === 'ngo' && (
              <div className="pt-4 border-t border-neutral-100 space-y-4">
                <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  NGO Registration Details
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Organization Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="e.g. Robin Food Rescue Network"
                      className="w-full px-3.5 py-2 text-xs bg-neutral-50/70 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                    {errors.organizationName && (
                      <p className="mt-1 text-[11px] text-rose-600">{errors.organizationName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Registration / Trust Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="e.g. NGO-KA-2021-4412"
                      className="w-full px-3.5 py-2 text-xs bg-neutral-50/70 border border-neutral-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                    {errors.registrationNumber && (
                      <p className="mt-1 text-[11px] text-rose-600">{errors.registrationNumber}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering...' : `Register as ${role === 'donor' ? 'Donor' : 'NGO'}`}</span>
            </button>
          </form>

          <div className="text-center text-xs text-neutral-500 pt-2 border-t border-neutral-100">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
