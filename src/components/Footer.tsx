import React from 'react';
import { HeartHandshake } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-neutral-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5 text-base font-bold text-neutral-900">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <span>FoodShare Platform</span>
            </div>
            <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
              Eliminating hunger and food wastage through transparent, fast community food redistribution.
              Connecting verified commercial donors with frontline humanitarian NGOs.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-1.5 text-xs text-neutral-500">
              <li>
                <Link to="/" className="hover:text-emerald-700 transition-colors">Home & Impact</Link>
              </li>
              <li>
                <Link to="/browse" className="hover:text-emerald-700 transition-colors">Browse Food Listings</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-emerald-700 transition-colors">Join as Donor or NGO</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-700 transition-colors">Sign In</Link>
              </li>
            </ul>
          </div>

          {/* Guidelines */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">Food Safety</h4>
            <p className="text-xs text-neutral-500 leading-relaxed">
              All donors adhere to municipal health protocols. Food is inspected upon transfer with mandatory temperature maintenance logs.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <span>&copy; {new Date().getFullYear()} FoodShare MERN Marketplace. All rights reserved.</span>
          <span className="font-mono text-[11px]">Zero-Waste Food Logistics Initiative</span>
        </div>
      </div>
    </footer>
  );
};
