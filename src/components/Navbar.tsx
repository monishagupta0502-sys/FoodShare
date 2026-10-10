import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HeartHandshake, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <Link
          to={
            user?.role === 'admin'
              ? '/admin/dashboard'
              : user?.role === 'donor'
              ? '/donor/dashboard'
              : user?.role === 'ngo'
              ? '/ngo/browse'
              : '/'
          }
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-neutral-900 whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <span>FoodShare</span>
        </Link>

        {/* Zone 2: Navigation Links (Strictly filtered by role) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
          {/* Guest Links */}
          {!user && (
            <>
              <Link
                to="/"
                className={`transition-colors whitespace-nowrap shrink-0 ${
                  isActive('/') ? 'text-emerald-700 font-semibold' : 'hover:text-neutral-900'
                }`}
              >
                Home
              </Link>
              <Link
                to="/browse"
                className={`transition-colors whitespace-nowrap shrink-0 ${
                  isActive('/browse') ? 'text-emerald-700 font-semibold' : 'hover:text-neutral-900'
                }`}
              >
                Browse Food
              </Link>
            </>
          )}

          {/* Donor Links ONLY */}
          {user?.role === 'donor' && (
            <>
              <Link
                to="/donor/dashboard"
                className={`transition-colors whitespace-nowrap shrink-0 ${
                  isActive('/donor/dashboard') ? 'text-emerald-700 font-semibold' : 'hover:text-neutral-900'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/donor/listings"
                className={`transition-colors whitespace-nowrap shrink-0 ${
                  isActive('/donor/listings') ? 'text-emerald-700 font-semibold' : 'hover:text-neutral-900'
                }`}
              >
                My Listings
              </Link>
              <Link
                to="/donor/add-food"
                className={`transition-colors whitespace-nowrap shrink-0 ${
                  isActive('/donor/add-food') ? 'text-emerald-700 font-semibold' : 'hover:text-neutral-900'
                }`}
              >
                Add Food
              </Link>
              <Link
                to="/donor/requests"
                className={`transition-colors whitespace-nowrap shrink-0 ${
                  isActive('/donor/requests') ? 'text-emerald-700 font-semibold' : 'hover:text-neutral-900'
                }`}
              >
                Requests
              </Link>
            </>
          )}

          {/* NGO Links ONLY */}
          {user?.role === 'ngo' && (
            <>
              <Link
                to="/ngo/browse"
                className={`transition-colors whitespace-nowrap shrink-0 ${
                  isActive('/ngo/browse') ? 'text-emerald-700 font-semibold' : 'hover:text-neutral-900'
                }`}
              >
                Browse Food
              </Link>
              <Link
                to="/ngo/requests"
                className={`transition-colors whitespace-nowrap shrink-0 ${
                  isActive('/ngo/requests') ? 'text-emerald-700 font-semibold' : 'hover:text-neutral-900'
                }`}
              >
                My Requests
              </Link>
            </>
          )}

          {/* Admin Links ONLY */}
          {user?.role === 'admin' && (
            <>
              <Link
                to="/admin/dashboard"
                className={`transition-colors whitespace-nowrap shrink-0 ${
                  isActive('/admin/dashboard') ? 'text-emerald-700 font-semibold' : 'hover:text-neutral-900'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/admin/users"
                className={`transition-colors whitespace-nowrap shrink-0 ${
                  isActive('/admin/users') ? 'text-emerald-700 font-semibold' : 'hover:text-neutral-900'
                }`}
              >
                Users
              </Link>
              <Link
                to="/admin/listings"
                className={`transition-colors whitespace-nowrap shrink-0 ${
                  isActive('/admin/listings') ? 'text-emerald-700 font-semibold' : 'hover:text-neutral-900'
                }`}
              >
                Listings
              </Link>
            </>
          )}
        </nav>

        {/* Zone 3: Profile & Auth Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-700"
                title="Profile Settings"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold border border-emerald-200">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-neutral-900 leading-tight truncate max-w-[130px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-emerald-700 uppercase tracking-wider font-mono font-semibold">
                    {user.role}
                  </span>
                </div>
              </Link>

              <button
                onClick={logout}
                title="Sign out"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs whitespace-nowrap shrink-0"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
