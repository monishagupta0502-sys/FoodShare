import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Clock, CheckCircle2, PackageCheck, Plus, ArrowRight, BellRing } from 'lucide-react';
import { api } from '../../api/client';
import { FoodListing } from '../../types';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { Loader } from '../../components/Loader';
import { EmptyState } from '../../components/EmptyState';

export const DonorDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [myListings, setMyListings] = useState<FoodListing[]>([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, listingsRes, requestsRes] = await Promise.all([
          api.get('/food/stats/donor'),
          api.get('/food/my'),
          api.get('/requests/incoming'),
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (listingsRes.success) setMyListings(listingsRes.data);
        if (requestsRes.success && Array.isArray(requestsRes.data)) {
          const pending = requestsRes.data.filter((r: any) => r.status === 'pending').length;
          setPendingRequestsCount(pending);
        }
      } catch (err) {
        console.error('Error fetching donor dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loader text="Loading donor dashboard..." />;
  }

  const recentListings = myListings.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with Title and Add Food Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Donor Dashboard</h1>
          <p className="text-xs text-neutral-500">
            Monitor real-time donations, manage meal batches, and respond to incoming NGO requests
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/donor/requests"
            className="relative inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors"
          >
            <BellRing className="w-3.5 h-3.5 text-neutral-500" />
            <span>Requests</span>
            {pendingRequestsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-mono flex items-center justify-center font-bold">
                {pendingRequestsCount}
              </span>
            )}
          </Link>

          <Link
            to="/donor/add-food"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Food Listing</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Listings"
          value={stats?.total || 0}
          subtitle="Cumulative donations posted"
          icon={Utensils}
          color="neutral"
        />
        <StatCard
          title="Available Now"
          value={stats?.available || 0}
          subtitle="Ready for pickup requests"
          icon={Clock}
          color="emerald"
        />
        <StatCard
          title="Claimed / En Route"
          value={stats?.claimed || 0}
          subtitle="Awaiting NGO collection"
          icon={PackageCheck}
          color="sky"
        />
        <StatCard
          title="Completed"
          value={stats?.completed || 0}
          subtitle="Successfully handed over"
          icon={CheckCircle2}
          color="indigo"
        />
      </div>

      {/* Recent Listings Table */}
      <div className="bg-white border border-neutral-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Recent Food Listings</h3>
            <p className="text-[11px] text-neutral-500">Your latest donations and status</p>
          </div>
          <Link
            to="/donor/listings"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All ({myListings.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentListings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/75 border-b border-neutral-100 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3">Food Item</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Quantity</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Expiry Date</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentListings.map((item) => (
                  <tr key={item._id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-neutral-900 max-w-xs truncate">
                      {item.title}
                    </td>
                    <td className="px-6 py-3.5 text-neutral-600 capitalize">{item.foodType}</td>
                    <td className="px-6 py-3.5 font-mono tabular-nums text-neutral-800">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="px-6 py-3.5 font-mono tabular-nums text-neutral-500">
                      {new Date(item.expiryDate).toLocaleDateString()}{' '}
                      {new Date(item.expiryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Link
                        to={`/donor/listings`}
                        className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No food listings yet"
            description="Have surplus meals or bakery goods? Publish your first listing to begin feeding your community."
            actionText="Publish Surplus Food"
            onAction={() => {}}
          />
        )}
      </div>
    </div>
  );
};
