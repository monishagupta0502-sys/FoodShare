import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, ArrowRight, ShieldCheck, Utensils, Users, Building, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import { FoodListing } from '../types';
import { FoodCard } from '../components/FoodCard';
import { useAuth } from '../context/AuthContext';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const [recentListings, setRecentListings] = useState<FoodListing[]>([]);
  const [stats, setStats] = useState({
    totalMeals: 2450,
    activeNGOs: 14,
    totalDonations: 85,
  });

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await api.get<{ listings: FoodListing[] }>('/food?limit=4&status=available');
        if (res.success && res.data) {
          setRecentListings(res.data.listings);
        }
      } catch (err) {
        console.warn('Could not fetch preview listings', err);
      }
    };
    fetchHomeData();
  }, []);

  const heroImg = '/src/assets/images/foodshare_hero_community_1791608388536.jpg';

  const getDashboardLink = () => {
    if (!user) return '/register';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'donor') return '/donor/dashboard';
    if (user.role === 'ngo') return '/ngo/browse';
    return '/';
  };

  const getDashboardLabel = () => {
    if (!user) return 'Join as Donor or NGO';
    if (user.role === 'admin') return 'Open Admin Dashboard';
    if (user.role === 'donor') return 'Open Donor Dashboard';
    if (user.role === 'ngo') return 'Browse Available Food';
    return 'Go to Dashboard';
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero-Waste Community Logistics</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight leading-[1.15] text-balance">
                Turn surplus commercial food into nourishment for local communities.
              </h1>

              <p className="text-sm sm:text-base text-neutral-600 max-w-xl leading-relaxed">
                FoodShare bridges hotels, restaurants, and caterers directly with verified NGOs.
                List excess prepared meals within seconds, coordinate insulated pickups, and eliminate food waste at scale.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={getDashboardLink()}
                  className="inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                >
                  <span>{getDashboardLabel()}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {!user && (
                  <Link
                    to="/browse"
                    className="px-5 py-3 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors"
                  >
                    Browse Surplus Meals
                  </Link>
                )}
              </div>
            </div>

            {/* Right Column: Hero Visual */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-neutral-200 shadow-md">
                <img
                  src={heroImg}
                  alt="FoodShare community food distribution and rescue"
                  className="w-full h-80 sm:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                  <span className="text-[11px] font-mono tracking-wider text-emerald-300 uppercase">
                    Direct Kitchen Dispatch
                  </span>
                  <p className="text-sm font-semibold text-white/95">
                    Surplus meals packed fresh and collected under temperature-controlled safety standards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Impact Counters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-neutral-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                <Utensils className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono tabular-nums">
                  {stats.totalMeals.toLocaleString()}+
                </span>
                <p className="text-xs text-neutral-500 font-medium">Meals Rescued & Distributed</p>
              </div>
            </div>

            <div className="flex items-center gap-4 md:pl-8 pt-4 md:pt-0">
              <div className="p-3 bg-sky-50 text-sky-700 rounded-xl">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono tabular-nums">
                  {stats.activeNGOs}
                </span>
                <p className="text-xs text-neutral-500 font-medium">Verified NGO Partners</p>
              </div>
            </div>

            <div className="flex items-center gap-4 md:pl-8 pt-4 md:pt-0">
              <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono tabular-nums">
                  100%
                </span>
                <p className="text-xs text-neutral-500 font-medium">Safe Food Transfer Logs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works in 3 Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Simple Workflow</span>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">How FoodShare Works</h2>
          <p className="text-xs text-neutral-500">
            A frictionless, 3-step lifecycle designed for fast pickup before meals lose their freshness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-neutral-200/80 rounded-xl p-6 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-mono font-bold text-sm">
              01
            </div>
            <h3 className="text-base font-semibold text-neutral-900">Donor Lists Surplus Food</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Caterers, banquet halls, or restaurants publish quantity, food category, pickup address, and strict expiration times.
            </p>
          </div>

          <div className="bg-white border border-neutral-200/80 rounded-xl p-6 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-mono font-bold text-sm">
              02
            </div>
            <h3 className="text-base font-semibold text-neutral-900">NGO Requests Pickup</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Nearby registered NGOs filter listings, submit an estimated pickup arrival time, and the donor confirms the match.
            </p>
          </div>

          <div className="bg-white border border-neutral-200/80 rounded-xl p-6 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-mono font-bold text-sm">
              03
            </div>
            <h3 className="text-base font-semibold text-neutral-900">Collection & Verification</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              The NGO collects the trays in insulated crates, and the donor marks the donation as completed for transparent reporting.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Available Meals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Active Food Listings</h2>
            <p className="text-xs text-neutral-500">Available right now for authorized NGO collection</p>
          </div>
          <Link
            to={user?.role === 'ngo' ? '/ngo/browse' : '/browse'}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All Listings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentListings.map((listing) => (
              <FoodCard key={listing._id} listing={listing} showActions={true} />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-white border border-neutral-200 rounded-xl text-neutral-500 text-xs">
            No active surplus meals at this moment. Donors can publish new meals anytime!
          </div>
        )}
      </section>
    </div>
  );
};
