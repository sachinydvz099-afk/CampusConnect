import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { ServiceRequest, Appointment, Service } from '../types/index.js';
import { StatCard } from '../components/StatCard.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { PriorityBadge } from '../components/PriorityBadge.js';
import {
  Inbox,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  UserCheck,
  ArrowRight,
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [serviceFilter, setServiceFilter] = useState('ALL');

  useEffect(() => {
    loadData();
  }, [search, statusFilter, priorityFilter, serviceFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqData, aptData, srvData] = await Promise.all([
        api.getRequests({
          search: search || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
          serviceId: serviceFilter !== 'ALL' ? serviceFilter : undefined,
        }),
        api.getAppointments({ timeframe: 'upcoming' }),
        api.getServices(),
      ]);
      setRequests(reqData);
      setAppointments(aptData);
      setServices(srvData);
    } finally {
      setLoading(false);
    }
  };

  const pendingAction = requests.filter(r => r.status === 'SUBMITTED' || r.status === 'IN_REVIEW');
  const assignedToMe = requests.filter(r => r.assignedStaffId === user?.id);
  const resolved = requests.filter(r => r.status === 'RESOLVED');

  return (
    <div className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-blue-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-teal-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold text-teal-100">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Staff Specialist Operations Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Faculty & Staff Triage Hub
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 max-w-xl">
            Logged in as <span className="font-bold underline">{user?.fullName}</span> ({user?.department}). Manage student tickets and consultations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/appointments"
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-teal-900 hover:bg-teal-50 shadow-md shadow-black/10 transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            <span>View Consultations ({appointments.length})</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Awaiting Action"
          value={pendingAction.length}
          subtitle="Submitted or in review"
          icon={AlertCircle}
          colorScheme="amber"
        />
        <StatCard
          title="Assigned to Me"
          value={assignedToMe.length}
          subtitle="Under your supervision"
          icon={UserCheck}
          colorScheme="teal"
        />
        <StatCard
          title="Scheduled Consultations"
          value={appointments.length}
          subtitle="Upcoming 1-on-1 slots"
          icon={Calendar}
          colorScheme="blue"
        />
        <StatCard
          title="Resolved Tickets"
          value={resolved.length}
          subtitle="Successfully closed"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ticket number, student name, or issue keywords..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Filter by Service</label>
            <select
              value={serviceFilter}
              onChange={e => setServiceFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs"
            >
              <option value="ALL">All Campus Services</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="WAITING_FOR_STUDENT">Waiting for Student</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Filter by Priority</label>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs"
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Request Triage Queue Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Inbox className="w-5 h-5 text-teal-600" />
            <span>Service Request Management Queue ({requests.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Inbox className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-bold text-slate-700">Queue is clear</p>
            <p className="text-xs mt-0.5">No requests matching current criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Ticket</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-800">
                      {req.requestNumber}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-800">{req.studentName}</p>
                      <p className="text-[10px] text-slate-400">{req.studentIdNumber}</p>
                    </td>
                    <td className="px-4 py-3.5 text-blue-600 font-semibold">{req.serviceName}</td>
                    <td className="px-4 py-3.5 max-w-xs truncate font-medium text-slate-700">
                      {req.subject}
                    </td>
                    <td className="px-4 py-3.5">
                      <PriorityBadge priority={req.priority} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <Link
                        to={`/requests/${req.id}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors inline-flex items-center gap-1"
                      >
                        <span>Manage</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
