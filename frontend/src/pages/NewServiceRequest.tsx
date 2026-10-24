import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { Service, RequestPriority } from '../types/index.js';
import { FilePlus, AlertCircle, ArrowLeft, Send, Paperclip } from 'lucide-react';

export const NewServiceRequest: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get('serviceId') || '';

  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState(preselectedServiceId);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<RequestPriority>('MEDIUM');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getServices().then(data => {
      setServices(data);
      if (!serviceId && data.length > 0) {
        setServiceId(data[0].id);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (description.trim().length < 15) {
      setError('Please provide at least 15 characters of detail to help staff understand your issue.');
      return;
    }

    setLoading(true);
    try {
      const created = await api.createRequest({
        serviceId,
        subject,
        description,
        priority,
        attachmentUrl: attachmentUrl || undefined,
      });
      navigate(`/requests/${created.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request.');
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 mb-2">
            <FilePlus className="w-4 h-4" />
            <span>Support Request Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Submit a New Service Request
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fill out the details below. A unique tracking number will be assigned to your ticket immediately.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Service Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="req-service">
              Select Campus Department / Service *
            </label>
            <select
              id="req-service"
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

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="req-subject">
              Request Subject *
            </label>
            <input
              id="req-subject"
              type="text"
              required
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g. Wi-Fi dropping in Hostel Block 3 or Lab Projector HDMI fault"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Priority Level *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { val: 'LOW', label: 'Low', desc: 'General question / non-urgent' },
                { val: 'MEDIUM', label: 'Medium', desc: 'Standard support requirement' },
                { val: 'HIGH', label: 'High', desc: 'Impacting study or assignments' },
                { val: 'URGENT', label: 'Urgent', desc: 'Critical block / safety issue' },
              ].map(p => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setPriority(p.val as RequestPriority)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    priority === p.val
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-800">{p.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="req-desc">
              Detailed Description *
            </label>
            <textarea
              id="req-desc"
              rows={4}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide context, exact room number, error codes, steps taken, or dates..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          {/* Optional Attachment URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="req-attach">
              Optional Attachment Link (Google Drive / Image / Documentation URL)
            </label>
            <div className="relative">
              <Paperclip className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                id="req-attach"
                type="url"
                value={attachmentUrl}
                onChange={e => setAttachmentUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Submitting Ticket...' : 'Submit Service Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
