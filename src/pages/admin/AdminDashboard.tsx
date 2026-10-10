import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Utensils,
  HeartHandshake,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { api } from '../../api/client';
import { AdminStats } from '../../types';
import { StatCard } from '../../components/StatCard';
import { Loader } from '../../components/Loader';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get<AdminStats>('/admin/stats');
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) {
    return <Loader text="Loading platform administration analytics..." />;
  }

  if (!stats) return null;

  // Chart data formatting
  const listingStatusData = [
    { name: 'Available', count: stats.listings.available, color: '#10B981' },
    { name: 'Requested', count: stats.listings.requested, color: '#F59E0B' },
    { name: 'Claimed', count: stats.listings.claimed, color: '#0EA5E9' },
    { name: 'Completed', count: stats.listings.completed, color: '#6B7280' },
    { name: 'Expired', count: stats.listings.expired, color: '#EF4444' },
  ];

  const userRoleData = [
    { name: 'Donors', count: stats.users.byRole.donor, color: '#10B981' },
    { name: 'NGOs', count: stats.users.byRole.ngo, color: '#3B82F6' },
    { name: 'Admins', count: stats.users.byRole.admin, color: '#6366F1' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Platform Administration</h1>
          <p className="text-xs text-neutral-500">
            Real-time telemetry on marketplace volume, user accounts, and community food rescue impact
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/users"
            className="px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/listings"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
          >
            Manage Listings
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.users.total}
          subtitle={`${stats.users.active} active accounts`}
          icon={Users}
          color="neutral"
        />
        <StatCard
          title="Total Food Listings"
          value={stats.listings.total}
          subtitle={`${stats.listings.available} currently open`}
          icon={Utensils}
          color="emerald"
        />
        <StatCard
          title="Meals Donated"
          value={stats.totalMealsDonated.toLocaleString()}
          subtitle="Successfully rescued & distributed"
          icon={HeartHandshake}
          color="sky"
        />
        <StatCard
          title="Pickup Requests"
          value={stats.totalRequests}
          subtitle={`${stats.listings.completed} fulfilled pickups`}
          icon={TrendingUp}
          color="indigo"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listings by Status Chart */}
        <div className="bg-white border border-neutral-200/80 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Listings by Status</h3>
              <p className="text-[11px] text-neutral-500">Current marketplace inventory distribution</p>
            </div>
            <BarChart3 className="w-4 h-4 text-neutral-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={listingStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {listingStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Users by Role Donut / Pie Chart */}
        <div className="bg-white border border-neutral-200/80 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Community User Distribution</h3>
              <p className="text-[11px] text-neutral-500">Registered donors, NGOs, and platform staff</p>
            </div>
            <PieChartIcon className="w-4 h-4 text-neutral-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-user-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
