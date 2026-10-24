import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { Service } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Search,
  MapPin,
  Clock,
  Mail,
  Phone,
  FilePlus,
  Calendar,
  ArrowRight,
  Filter,
  Plus,
} from 'lucide-react';

export const ServicesDirectory: React.FC = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const categories = [
    'ALL',
    'Technology',
    'Academics',
    'Library',
    'Counseling',
    'Equipment Loans',
    'Career Services',
  ];

  useEffect(() => {
    loadServices();
  }, [search, selectedCategory]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await api.getServices({
        search: search || undefined,
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        includeInactive: user?.role === 'ADMIN',
      });
      setServices(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Campus Services Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse campus facilities, request academic and technical assistance, or schedule an advisor appointment
          </p>
        </div>

        {user?.role === 'ADMIN' && (
          <Link
            to="/admin/services"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Service</span>
          </Link>
        )}
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-8 space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search services by keyword, category, lab equipment, or location..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          />
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1 shrink-0 pl-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat === 'ALL' ? 'All Services' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200/80 animate-pulse h-64" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Services Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search keywords or clear category filters.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('ALL');
            }}
            className="mt-4 px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <div
              key={service.id}
              className={`bg-white rounded-2xl p-6 border transition-all flex flex-col justify-between group hover:shadow-lg ${
                service.isActive ? 'border-slate-200/80' : 'border-amber-300 bg-amber-50/20 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {service.category}
                  </span>
                  {!service.isActive && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      Inactive
                    </span>
                  )}
                </div>

                <Link to={`/services/${service.id}`}>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {service.name}
                  </h3>
                </Link>

                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {service.description}
                </p>

                {/* Location & Hours metadata */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="truncate">{service.location}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="truncate">{service.hours}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={`/requests/new?serviceId=${service.id}`}
                    className="py-2 px-3 rounded-xl text-xs font-bold text-center bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <FilePlus className="w-3.5 h-3.5" />
                    <span>Request</span>
                  </Link>

                  <Link
                    to={`/appointments/book?serviceId=${service.id}`}
                    className="py-2 px-3 rounded-xl text-xs font-bold text-center bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Slot</span>
                  </Link>
                </div>

                <Link
                  to={`/services/${service.id}`}
                  className="w-full text-center py-1.5 block text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                  View full details & staff members &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
