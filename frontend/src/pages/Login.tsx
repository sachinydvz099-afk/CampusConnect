import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { GraduationCap, Lock, Mail, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { UserRole } from '../types/index.js';

export const Login: React.FC = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role: UserRole) => {
    setError(null);
    setLoading(true);
    try {
      await demoLogin(role);
      if (role === 'STUDENT') navigate('/dashboard');
      else if (role === 'STAFF') navigate('/staff/dashboard');
      else if (role === 'ADMIN') navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-200/80">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-4">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign in to CampusConnect
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your student requests, appointments, and support services
          </p>
        </div>

        {/* Presentation Fast-Track Demo Buttons */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-2.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>One-Click Demo Accounts (For Presentation):</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemo('STUDENT')}
              disabled={loading}
              className="py-2 px-2 bg-white hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-bold rounded-xl border border-blue-200 shadow-xs transition-colors flex flex-col items-center gap-0.5"
            >
              <span>Student</span>
              <span className="text-[10px] font-normal opacity-80">Aarav</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemo('STAFF')}
              disabled={loading}
              className="py-2 px-2 bg-white hover:bg-teal-600 hover:text-white text-teal-700 text-xs font-bold rounded-xl border border-teal-200 shadow-xs transition-colors flex flex-col items-center gap-0.5"
            >
              <span>Staff</span>
              <span className="text-[10px] font-normal opacity-80">Prof. Rajesh</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemo('ADMIN')}
              disabled={loading}
              className="py-2 px-2 bg-white hover:bg-purple-600 hover:text-white text-purple-700 text-xs font-bold rounded-xl border border-purple-200 shadow-xs transition-colors flex flex-col items-center gap-0.5"
            >
              <span>Admin</span>
              <span className="text-[10px] font-normal opacity-80">Dean Admin</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Regular Login Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="login-email">
              College Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="student@campusconnect.edu"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="login-password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 disabled:opacity-70"
          >
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-600">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-800">
              Register as Student
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
