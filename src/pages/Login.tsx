import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HeartHandshake, LogIn, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectAfterLogin = (role: string) => {
    const from = (location.state as any)?.from?.pathname;
    if (from && from !== '/login' && from !== '/register') {
      navigate(from, { replace: true });
      return;
    }
    if (role === 'donor') navigate('/donor/dashboard', { replace: true });
    else if (role === 'ngo') navigate('/ngo/browse', { replace: true });
    else if (role === 'admin') navigate('/admin/dashboard', { replace: true });
    else navigate('/', { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const loggedUser = await login(email, password);
      redirectAfterLogin(loggedUser.role);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillCredentials = (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setErrorMsg('');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-600 text-white mb-3 shadow-xs">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Sign in to FoodShare</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Enter your registered email and password to access your role portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs font-medium text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Email Address or Username
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. donor@foodshare.org or ngo@foodshare.org"
                className="w-full px-3.5 py-2.5 text-xs bg-neutral-50/70 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-xs bg-neutral-50/70 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Click to fill credentials section */}
          <div className="pt-4 border-t border-neutral-100 space-y-2">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
              Click to Auto-Fill Test Account:
            </span>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => fillCredentials('donor@foodshare.org', 'donor123')}
                className="p-2 border border-neutral-200 rounded-lg text-center hover:bg-neutral-50 transition-colors cursor-pointer text-neutral-800"
              >
                <div className="font-bold text-emerald-800">Donor</div>
                <div className="text-[10px] text-neutral-500 font-mono">donor@foodshare.org</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('ngo@foodshare.org', 'ngo123')}
                className="p-2 border border-neutral-200 rounded-lg text-center hover:bg-neutral-50 transition-colors cursor-pointer text-neutral-800"
              >
                <div className="font-bold text-sky-800">NGO</div>
                <div className="text-[10px] text-neutral-500 font-mono">ngo@foodshare.org</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('admin@foodshare.org', 'admin123')}
                className="p-2 border border-neutral-200 rounded-lg text-center hover:bg-neutral-50 transition-colors cursor-pointer text-neutral-800"
              >
                <div className="font-bold text-purple-800">Admin</div>
                <div className="text-[10px] text-neutral-500 font-mono">admin@foodshare.org</div>
              </button>
            </div>
            <p className="text-[10px] text-neutral-400 text-center">
              Password for all test accounts is either <span className="font-mono font-semibold">donor123</span>, <span className="font-mono font-semibold">ngo123</span>, or <span className="font-mono font-semibold">admin123</span>.
            </p>
          </div>

          <div className="text-center text-xs text-neutral-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-emerald-700 hover:text-emerald-800">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
