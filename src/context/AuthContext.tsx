import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api } from '../api/client';
import { useToast } from './ToastContext';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: any) => Promise<User>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('foodshare_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await api.get<User>('/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        localStorage.removeItem('foodshare_token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.warn('Authentication token expired or invalid:', err);
      localStorage.removeItem('foodshare_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token, fetchCurrentUser]);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const res = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
      if (res.success && res.data) {
        const { token: newToken, user: newUser } = res.data;
        localStorage.setItem('foodshare_token', newToken);
        setToken(newToken);
        setUser(newUser);
        success(`Welcome back, ${newUser.name}!`);
        return newUser;
      }
      throw new Error(res.message || 'Login failed');
    } catch (err: any) {
      error(err.message || 'Login failed. Please check your credentials.');
      throw err;
    }
  };

  const register = async (payload: any): Promise<User> => {
    try {
      const res = await api.post<{ token: string; user: User }>('/auth/register', payload);
      if (res.success && res.data) {
        const { token: newToken, user: newUser } = res.data;
        localStorage.setItem('foodshare_token', newToken);
        setToken(newToken);
        setUser(newUser);
        success(`Account created successfully! Welcome to FoodShare.`);
        return newUser;
      }
      throw new Error(res.message || 'Registration failed');
    } catch (err: any) {
      error(err.message || 'Registration failed.');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('foodshare_token');
    setToken(null);
    setUser(null);
    success('Logged out successfully.');
  };

  const updateUser = (updatedData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
