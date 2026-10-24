import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';

export const AccessDenied: React.FC = () => {
  const { user } = useAuth();

  const dashboardPath =
    user?.role === 'ADMIN'
      ? '/admin/dashboard'
      : user?.role === 'STAFF'
      ? '/staff/dashboard'
      : '/dashboard';

  return (
    <div className="flex-1 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-rose-200 shadow-xl shadow-slate-900/5 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-2">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-rose-600 tracking-tight">403</h1>
        <h2 className="text-lg font-bold text-slate-800">Access Restricted</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          You do not have the required role permissions to view or perform operations on this page.
        </p>

        <div className="pt-2 flex flex-col gap-2">
          <Link
            to={dashboardPath}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Go to My Authorized Dashboard</span>
          </Link>
          <Link
            to="/"
            className="text-xs font-bold text-slate-500 hover:text-slate-800 py-1"
          >
            Back to Public Home
          </Link>
        </div>
      </div>
    </div>
  );
};
