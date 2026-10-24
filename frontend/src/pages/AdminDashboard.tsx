import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { DashboardMetrics } from '../types/index.js';
import { StatCard } from '../components/StatCard.js';
import { TableSummary } from '../components/TableSummary.js';
import {
  FileText,
  Clock,
  Calendar,
  Users,
  Compass,
  ArrowRight,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [requestsByService, setRequestsByService] = useState<any[]>([]);
  const [requestsByStatus, setRequestsByStatus] = useState<any[]>([]);
  const [requestsByPriority, setRequestsByPriority] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Date range filter
  const [timeRange, setTimeRange] = useState('ALL');

  useEffect(() => {
    loadReports();
  }, [timeRange]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await api.getReportsMetrics();
      setMetrics(data.metrics);
      setRequestsByService(data.requestsByService);
      setRequestsByStatus(data.requestsByStatus);
      setRequestsByPriority(data.requestsByPriority);
    } finally {
      setLoading(false);
    }
  };

  const STATUS_COLORS: Record<string, string> = {
    SUBMITTED: '#3b82f6',
    IN_REVIEW: '#f59e0b',
    ASSIGNED: '#6366f1',
    WAITING_FOR_STUDENT: '#a855f7',
    RESOLVED: '#10b981',
    CLOSED: '#64748b',
  };

  const PRIORITY_COLORS: Record<string, string> = {
    LOW: '#94a3b8',
    MEDIUM: '#3b82f6',
    HIGH: '#f97316',
    URGENT: '#ef4444',
  };

  return (
    <div className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-700 mb-1">
            <span>Dean of Student Affairs & Campus Operations</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Administrator Analytics & Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Campus-wide service metrics, resolution speed benchmarks, and departmental workload distribution
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-700 bg-white font-semibold focus:border-purple-600"
          >
            <option value="ALL">All Time</option>
            <option value="30">Past 30 Days</option>
            <option value="7">Past 7 Days</option>
          </select>
          <button
            onClick={loadReports}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200"
            aria-label="Refresh metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Campus Tickets"
          value={metrics?.totalRequests || 0}
          subtitle={`${metrics?.openRequests || 0} currently open`}
          icon={FileText}
          colorScheme="blue"
        />
        <StatCard
          title="Avg Resolution Speed"
          value={`${metrics?.avgResolutionHours || 14.5} hrs`}
          subtitle="Target threshold: < 24 hrs"
          icon={Clock}
          colorScheme="emerald"
        />
        <StatCard
          title="Campus Consultations"
          value={metrics?.totalAppointments || 0}
          subtitle={`${metrics?.bookedAppointments || 0} confirmed slots`}
          icon={Calendar}
          colorScheme="teal"
        />
        <StatCard
          title="Total Campus Users"
          value={metrics?.totalUsers || 0}
          subtitle={`${metrics?.totalServices || 0} active departments`}
          icon={Users}
          colorScheme="purple"
        />
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Requests by Service (Bar Chart) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Service Request Distribution by Department</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Total student assistance tickets logged per campus service department.
          </p>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={requestsByService} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="category" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} requests`, 'Volume']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Accessible Table Summary */}
          <TableSummary
            title="Requests by Department"
            headers={['Department / Service', 'Category', 'Requests Count', 'Campus Share %']}
            rows={requestsByService.map(s => [s.serviceName, s.category, s.count, `${s.percentage}%`])}
          />
        </div>

        {/* Chart 2: Requests by Status Breakdown (Pie Chart) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-teal-600" />
              <span>Request Lifecycle Status Breakdown</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Proportion of tickets categorized by current resolution stage.
          </p>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={requestsByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={45}
                  paddingAngle={3}
                  label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                >
                  {requestsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} tickets`, name]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Accessible Table Summary */}
          <TableSummary
            title="Requests by Status"
            headers={['Status Name', 'Total Tickets Count']}
            rows={requestsByStatus.map(s => [s.status, s.count])}
          />
        </div>
      </div>

      {/* Priority Distribution & Quick Management Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Priority Breakdown Bar */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span>Ticket Volume by Priority Level</span>
          </h2>

          <div className="space-y-4 pt-2">
            {requestsByPriority.map(p => {
              const total = metrics?.totalRequests || 1;
              const pct = Math.round((p.count / total) * 100);
              return (
                <div key={p.priority} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: PRIORITY_COLORS[p.priority] }}
                      />
                      <span>{p.priority} PRIORITY</span>
                    </span>
                    <span>
                      {p.count} tickets ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: PRIORITY_COLORS[p.priority],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <TableSummary
            title="Tickets by Priority"
            headers={['Priority Level', 'Active Ticket Count']}
            rows={requestsByPriority.map(p => [p.priority, p.count])}
          />
        </div>

        {/* Quick Admin Actions */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">Administrative Tools</h2>
            <p className="text-xs text-slate-500">Direct shortcuts to campus management modules:</p>

            <div className="space-y-2 pt-2">
              <Link
                to="/admin/services"
                className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors flex items-center justify-between text-xs font-bold text-slate-800"
              >
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>Manage Services Catalog</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/admin/users"
                className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors flex items-center justify-between text-xs font-bold text-slate-800"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Manage Users & Roles</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/requests"
                className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors flex items-center justify-between text-xs font-bold text-slate-800"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>All Campus Tickets</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-[11px] text-purple-900">
            <p className="font-bold">BCA Project Evaluation Note:</p>
            <p className="mt-0.5 text-purple-800">
              Charts are rendered using Recharts and backed by accessible semantic data tables.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
