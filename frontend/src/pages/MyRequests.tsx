import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { ServiceRequest } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { PriorityBadge } from '../components/PriorityBadge.js';
import {
  Inbox,
  Search,
  Filter,
  FilePlus,
  ArrowRight,
  Clock,
  UserCheck,
} from 'lucide-react';

export const MyRequests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, [search, statusFilter, priorityFilter]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getRequests({
        search: search || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
      });
      setRequests(data);
    } finally {
      setLoading(false);
    }
  };

  const statuses = [
    { key: 'ALL', label: 'All Requests' },
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'IN_REVIEW', label: 'In Review' },
    { key: 'WAITING_FOR_STUDENT', label: 'Action Needed' },
    { key: 'RESOLVED', label: 'Resolved' },
  ];

  return (
    <div className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {user?.role === 'STUDENT' ? 'My Service Requests' : 'Campus Service Requests'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track status history, view assigned staff members, and respond to updates
          </p>
        </div>

        <Link
          to="/requests/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <FilePlus className="w-4 h-4" />
          <span>New Request</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ticket number (e.g. REQ-2026-1042) or keywords..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1 shrink-0 pl-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {statuses.map(st => (
            <button
              key={st.key}
              onClick={() => setStatusFilter(st.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st.key
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200/80 animate-pulse" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Requests Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {search || statusFilter !== 'ALL'
              ? 'Try clearing search filters to see all tickets.'
              : 'You have not submitted any service requests yet.'}
          </p>
          <Link
            to="/requests/new"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
          >
            <FilePlus className="w-4 h-4" />
            <span>Submit Your First Ticket</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <Link
              key={req.id}
              to={`/requests/${req.id}`}
              className="block bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {req.requestNumber}
                    </span>
                    <span className="text-xs font-semibold text-blue-600">
                      {req.serviceName}
                    </span>
                    <PriorityBadge priority={req.priority} />
                    <StatusBadge status={req.status} />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {req.subject}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-1">
                    {req.description}
                  </p>
                </div>

                <div className="sm:text-right shrink-0 space-y-1 text-xs text-slate-400">
                  <div className="flex items-center sm:justify-end gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {new Date(req.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  {req.assignedStaffName && (
                    <div className="flex items-center sm:justify-end gap-1 text-[11px] text-slate-600 font-medium">
                      <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                      <span>{req.assignedStaffName}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
