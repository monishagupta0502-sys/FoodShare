import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleRoute } from './components/RoleRoute';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Unauthorized } from './pages/Unauthorized';
import { NotFound } from './pages/NotFound';
import { Profile } from './pages/Profile';

// Donor Pages
import { DonorDashboard } from './pages/donor/DonorDashboard';
import { AddFood } from './pages/donor/AddFood';
import { EditFood } from './pages/donor/EditFood';
import { MyListings } from './pages/donor/MyListings';
import { IncomingRequests } from './pages/donor/IncomingRequests';

// NGO Pages
import { BrowseFood } from './pages/ngo/BrowseFood';
import { FoodDetails } from './pages/ngo/FoodDetails';
import { MyRequests } from './pages/ngo/MyRequests';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageUsers } from './pages/admin/ManageUsers';
import { ManageListings } from './pages/admin/ManageListings';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 selection:bg-emerald-100 selection:text-emerald-900">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/browse" element={<BrowseFood />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Common Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/food/:id" element={<FoodDetails />} />

                  {/* Donor-only Routes */}
                  <Route element={<RoleRoute allowedRoles={['donor']} />}>
                    <Route path="/donor/dashboard" element={<DonorDashboard />} />
                    <Route path="/donor/listings" element={<MyListings />} />
                    <Route path="/donor/add-food" element={<AddFood />} />
                    <Route path="/donor/edit-food/:id" element={<EditFood />} />
                    <Route path="/donor/requests" element={<IncomingRequests />} />
                  </Route>

                  {/* NGO-only Routes */}
                  <Route element={<RoleRoute allowedRoles={['ngo']} />}>
                    <Route path="/ngo/browse" element={<BrowseFood />} />
                    <Route path="/ngo/requests" element={<MyRequests />} />
                  </Route>

                  {/* Admin-only Routes */}
                  <Route element={<RoleRoute allowedRoles={['admin']} />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/users" element={<ManageUsers />} />
                    <Route path="/admin/listings" element={<ManageListings />} />
                  </Route>
                </Route>

                {/* 404 Catch-All */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
