import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { Service } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import {
  MapPin,
  Clock,
  Mail,
  Phone,
  FilePlus,
  Calendar,
  Users,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadService(id);
  }, [id]);

  const loadService = async (serviceId: string) => {
    setLoading(true);
    try {
      const data = await api.getServiceById(serviceId);
      setService(data);
    } catch (err: any) {
      setError(err.message || 'Service not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 max-w-5xl mx-auto w-full animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="h-32 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="flex-1 p-8 max-w-xl mx-auto text-center space-y-4">
        <p className="text-sm font-bold text-red-600">{error || 'Service not found.'}</p>
        <Link to="/services" className="inline-block px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl">
          Back to Services Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Services</span>
        </button>
      </div>

      {/* Main Service Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                {service.category}
              </span>
              {!service.isActive && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  Inactive / Maintenance
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {service.name}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`/requests/new?serviceId=${service.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
            >
              <FilePlus className="w-4 h-4" />
              <span>Submit Request</span>
            </Link>
            <Link
              to={`/appointments/book?serviceId=${service.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/20 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </Link>
          </div>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed">{service.description}</p>

        {/* Operating Details Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Physical Location</span>
            </div>
            <p className="text-xs font-bold text-slate-800">{service.location}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Operating Hours</span>
            </div>
            <p className="text-xs font-bold text-slate-800">{service.hours}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
              <Mail className="w-4 h-4 text-indigo-600" />
              <span>Direct Contact</span>
            </div>
            <p className="text-xs font-bold text-slate-800 truncate">{service.contactEmail}</p>
            <p className="text-[11px] text-slate-500">{service.contactPhone}</p>
          </div>
        </div>
      </div>

      {/* Assigned Staff Members */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Assigned Faculty & Specialist Staff</span>
          </h2>
          <span className="text-xs text-slate-500">
            {service.staff?.length || 1} specialist(s) available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(service.staff && service.staff.length > 0) ? (
            service.staff.map((staffMember, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{staffMember.fullName}</h4>
                  <p className="text-[11px] text-blue-600 font-semibold">{staffMember.roleTitle || 'Support Specialist'}</p>
                  <p className="text-[11px] text-slate-500">{staffMember.department || service.name}</p>
                </div>
                <Link
                  to={`/appointments/book?serviceId=${service.id}&staffId=${staffMember.id}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-200 hover:border-blue-600 hover:text-blue-600 shadow-xs transition-colors"
                >
                  Book 1-on-1
                </Link>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between col-span-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Prof. Rajesh Kumar</h4>
                <p className="text-[11px] text-blue-600 font-semibold">Lead Department Coordinator</p>
                <p className="text-[11px] text-slate-500">{service.name}</p>
              </div>
              <Link
                to={`/appointments/book?serviceId=${service.id}`}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-200 hover:border-blue-600 hover:text-blue-600 shadow-xs transition-colors"
              >
                Book 1-on-1
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
