import React from 'react';
import { RequestPriority } from '../types/index.js';
import { ArrowDown, Minus, ArrowUp, AlertOctagon } from 'lucide-react';

interface PriorityBadgeProps {
  priority: RequestPriority | string;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  switch (priority) {
    case 'LOW':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300 ${className}`}>
          <ArrowDown className="w-3 h-3 text-slate-500" aria-hidden="true" />
          <span>Low</span>
        </span>
      );
    case 'MEDIUM':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 ${className}`}>
          <Minus className="w-3 h-3 text-blue-500" aria-hidden="true" />
          <span>Medium</span>
        </span>
      );
    case 'HIGH':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-800 border border-orange-200 ${className}`}>
          <ArrowUp className="w-3 h-3 text-orange-600" aria-hidden="true" />
          <span>High</span>
        </span>
      );
    case 'URGENT':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 animate-pulse ${className}`}>
          <AlertOctagon className="w-3 h-3 text-red-600" aria-hidden="true" />
          <span>Urgent</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
          <span>{priority}</span>
        </span>
      );
  }
};
