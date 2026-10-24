import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useNotifications } from '../context/NotificationContext.js';
import { api } from '../services/api.js';
import { ServiceRequest, Appointment } from '../types/index.js';
import { StatCard } from '../components/StatCard.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { PriorityBadge } from '../components/PriorityBadge.js';
import {
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FilePlus,
  ArrowRight,
  Bell,
  Sparkles,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { notifications } = useNotifications();

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqData, aptData] = await Promise.all([
        api.getRequests(),
        api.getAppointments({ timeframe: 'upcoming' }),
      ]);
      setRequests(reqData);
      setAppointments(aptData);
    } finally {
      setLoading(false);
    }
  };

  const openRequests = requests.filter(r => r.status !== 'RESOLVED' && r.status !== 'CLOSED');
  const resolvedRequests = requests.filter(r => r.status === 'RESOLVED' || r.status === 'CLOSED');

  return (
    <div className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold text-blue-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Welcome back, {user?.fullName}!</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Student Support Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Track your ongoing service tickets, prepare for upcoming advisor consultations, and browse university services.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/requests/new"
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-blue-700 hover:bg-blue-50 shadow-md shadow-black/10 transition-colors flex items-center gap-1.5"
          >
            <FilePlus className="w-4 h-4" />
            <span>New Request</span>
          </Link>
          <Link
            to="/appointments/book"
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-black/10 transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Slot</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Open Tickets"
          value={openRequests.length}
          subtitle="Awaiting response or in review"
          icon={Clock}
          colorScheme="blue"
        />
        <StatCard
          title="Upcoming Appointments"
          value={appointments.length}
          subtitle="Scheduled with staff"
          icon={Calendar}
          colorScheme="teal"
        />
        <StatCard
          title="Resolved Tickets"
          value={resolvedRequests.length}
          subtitle="Closed successfully"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <StatCard
          title="Total Requests"
          value={requests.length}
          subtitle="Lifetime ticket submissions"
          icon={FileText}
          colorScheme="purple"
        />
      </div>

      {/* Main Content Grid: Requests & Consultations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Requests List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Active Service Requests</span>
            </h2>
            <Link
              to="/requests"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View all ({requests.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {openRequests.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">All caught up!</p>
              <p className="text-xs text-slate-500 mt-0.5">You currently have no open requests.</p>
              <Link
                to="/requests/new"
                className="mt-3 inline-block px-3.5 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
              >
                Submit a new request
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {openRequests.slice(0, 4).map(req => (
                <Link
                  key={req.id}
                  to={`/requests/${req.id}`}
                  className="block bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {req.requestNumber}
                        </span>
                        <span className="text-xs font-semibold text-blue-600">
                          {req.serviceName}
                        </span>
                        <PriorityBadge priority={req.priority} />
                        <StatusBadge status={req.status} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {req.subject}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{req.description}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Upcoming Appointments & Notifications */}
        <div className="space-y-6">
          {/* Upcoming Consultations */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>Upcoming Appointments</span>
              </h2>
              <Link to="/appointments" className="text-xs font-bold text-teal-600 hover:underline">
                View all
              </Link>
            </div>

            {appointments.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <p className="text-xs">No upcoming appointments.</p>
                <Link
                  to="/appointments/book"
                  className="mt-2 inline-block text-xs font-bold text-teal-600 hover:underline"
                >
                  Schedule a slot &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {appointments.slice(0, 3).map(apt => (
                  <div key={apt.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <p className="font-bold text-slate-900">{apt.serviceName}</p>
                    <p className="text-slate-500 font-medium">with {apt.staffName}</p>
                    <p className="text-[11px] text-teal-700 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(apt.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}{' '}
                        • {new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent In-App Notifications */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <span>Recent Activity Feed</span>
            </h2>

            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No recent activity.</p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 3).map(notif => (
                  <div key={notif.id} className="text-xs space-y-0.5 border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                    <p className="font-bold text-slate-800">{notif.title}</p>
                    <p className="text-slate-500 text-[11px] line-clamp-2">{notif.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
