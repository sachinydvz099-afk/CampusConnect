import React from 'react';
import { RequestStatus, AppointmentStatus } from '../types/index.js';
import { CheckCircle2, Clock, AlertCircle, UserCheck, XCircle, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: RequestStatus | AppointmentStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'SUBMITTED':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 ${className}`}>
          <Clock className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
          <span>Submitted</span>
        </span>
      );
    case 'IN_REVIEW':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 ${className}`}>
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
          <span>In Review</span>
        </span>
      );
    case 'ASSIGNED':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 ${className}`}>
          <UserCheck className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
          <span>Assigned</span>
        </span>
      );
    case 'WAITING_FOR_STUDENT':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 ${className}`}>
          <HelpCircle className="w-3.5 h-3.5 text-purple-600" aria-hidden="true" />
          <span>Action Required</span>
        </span>
      );
    case 'RESOLVED':
    case 'COMPLETED':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
          <span>{status === 'RESOLVED' ? 'Resolved' : 'Completed'}</span>
        </span>
      );
    case 'CLOSED':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span>Closed</span>
        </span>
      );
    case 'BOOKED':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 ${className}`}>
          <Clock className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
          <span>Confirmed</span>
        </span>
      );
    case 'CANCELLED':
    case 'NO_SHOW':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 ${className}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />
          <span>{status === 'NO_SHOW' ? 'No Show' : 'Cancelled'}</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200 ${className}`}>
          <span>{status}</span>
        </span>
      );
  }
};
