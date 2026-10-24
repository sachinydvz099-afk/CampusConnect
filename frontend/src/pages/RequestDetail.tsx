import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { ServiceRequest, RequestStatus } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { PriorityBadge } from '../components/PriorityBadge.js';
import { Timeline } from '../components/Timeline.js';
import {
  ArrowLeft,
  Clock,
  User,
  Paperclip,
  Send,
  Lock,
  MessageSquare,
  History,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export const RequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Comment state
  const [message, setMessage] = useState('');
  const [isPrivateNote, setIsPrivateNote] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Status Change state (Staff / Admin)
  const [newStatus, setNewStatus] = useState<RequestStatus | ''>('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (id) loadRequest(id);
  }, [id]);

  const loadRequest = async (requestId: string) => {
    setLoading(true);
    try {
      const data = await api.getRequestById(requestId);
      setRequest(data);
      setNewStatus(data.status);
    } catch (err: any) {
      setError(err.message || 'Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !id) return;

    setSubmittingComment(true);
    try {
      await api.addRequestComment(id, message, isPrivateNote);
      setMessage('');
      setIsPrivateNote(false);
      await loadRequest(id);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatus || !id) return;

    setUpdatingStatus(true);
    try {
      await api.updateRequestStatus(id, newStatus, statusNote);
      setStatusNote('');
      await loadRequest(id);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 max-w-5xl mx-auto w-full animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 rounded w-1/4" />
        <div className="h-40 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="flex-1 p-8 max-w-xl mx-auto text-center space-y-4">
        <p className="text-sm font-bold text-red-600">{error || 'Request not found.'}</p>
        <Link to="/requests" className="inline-block px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl">
          Back to Requests
        </Link>
      </div>
    );
  }

  const isStaffOrAdmin = user?.role === 'STAFF' || user?.role === 'ADMIN';

  return (
    <div className="flex-1 p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Main Ticket Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-lg bg-slate-100 text-slate-800">
                {request.requestNumber}
              </span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                {request.serviceName || 'Campus Service'}
              </span>
              <PriorityBadge priority={request.priority} />
              <StatusBadge status={request.status} />
            </div>

            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {request.subject}
            </h1>
          </div>

          <div className="text-xs text-slate-500 space-y-1 sm:text-right shrink-0">
            <p>
              Submitted on:{' '}
              <span className="font-bold text-slate-800">
                {new Date(request.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </p>
            {request.resolvedAt && (
              <p className="text-emerald-600 font-semibold flex items-center sm:justify-end gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  Resolved on:{' '}
                  {new Date(request.resolvedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Description Body */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Student Problem Description
          </h3>
          <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
            {request.description}
          </p>

          {request.attachmentUrl && (
            <div className="mt-4 pt-3 border-t border-slate-200">
              <a
                href={request.attachmentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>View Attachment / Evidence Link</span>
              </a>
            </div>
          )}
        </div>

        {/* Student & Assigned Staff Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 border-t border-slate-100 pt-4">
          <div className="p-3 rounded-xl bg-white border border-slate-200/60">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Submitted By</span>
            <p className="font-bold text-slate-800 mt-0.5">{request.studentName || 'Student'}</p>
            <p className="text-[11px] text-slate-500">ID: {request.studentIdNumber || 'BCA-2024-042'}</p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200/60">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Staff Specialist</span>
            <p className="font-bold text-slate-800 mt-0.5">
              {request.assignedStaffName || 'Triage Queue (Pending Assignment)'}
            </p>
            {request.serviceId && (
              <Link
                to={`/appointments/book?serviceId=${request.serviceId}`}
                className="text-[11px] text-teal-600 font-semibold hover:underline inline-flex items-center gap-1 mt-0.5"
              >
                <Calendar className="w-3 h-3" />
                <span>Book 1-on-1 Consultation Slot</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Staff Action Panel: Change Status */}
      {isStaffOrAdmin && (
        <div className="bg-teal-50/60 rounded-3xl p-6 border border-teal-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-teal-950 uppercase tracking-wider flex items-center gap-2">
            <span>Staff Action: Update Ticket Status</span>
          </h2>

          <form onSubmit={handleUpdateStatus} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="status-select">
                Target Status
              </label>
              <select
                id="status-select"
                value={newStatus}
                onChange={e => setNewStatus(e.target.value as RequestStatus)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 focus:border-blue-600"
              >
                <option value="SUBMITTED">Submitted</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="WAITING_FOR_STUDENT">Waiting for Student</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="status-note">
                Status Change Note
              </label>
              <input
                id="status-note"
                type="text"
                value={statusNote}
                onChange={e => setStatusNote(e.target.value)}
                placeholder="e.g. Technician dispatched / Resolved"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-blue-600"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={updatingStatus}
                className="w-full py-2 px-4 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 transition-colors shadow-xs"
              >
                {updatingStatus ? 'Updating...' : 'Apply Status Update'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Two Column Layout: Timeline & Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status History Timeline */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <span>Status Audit Trail & Timeline</span>
          </h2>
          <div className="pt-2">
            <Timeline history={request.statusHistory || []} />
          </div>
        </div>

        {/* Discussion / Responses Thread */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span>Responses & Comments</span>
            </h2>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {!request.comments || request.comments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No responses posted yet.</p>
              ) : (
                request.comments.map(c => (
                  <div
                    key={c.id}
                    className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
                      c.isPrivateStaffNote
                        ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                        : c.authorRole === 'STUDENT'
                        ? 'bg-blue-50/60 border-blue-100 text-slate-800 ml-4'
                        : 'bg-slate-50 border-slate-200 text-slate-800 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{c.authorName}</span>
                        <span className="text-[10px] uppercase font-semibold text-slate-500">
                          ({c.authorRole})
                        </span>
                        {c.isPrivateStaffNote && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                            <Lock className="w-2.5 h-2.5" /> Staff Only Note
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700">{c.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Response Form */}
          <form onSubmit={handleAddComment} className="pt-4 border-t border-slate-100 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="reply-input">
                Add Response
              </label>
              <textarea
                id="reply-input"
                rows={3}
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Write a message or update..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            {/* Note Privacy Checkbox (Staff / Admin Only) */}
            {isStaffOrAdmin && (
              <div className="flex items-center gap-2">
                <input
                  id="private-note-toggle"
                  type="checkbox"
                  checked={isPrivateNote}
                  onChange={e => setIsPrivateNote(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="private-note-toggle" className="text-xs font-medium text-slate-700 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Private internal staff note (Strictly hidden from student)</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={submittingComment}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-70"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submittingComment ? 'Sending...' : 'Post Response'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
