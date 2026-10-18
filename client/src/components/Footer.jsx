import React from 'react';
import { Activity, ShieldCheck, Heart, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-medical-500 to-tealAccent-500 flex items-center justify-center text-white shadow-soft">
                <Activity className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-white font-['Outfit']">
                MediFlow<span className="text-medical-400">AI</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Next-generation smart hospital management connecting patients, doctors, and hospital administrators with live queues and intelligent triage.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-medical-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Academic Capstone & Portfolio System</span>
            </div>
          </div>

          {/* Col 2: Hospital Services */}
          <div>
            <h4 className="text-white font-semibold text-sm font-['Outfit'] uppercase tracking-wider mb-4">
              Services & Portals
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/dashboard" className="hover:text-medical-400 transition-colors">
                  Patient OPD Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-medical-400 transition-colors">
                  Live Queue Token Tracker
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-medical-400 transition-colors">
                  Doctor Schedule Management
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-medical-400 transition-colors">
                  Hospital FAQ Assistant
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-medical-400 transition-colors">
                  Staff & Admin Authentication
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Clinical Departments */}
          <div>
            <h4 className="text-white font-semibold text-sm font-['Outfit'] uppercase tracking-wider mb-4">
              Clinical Wings
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>Cardiovascular Institute (Wing B)</li>
              <li>Neuroscience & Brain Health (Wing A)</li>
              <li>Orthopedic Trauma & Sports (Wing C)</li>
              <li>Pediatric Child Health Wing</li>
              <li>General Diagnostic Outpatient</li>
              <li>Dermatology & Skin Care</li>
            </ul>
          </div>

          {/* Col 4: Contact & Emergency */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm font-['Outfit'] uppercase tracking-wider mb-4">
              Emergency & Support
            </h4>
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-rose-400">
                <Phone className="w-3.5 h-3.5" /> 24/7 Trauma Helpline
              </p>
              <p className="text-sm font-extrabold text-white">+1 (800) 412-MEDI</p>
              <p className="text-[11px] text-rose-400/80">Immediate critical ambulance triage</p>
            </div>
            <div className="text-xs text-slate-400 space-y-2 pt-1">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>400 Health Science Blvd, Medical City</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>support@mediflow.local</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Academic disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 MediFlow AI. Built with React, Tailwind CSS, Vite, and MongoDB.</p>
          <p className="flex items-center gap-1">
            Engineered for <span className="text-slate-300 font-semibold">Academic Evaluation</span> with
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            by College Computer Science Team
          </p>
        </div>
      </div>
    </footer>
  );
}
