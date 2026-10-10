import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { User, UserRole } from '../../types';
import { Loader } from '../../components/Loader';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import { Users, Trash2, Power, Building, Phone, Mail, ShieldAlert } from 'lucide-react';

export const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deleteCandidate, setDeleteCandidate] = useState<User | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { success, error } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const url = roleFilter === 'all' ? '/admin/users' : `/admin/users?role=${roleFilter}`;
      const res = await api.get<User[]>(url);
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleStatus = async (user: User) => {
    setTogglingId(user._id);
    try {
      const res = await api.put(`/admin/users/${user._id}/toggle`);
      if (res.success && res.data) {
        success(`User account ${res.data.isActive ? 'activated' : 'deactivated'}.`);
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, isActive: res.data.isActive } : u))
        );
      }
    } catch (err: any) {
      error(err.message || 'Failed to toggle user status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    try {
      const res = await api.delete(`/admin/users/${deleteCandidate._id}`);
      if (res.success) {
        success('User account removed.');
        setUsers((prev) => prev.filter((u) => u._id !== deleteCandidate._id));
      }
    } catch (err: any) {
      error(err.message || 'Failed to delete user.');
    } finally {
      setDeleteCandidate(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">User Management</h1>
          <p className="text-xs text-neutral-500">
            Control platform access, review NGO credentials, and manage donor permissions
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-lg">
          {['all', 'donor', 'ngo', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                roleFilter === r
                  ? 'bg-white text-neutral-900 shadow-xs font-bold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader text="Loading user directory..." />
      ) : (
        <div className="bg-white border border-neutral-200/80 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/75 border-b border-neutral-100 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">User / Organization</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Contact Details</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Registered On</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-neutral-900">{u.name}</div>
                      {u.role === 'ngo' && u.organizationName && (
                        <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-neutral-400" />
                          <span>{u.organizationName}</span>
                          {u.registrationNumber && (
                            <span className="font-mono text-neutral-400">({u.registrationNumber})</span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : u.role === 'donor'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-neutral-600 space-y-0.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span>{u.email}</span>
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-neutral-400 shrink-0" />
                          <span>{u.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          u.isActive ? 'text-emerald-700' : 'text-neutral-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.isActive ? 'bg-emerald-500' : 'bg-neutral-300'
                          }`}
                        />
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-neutral-500 tabular-nums whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={togglingId === u._id}
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                              u.isActive
                                ? 'text-neutral-400 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={u.isActive ? 'Deactivate account' : 'Activate account'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {u.role !== 'admin' && (
                          <button
                            onClick={() => setDeleteCandidate(u)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteCandidate)}
        title="Delete User Account?"
        message={`Are you sure you want to delete ${deleteCandidate?.name} (${deleteCandidate?.email})? This action is permanent and will remove all their system credentials.`}
        confirmLabel="Yes, Delete Account"
        isDangerous={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
};
