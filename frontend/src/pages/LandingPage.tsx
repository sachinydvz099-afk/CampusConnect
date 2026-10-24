import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import {
  Compass,
  FileCheck,
  CalendarCheck,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Wifi,
  BookOpen,
  HeartPulse,
  Laptop,
  Briefcase,
  GraduationCap,
  Clock,
  PhoneCall,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  const coreServices = [
    {
      title: 'IT Support & Campus Wi-Fi',
      desc: 'High-speed campus network setup, lab software licenses, and student device troubleshooting.',
      icon: Wifi,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      title: 'Academic Advising & Mentorship',
      desc: 'Course degree audit, elective selections, credit transfers, and faculty mentor guidance.',
      icon: BookOpen,
      color: 'bg-teal-50 text-teal-600 border-teal-200',
    },
    {
      title: 'Counseling & Mental Wellbeing',
      desc: 'Confidential 1-on-1 counseling, exam stress relief sessions, and emotional wellness coaching.',
      icon: HeartPulse,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
    },
    {
      title: 'Lab Equipment Loans',
      desc: 'Borrow IoT development kits (Arduino, Raspberry Pi), DSLR cameras, and high-spec loaner laptops.',
      icon: Laptop,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      title: 'Central Library Assistance',
      desc: 'Access IEEE Xplore, research paper printing, private study pods, and thesis formatting clinics.',
      icon: GraduationCap,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      title: 'Career & Placement Cell',
      desc: 'Resume reviews, mock technical interview preparation, and on-campus recruitment registrations.',
      icon: Briefcase,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-800 to-slate-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-200">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Official University Campus Services Portal</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
            Seamless Campus Services, Support & Appointments
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            CampusConnect empowers students, faculty, and administrative staff with a unified, transparent platform to request assistance, schedule consultations, and track resolutions.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-300 hover:to-teal-400 text-slate-950 shadow-lg shadow-teal-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Compass className="w-4 h-4" />
              <span>Browse All Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {user ? (
              <Link
                to={user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'STAFF' ? '/staff/dashboard' : '/dashboard'}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all"
              >
                <span>Go to My Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all"
              >
                <span>Sign In / Demo Login</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Highlights / Features Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-900/5 border border-slate-200/80 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Trackable Service Requests</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Submit requests with priorities, receive auto-generated ticket numbers, and observe live status updates.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-900/5 border border-slate-200/80 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 shrink-0">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Zero-Conflict Appointments</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Book 1-on-1 consultations with faculty mentors and department specialists with automated double-booking prevention.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-900/5 border border-slate-200/80 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Role-Enforced Privacy</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Internal staff collaboration notes remain strictly protected and confidential from student views.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Directory Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Explore Campus Facilities</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Popular Campus Services
            </h2>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <span>View Full Directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreServices.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-4 group-hover:scale-105 transition-transform ${srv.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {srv.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to="/services"
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                  >
                    <span>Request Assistance</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/appointments/book"
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Book Slot
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Campus Emergency / Operating Hours Footer Info */}
      <section className="bg-slate-900 text-slate-300 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-base mb-2">
              <GraduationCap className="w-5 h-5 text-teal-400" />
              <span>CampusConnect Platform</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Designed as a Final Year BCA Capstone Project showcasing modern full-stack web engineering with React, Vite, Express, TypeScript, and Prisma.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Support Desk Operating Hours</span>
            </h4>
            <p className="text-xs text-slate-400">Monday – Friday: 8:30 AM – 5:30 PM</p>
            <p className="text-xs text-slate-400">Saturday: 9:00 AM – 1:00 PM (Emergency only)</p>
            <p className="text-xs text-slate-400">Sunday: Closed</p>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-teal-400" />
              <span>Emergency Helpdesks</span>
            </h4>
            <p className="text-xs text-slate-400">Campus Security: +91 80 2345 6799</p>
            <p className="text-xs text-slate-400">Medical Center: +91 80 2345 6788</p>
            <p className="text-xs text-slate-400">IT Helpdesk: itsupport@campusconnect.edu</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} CampusConnect. All rights reserved.
        </div>
      </section>
    </div>
  );
};
