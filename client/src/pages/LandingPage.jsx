import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Clock,
  Radio,
  Calendar,
  ShieldCheck,
  Bot,
  Users,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
  Sparkles,
  Lock,
  Building2,
  PhoneCall
} from 'lucide-react';
import { MOCK_DEPARTMENTS, MOCK_DOCTORS } from '../data/mockData';

export default function LandingPage() {
  const features = [
    {
      icon: Radio,
      title: "Live Queue Tracking",
      desc: "Real-time token status with estimated waiting time calculated from queue length and average consultation duration.",
      color: "blue"
    },
    {
      icon: Calendar,
      title: "Intelligent Appointment Booking",
      desc: "Schedule consultations with verified specialists, prevent slot overlaps, and receive unique digital references.",
      color: "teal"
    },
    {
      icon: Bot,
      title: "MediFlow AI Assistant",
      desc: "24/7 conversational hospital guide for OPD timings, department guidance, and appointment FAQs with safe triage disclaimers.",
      color: "purple"
    },
    {
      icon: Users,
      title: "Role-Based Hospital Portals",
      desc: "Custom-tailored, secure dashboards for Patients, Doctors, Receptionists, and Hospital Administrators.",
      color: "amber"
    },
    {
      icon: ShieldCheck,
      title: "HIPAA-Minded Architecture",
      desc: "Strict patient record ownership, encrypted credentials, JWT authorization, and server-side input validation.",
      color: "emerald"
    },
    {
      icon: Activity,
      title: "Live Operational Analytics",
      desc: "Dynamic charts and metrics for hospital management, patient turnover, and department capacity planning.",
      color: "rose"
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Search Department & Doctor",
      desc: "Filter clinical specialists by department, available schedule, and patient ratings."
    },
    {
      step: "02",
      title: "Choose Slot & Book",
      desc: "Select a convenient time slot and describe your symptoms for immediate scheduling."
    },
    {
      step: "03",
      title: "Receive Token & Track Queue",
      desc: "Follow the live OPD queue counter on your smartphone with dynamic waiting estimates."
    },
    {
      step: "04",
      title: "Seamless Consultation",
      desc: "Step directly into your assigned consultation room when your token is called."
    }
  ];

  return (
    <div className="overflow-hidden bg-[#090E17]">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-[#090E17] via-[#0B1324] to-[#090E17]">
        {/* Decorative background glow circles */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-medical-500/15 via-tealAccent-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-medical-950/70 border border-medical-800/60 text-xs font-semibold text-medical-300 mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-medical-400" />
              <span>Smart Hospital Management & Live OPD System</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] font-['Outfit']">
              Smarter Healthcare, <span className="bg-gradient-to-r from-medical-400 via-tealAccent-400 to-medical-200 bg-clip-text text-transparent">Simplified.</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              MediFlow AI streamlines hospital operations by uniting patients, physicians, and administrators. Track your live queue token, schedule doctor appointments, and consult our intelligent hospital FAQ assistant.
            </p>

            {/* Call to Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-medical-600 to-tealAccent-600 hover:from-medical-700 hover:to-tealAccent-700 text-white font-semibold text-sm shadow-soft hover:shadow-card transition-all flex items-center justify-center gap-2 group"
              >
                <span>Launch Patient Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-sm transition-all shadow-xs"
              >
                Explore System Features
              </a>
            </div>

            {/* Quick Demo Test Bar */}
            <div className="mt-10 p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-700 max-w-xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-700 dark:text-slate-300">Quick Test Credentials:</span>
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-2.5 py-1 rounded-lg bg-medical-50 dark:bg-medical-950/50 text-medical-700 dark:text-medical-300 font-semibold hover:underline">
                  Patient Demo
                </Link>
                <Link to="/login" className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium hover:underline">
                  Doctor Demo
                </Link>
                <Link to="/login" className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium hover:underline">
                  Admin Demo
                </Link>
              </div>
            </div>
          </div>

          {/* Interactive Hero Preview Banner */}
          <div className="mt-14 relative max-w-5xl mx-auto rounded-3xl p-3 sm:p-5 bg-gradient-to-b from-slate-200/60 to-slate-300/40 dark:from-slate-700/60 dark:to-slate-800/40 border border-slate-200 dark:border-slate-700 shadow-2xl">
            <div className="bg-white dark:bg-slate-850 rounded-2xl p-5 sm:p-8 border border-slate-100 dark:border-slate-750 shadow-soft">
              <div className="flex flex-wrap items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-700 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-medical-50 dark:bg-medical-950/40 text-medical-600 dark:text-medical-400 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white font-['Outfit']">
                      Live Hospital Command Bar
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Cardiology OPD • Active Token C-11 • Average Consultation: 15 mins
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Queue Online (Socket.IO Ready)
                  </span>
                </div>
              </div>

              {/* Sample Quick Grid inside preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700">
                  <span className="text-xs text-slate-400 font-medium uppercase">Serving Now</span>
                  <p className="text-3xl font-extrabold text-medical-600 dark:text-medical-400 mt-1 font-['Outfit']">
                    C-11
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Dr. Sarah Jenkins (Room 204)</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700">
                  <span className="text-xs text-slate-400 font-medium uppercase">Next in Line</span>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 font-['Outfit']">
                    C-12
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Estimated wait: ~15 mins</p>
                </div>
                <div className="bg-medical-50/70 dark:bg-medical-950/30 p-4 rounded-xl border border-medical-200/60 dark:border-medical-800/40">
                  <span className="text-xs text-medical-700 dark:text-medical-300 font-medium uppercase">Demonstration Profile</span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-['Outfit']">
                    Muskan Singh (C-14)
                  </p>
                  <p className="text-[11px] text-medical-600 dark:text-medical-400 mt-1">3 patients ahead • 45m wait</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-[#0B1324] border-t border-slate-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-medical-400">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 font-['Outfit']">
              Engineered for Modern Clinical Care
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Comprehensive modules engineered to eliminate waiting room bottlenecks, optimize doctor schedules, and provide patients with digital peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 hover:border-medical-500/40 hover:shadow-glow transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-medical-950/60 text-medical-400 flex items-center justify-center border border-medical-800/60 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mt-4 font-['Outfit']">
                    {f.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#090E17] border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-medical-600 dark:text-medical-400">
              Patient Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2 font-['Outfit']">
              How MediFlow Streamlines Visits
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-3">
              From searching specialist doctors to stepping into the consultation room without crowded waiting lobbies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-soft relative"
              >
                <span className="text-3xl font-extrabold text-medical-600/20 dark:text-medical-400/20 font-['Outfit'] absolute top-4 right-5">
                  {st.step}
                </span>
                <div className="w-8 h-8 rounded-lg bg-medical-50 dark:bg-medical-950/40 text-medical-600 dark:text-medical-400 flex items-center justify-center font-bold text-xs mb-4">
                  {st.step}
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                  {st.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Patient & Doctor Benefits Section */}
      <section id="benefits" className="py-20 bg-[#0B1324]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* For Patients */}
            <div className="bg-gradient-to-br from-[#0F172A] to-[#0B1324] p-8 rounded-3xl border border-slate-800 shadow-soft">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-medical-950/60 border border-medical-800/60 text-medical-300">
                For Patients & Families
              </span>
              <h3 className="text-2xl font-bold text-white mt-4 font-['Outfit']">
                Predictable Hospital Visits Without The Waiting Agony
              </h3>
              <ul className="mt-6 space-y-3.5 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Real-time live queue token tracking on any mobile or desktop screen.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Predictive estimated waiting times based on actual consultation pace.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Instant appointment booking with transparent physician availability.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>24/7 MediFlow Assistant answering common hospital FAQs.</span>
                </li>
              </ul>
            </div>

            {/* For Doctors & Administrators */}
            <div className="bg-gradient-to-br from-[#0F172A] to-[#0B1324] p-8 rounded-3xl border border-slate-800 shadow-soft">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-tealAccent-950/60 border border-tealAccent-800/60 text-tealAccent-300">
                For Doctors & Administrators
              </span>
              <h3 className="text-2xl font-bold text-white mt-4 font-['Outfit']">
                Smooth Outpatient Flow & Streamlined Rostering
              </h3>
              <ul className="mt-6 space-y-3.5 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-tealAccent-400 shrink-0 mt-0.5" />
                  <span>Call next patient with a single click, automatically updating live queue.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-tealAccent-400 shrink-0 mt-0.5" />
                  <span>Prevent double-booking with backend slot validation.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-tealAccent-400 shrink-0 mt-0.5" />
                  <span>Audit logging for administrative changes, doctor status, and departments.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-tealAccent-400 shrink-0 mt-0.5" />
                  <span>Recharts-powered department utilization and appointment trends.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Academic Integrity Section */}
      <section id="security" className="py-20 bg-[#090E17] text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-xs text-medical-300 border border-slate-700 mb-4">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Security, Privacy & Responsible AI Design</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-['Outfit']">
              Responsible Architecture & Data Protection
            </h2>
            <p className="mt-4 text-slate-400 text-sm leading-relaxed">
              MediFlow AI follows defense-in-depth principles: hashed passwords, strict role-based access control, zero public admin registration, and clear ethical boundaries for AI assistants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mb-3" />
              <h4 className="text-base font-bold font-['Outfit']">Role Isolation</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Patients cannot access other patients' records. Doctors can only view appointments assigned to their roster. Public registration is restricted to patients only.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80">
              <Bot className="w-8 h-8 text-medical-400 mb-3" />
              <h4 className="text-base font-bold font-['Outfit']">Ethical Healthcare AI</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                The MediFlow Assistant strictly serves informational hospital queries. It explicitly refuses to diagnose diseases, prescribe medication dosages, or replace medical specialists.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80">
              <Building2 className="w-8 h-8 text-amber-400 mb-3" />
              <h4 className="text-base font-bold font-['Outfit']">Synthetic Demo Data</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                In strict compliance with privacy standards, all development and academic demonstration datasets use 100% fictional doctor profiles and synthetic patient appointments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action section */}
      <section className="py-16 bg-gradient-to-r from-medical-600 to-tealAccent-600 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-['Outfit']">
            Experience MediFlow AI in Action
          </h2>
          <p className="mt-3 text-medical-100 text-sm sm:text-base max-w-2xl mx-auto">
            Test the live patient dashboard, explore doctor scheduling, and experiment with the queue simulation in Phase 1.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/dashboard"
              className="px-8 py-3.5 rounded-2xl bg-white text-medical-700 font-bold text-sm shadow-xl hover:bg-medical-50 transition-all"
            >
              Enter Patient Dashboard
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 rounded-2xl bg-medical-800/60 hover:bg-medical-800 text-white font-bold text-sm border border-white/20 transition-all"
            >
              Sign In Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
