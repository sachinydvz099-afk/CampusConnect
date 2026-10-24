import React from 'react';
import { StatusHistoryItem } from '../types/index.js';
import { StatusBadge } from './StatusBadge.js';
import { Clock } from 'lucide-react';

interface TimelineProps {
  history: StatusHistoryItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return <p className="text-sm text-slate-500 italic">No status history available yet.</p>;
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((event, eventIdx) => (
          <li key={event.id || eventIdx}>
            <div className="relative pb-8">
              {eventIdx !== history.length - 1 ? (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white">
                    <Clock className="h-4 w-4 text-blue-600" aria-hidden="true" />
                  </div>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={event.newStatus} />
                      <span className="text-xs text-slate-500">
                        by {event.changedByName || 'Staff Member'} ({event.changedByRole || 'STAFF'})
                      </span>
                    </div>
                    {event.note && (
                      <p className="mt-1 text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        {event.note}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs whitespace-nowrap text-slate-500">
                    <time dateTime={event.createdAt}>
                      {new Date(event.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
