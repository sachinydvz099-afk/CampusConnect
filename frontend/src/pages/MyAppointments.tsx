import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { Appointment } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { Modal } from '../components/Modal.js';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  XCircle,
  AlertCircle,
  Video,
} from 'lucide-react';

export const MyAppointments: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Cancel Modal state
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await api.getAppointments();
      setAppointments(data);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApt || !cancelReason.trim()) return;

    setCancelling(true);
    setCancelError(null);
    try {
      await api.cancelAppointment(selectedApt.id, cancelReason);
      setSelectedApt(null);
      setCancelReason('');
      await loadAppointments();
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {user?.role === 'STUDENT' ? 'My Campus Appointments' : 'Consultations Schedule'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            View scheduled consultations, room locations, meeting links, or cancel upcoming slots
          </p>
        </div>

        <Link
          to="/appointments/book"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Slot</span>
        </Link>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200/80 animate-pulse" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Appointments Scheduled</h3>
          <p className="text-xs text-slate-500 mt-1">
            You do not have any confirmed or past consultations on record.
          </p>
          <Link
            to="/appointments/book"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Book a Consultation Slot</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map(apt => {
            const isGoogleMeet = apt.meetingLocation.includes('http');
            const isBooked = apt.status === 'BOOKED';

            return (
              <div
                key={apt.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {apt.appointmentNumber}
                    </span>
                    <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {apt.serviceName}
                    </span>
                    <StatusBadge status={apt.status} />
                  </div>

                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>
                      {user?.role === 'STUDENT'
                        ? `Consultant: ${apt.staffName}`
                        : `Student: ${apt.studentName} (${apt.studentIdNumber || 'ID'})`}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        {new Date(apt.startTime).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        •{' '}
                        {new Date(apt.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        –{' '}
                        {new Date(apt.endTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </span>

                    <span className="flex items-center gap-1.5">
                      {isGoogleMeet ? (
                        <Video className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      {isGoogleMeet ? (
                        <a
                          href={apt.meetingLocation}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-emerald-600 hover:underline"
                        >
                          Join Virtual Meeting Link
                        </a>
                      ) : (
                        <span>{apt.meetingLocation}</span>
                      )}
                    </span>
                  </div>

                  {apt.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="font-semibold text-slate-700">Agenda:</span> {apt.notes}
                    </p>
                  )}

                  {apt.cancelledReason && (
                    <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                      <span className="font-bold">Cancellation Reason:</span> {apt.cancelledReason}
                    </p>
                  )}
                </div>

                {/* Cancel Action */}
                {isBooked && (
                  <div className="shrink-0 flex items-center md:justify-end">
                    <button
                      onClick={() => {
                        setSelectedApt(apt);
                        setCancelReason('');
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Cancel Slot</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!selectedApt}
        onClose={() => setSelectedApt(null)}
        title="Cancel Confirmed Appointment"
      >
        {selectedApt && (
          <form onSubmit={handleConfirmCancel} className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel appointment{' '}
              <span className="font-bold text-slate-800">{selectedApt.appointmentNumber}</span> with{' '}
              <span className="font-bold text-slate-800">{selectedApt.staffName}</span>? The time slot will be released back to the campus schedule.
            </p>

            {cancelError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{cancelError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="cancel-reason">
                Reason for Cancellation *
              </label>
              <textarea
                id="cancel-reason"
                required
                rows={3}
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="e.g. Class schedule conflict or query already resolved"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedApt(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Keep Appointment
              </button>
              <button
                type="submit"
                disabled={cancelling}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm disabled:opacity-70"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
