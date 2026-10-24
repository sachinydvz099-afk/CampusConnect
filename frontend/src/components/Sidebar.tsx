import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import {
  LayoutDashboard,
  Compass,
  FilePlus,
  Inbox,
  Calendar,
  Users,
  Settings,
  ShieldAlert,
  ClipboardList,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const studentLinks = [
    { to: '/dashboard', label: 'Student Dashboard', icon: LayoutDashboard },
    { to: '/services', label: 'Campus Services', icon: Compass },
    { to: '/requests/new', label: 'Submit Request', icon: FilePlus },
    { to: '/requests', label: 'My Requests', icon: Inbox },
    { to: '/appointments', label: 'My Appointments', icon: Calendar },
    { to: '/profile', label: 'My Profile', icon: Settings },
  ];

  const staffLinks = [
    { to: '/staff/dashboard', label: 'Staff Dashboard', icon: LayoutDashboard },
    { to: '/staff/requests', label: 'Request Triage Queue', icon: Inbox },
    { to: '/staff/appointments', label: 'Student Consultations', icon: Calendar },
    { to: '/services', label: 'Service Catalog', icon: Compass },
    { to: '/profile', label: 'Staff Profile', icon: Settings },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Administrator Overview', icon: LayoutDashboard },
    { to: '/admin/services', label: 'Services Management', icon: ClipboardList },
    { to: '/admin/users', label: 'User Directory & Roles', icon: Users },
    { to: '/requests', label: 'All Campus Tickets', icon: Inbox },
    { to: '/appointments', label: 'All Campus Bookings', icon: Calendar },
    { to: '/profile', label: 'Admin Settings', icon: Settings },
  ];

  const links =
    user.role === 'ADMIN' ? adminLinks : user.role === 'STAFF' ? staffLinks : studentLinks;

  return (
    <aside className="hidden lg:block w-64 bg-white border-r border-slate-200/80 p-5 shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Role Pill Banner */}
      <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              user.role === 'ADMIN'
                ? 'bg-purple-600'
                : user.role === 'STAFF'
                ? 'bg-teal-600'
                : 'bg-blue-600'
            }`}
          />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {user.role} PORTAL
          </span>
        </div>
        <p className="text-xs font-semibold text-slate-900 mt-1 truncate">{user.fullName}</p>
        <p className="text-[11px] text-slate-500 truncate">{user.department}</p>
      </div>

      {/* Navigation List */}
      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard' || link.to === '/staff/dashboard' || link.to === '/admin/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Help & Support Banner */}
      <div className="mt-8 p-3.5 rounded-xl bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-100 text-xs text-slate-600">
        <p className="font-bold text-slate-800 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-blue-600" />
          Campus Helpline
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Emergency desk: +91 80 2345 6700
        </p>
        <p className="text-[11px] text-slate-500">Hours: 24/7 Control Room</p>
      </div>
    </aside>
  );
};
