import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Service } from '../types/index.js';
import { Modal } from '../components/Modal.js';
import {
  Compass,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
} from 'lucide-react';

export const AdminServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Technology');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [hours, setHours] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Toast / feedback message
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadServices();
  }, [search]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await api.getServices({
        search: search || undefined,
        includeInactive: true, // Admin views all
      });
      setServices(data);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingService(null);
    setName('');
    setCategory('Technology');
    setDescription('');
    setLocation('');
    setHours('Monday to Friday: 9:00 AM – 5:00 PM');
    setContactEmail('');
    setContactPhone('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setCategory(service.category);
    setDescription(service.description);
    setLocation(service.location);
    setHours(service.hours);
    setContactEmail(service.contactEmail);
    setContactPhone(service.contactPhone);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    try {
      if (editingService) {
        await api.updateService(editingService.id, {
          name,
          category,
          description,
          location,
          hours,
          contactEmail,
          contactPhone,
        });
        setFeedback(`Service "${name}" updated successfully.`);
      } else {
        await api.createService({
          name,
          category,
          description,
          location,
          hours,
          contactEmail,
          contactPhone,
        });
        setFeedback(`New service "${name}" created.`);
      }

      setModalOpen(false);
      await loadServices();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save service.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      await api.updateService(service.id, { isActive: !service.isActive });
      setFeedback(`Service "${service.name}" is now ${!service.isActive ? 'Active' : 'Inactive'}.`);
      await loadServices();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status.');
    }
  };

  const handleDelete = async (service: Service) => {
    if (!window.confirm(`Are you sure you want to remove or deactivate "${service.name}"? If it has historical requests, it will be safely deactivated.`)) {
      return;
    }

    try {
      const res = await api.deleteOrDeactivateService(service.id);
      setFeedback(res.action === 'DEACTIVATED' ? `Service safely deactivated (preserved historical records).` : `Service deleted permanently.`);
      await loadServices();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete service.');
    }
  };

  return (
    <div className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Campus Services Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, edit, or deactivate university departments and student service facilities
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search services by title or department..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
          />
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Service Name</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Operating Hours</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">Loading services...</td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">No services found.</td>
                </tr>
              ) : (
                services.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{s.name}</p>
                      <p className="text-[11px] text-slate-400">{s.contactEmail}</p>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-bold">
                        {s.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{s.location}</td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{s.hours}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleToggleActive(s)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-colors ${
                          s.isActive
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        title="Click to toggle active status"
                      >
                        {s.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-slate-400" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit service details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(s)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        title="Deactivate / Delete service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingService ? 'Edit Campus Service' : 'Add New Campus Service'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="srv-name">
              Service Name *
            </label>
            <input
              id="srv-name"
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Student Wellness & Counseling"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-purple-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="srv-cat">
              Category *
            </label>
            <select
              id="srv-cat"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:border-purple-600"
            >
              <option value="Technology">Technology</option>
              <option value="Academics">Academics</option>
              <option value="Library">Library</option>
              <option value="Counseling">Counseling</option>
              <option value="Equipment Loans">Equipment Loans</option>
              <option value="Career Services">Career Services</option>
              <option value="Facilities">Facilities</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="srv-desc">
              Description *
            </label>
            <textarea
              id="srv-desc"
              rows={3}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Explain available services, student eligibility, and instructions..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-purple-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="srv-loc">
                Location / Room *
              </label>
              <input
                id="srv-loc"
                type="text"
                required
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Room T-104, Tech Block"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="srv-hrs">
                Operating Hours *
              </label>
              <input
                id="srv-hrs"
                type="text"
                required
                value={hours}
                onChange={e => setHours(e.target.value)}
                placeholder="Mon-Fri: 9 AM - 5 PM"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-purple-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="srv-email">
                Contact Email *
              </label>
              <input
                id="srv-email"
                type="email"
                required
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                placeholder="support@campusconnect.edu"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="srv-phone">
                Contact Phone *
              </label>
              <input
                id="srv-phone"
                type="text"
                required
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                placeholder="+91 80 2345 6701"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-purple-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-sm disabled:opacity-70"
            >
              {saving ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
