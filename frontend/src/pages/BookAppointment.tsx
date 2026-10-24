import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { Service, User } from '../types/index.js';
import { Calendar, Clock, MapPin, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const BookAppointment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get('serviceId') || '';
  const preselectedStaffId = searchParams.get('staffId') || '';

  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState(preselectedServiceId);
  const [staffMembers, setStaffMembers] = useState<Array<{ id: string; fullName: string; department?: string }>>([]);
  const [staffId, setStaffId] = useState(preselectedStaffId);

  // Date and slot selection
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('10:00');
  const [meetingLocation, setMeetingLocation] = useState('Technology Block Room T-104');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getServices().then(data => {
      setServices(data);
      if (!serviceId && data.length > 0) {
        setServiceId(data[0].id);
      }
    });

    api.getUsers({ role: 'STAFF' }).then(users => {
      setStaffMembers(users);
      if (!staffId && users.length > 0) {
        setStaffId(users[0].id);
      }
    });
  }, []);

  // When service changes, update suggested location
  useEffect(() => {
    const selected = services.find(s => s.id === serviceId);
    if (selected) {
      setMeetingLocation(selected.location);
    }
  }, [serviceId, services]);

  const availableTimes = [
    { start: '09:00', end: '10:00', label: '09:00 AM – 10:00 AM' },
    { start: '10:00', end: '11:00', label: '10:00 AM – 11:00 AM' },
    { start: '11:30', end: '12:30', label: '11:30 AM – 12:30 PM' },
    { start: '14:00', end: '15:00', label: '02:00 PM – 03:00 PM' },
    { start: '15:30', end: '16:30', label: '03:30 PM – 04:30 PM' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const slot = availableTimes.find(t => t.start === timeSlot) || availableTimes[0];
    const startTime = new Date(`${date}T${slot.start}:00`).toISOString();
    const endTime = new Date(`${date}T${slot.end}:00`).toISOString();

    setLoading(true);
    try {
      await api.bookAppointment({
        serviceId,
        staffId,
        startTime,
        endTime,
        meetingLocation,
        notes,
      });
      navigate('/appointments');
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 sm:p-10 max-w-3xl mx-auto w-full space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 text-teal-700 mb-2">
            <Calendar className="w-4 h-4" />
            <span>Consultation Booking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Schedule an Appointment
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Book a dedicated consultation slot with academic advisors, technical specialists, or wellbeing counselors.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Booking Conflict Detected</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Service Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="book-service">
              Select Campus Service *
            </label>
            <select
              id="book-service"
              required
              value={serviceId}
              onChange={e => setServiceId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            >
              {services.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          {/* Staff Member Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="book-staff">
              Select Staff Member / Advisor *
            </label>
            <select
              id="book-staff"
              required
              value={staffId}
              onChange={e => setStaffId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            >
              {staffMembers.map(staff => (
                <option key={staff.id} value={staff.id}>
                  {staff.fullName} — {staff.department}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="book-date">
              Appointment Date *
            </label>
            <input
              id="book-date"
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          {/* Available Slots Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Time Slot (Local Campus Timezone) *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableTimes.map(t => (
                <button
                  key={t.start}
                  type="button"
                  onClick={() => setTimeSlot(t.start)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    timeSlot === t.start
                      ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-600/20 font-bold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2 text-xs">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>{t.label}</span>
                  </span>
                  {timeSlot === t.start && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Meeting Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="book-loc">
              Meeting Location or Virtual Link *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                id="book-loc"
                type="text"
                required
                value={meetingLocation}
                onChange={e => setMeetingLocation(e.target.value)}
                placeholder="Room number or Google Meet URL"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
          </div>

          {/* Consultation Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="book-notes">
              Brief Purpose / Agenda for Consultation (Optional)
            </label>
            <textarea
              id="book-notes"
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Discuss elective subject prerequisites or debug Wi-Fi certificate on Mac"
              className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <Calendar className="w-4 h-4" />
              <span>{loading ? 'Confirming Availability...' : 'Confirm Appointment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
