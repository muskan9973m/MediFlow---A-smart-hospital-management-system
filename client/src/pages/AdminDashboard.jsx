import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Clock,
  Activity,
  Send,
  CheckCircle2,
  Radio,
  Stethoscope
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import StatCard from '../components/StatCard';
import { MOCK_ADMIN_ANALYTICS } from '../data/mockData';
import { adminAPI } from '../services/api';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(MOCK_ADMIN_ANALYTICS);
  const [broadcastText, setBroadcastText] = useState('');
  const [activeBroadcast, setActiveBroadcast] = useState("Hospital Operations Normal: All 6 OPD Wings operating at nominal capacity.");
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    adminAPI.getAnalytics()
      .then(res => {
        if (res?.analytics) {
          setAnalytics(res.analytics);
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePublishBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    setActiveBroadcast(broadcastText);
    setBroadcastText('');
    showToast("Broadcast message published across all hospital terminal displays.");
  };

  const kpis = analytics.kpis;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-slate-800 to-medical-900 rounded-3xl p-6 sm:p-8 text-white shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-sm flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-medical-400" />
              <span>Executive Command Hub</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit']">
            Hospital Operations & Analytics Suite
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Real-time outpatient flow, department queue capacities, physician rosters, and system-wide clinical load.
          </p>
        </div>

        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-xs text-right">
          <span className="text-slate-300 uppercase block text-[10px] font-semibold">Active Roster</span>
          <span className="text-xl font-bold font-['Outfit']">{kpis.doctorsOnDuty} Physicians On-Duty</span>
          <span className="text-emerald-400 block text-[11px] mt-0.5">● Real-time Telemetry</span>
        </div>
      </div>

      {/* Live Operational Broadcast Banner */}
      {activeBroadcast && (
        <div className="p-4 rounded-2xl bg-medical-50 dark:bg-medical-950/40 border border-medical-200 dark:border-medical-800 flex items-center justify-between text-xs text-medical-900 dark:text-medical-200">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-medical-600 animate-pulse shrink-0" />
            <span className="font-bold uppercase tracking-wider text-[10px] text-medical-600 dark:text-medical-400">
              Live Broadcast:
            </span>
            <span>{activeBroadcast}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Broadcasting to 42 Screens</span>
        </div>
      )}

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="OPD Registrations"
          value={kpis.totalPatientsToday}
          subtitle="Total patients checked in"
          icon={Users}
          color="blue"
          trend="+18% vs yesterday"
        />
        <StatCard
          title="Active Consultations"
          value={kpis.activeConsultations}
          subtitle="Currently inside OPD rooms"
          icon={Stethoscope}
          color="teal"
        />
        <StatCard
          title="Average Wait Time"
          value={`${kpis.avgWaitTimeMinutes} min`}
          subtitle="Across all 6 departments"
          icon={Clock}
          color="amber"
          trend="-4 min from peak"
        />
        <StatCard
          title="Facility Occupancy"
          value={`${kpis.bedOccupancyRate}%`}
          subtitle="Clinical beds & exam rooms"
          icon={Activity}
          color="rose"
        />
      </div>

      {/* Interactive Charts Grid (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Patient Flow (Inflow vs Discharge) - 8 cols */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-soft">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                Hourly OPD Patient Inflow vs Discharges
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hourly arrival rate compared with consultation completion
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-300">
              Today (08:00 - 16:00)
            </span>
          </div>

          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.hourlyInflow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="arrivalsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="dischargeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="arrivals" stroke="#0EA5E9" strokeWidth={2} fillOpacity={1} fill="url(#arrivalsGrad)" name="Patient Arrivals" />
                <Area type="monotone" dataKey="discharges" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#dischargeGrad)" name="Discharged" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointment Status Breakdown (PieChart) - 4 cols */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
              Visit Status Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Breakdown of today's booked outpatient slots
            </p>

            <div className="h-60 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.appointmentStatusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analytics.appointmentStatusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-700">
            {analytics.appointmentStatusBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Wait Times & Load Comparison (BarChart) */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-soft">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
              Department Queue Volume & Average Wait Times
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Current waiting tokens vs average consultation delay per department
            </p>
          </div>
        </div>

        <div className="h-72 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.departmentStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="department" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="currentQueue" fill="#0EA5E9" radius={[6, 6, 0, 0]} name="Waiting Patients in Queue" />
              <Bar dataKey="avgWait" fill="#F59E0B" radius={[6, 6, 0, 0]} name="Avg Wait Time (Minutes)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Doctor Duty Roster & Broadcast Creator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Doctor Roster Table (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-soft">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
              Physicians On-Duty & Room Assignments
            </h3>
            <span className="text-xs text-slate-400">Live Hospital Floor Status</span>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-750">
            {analytics.doctorRoster.map((doc, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{doc.name}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {doc.dept} • {doc.room}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-mono text-[11px]">
                    Queue: <strong>{doc.queue}</strong>
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    doc.status === 'In Consultation'
                      ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300'
                      : doc.status === 'Available'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                  }`}>
                    {doc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hospital Broadcast Creator (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
              <Radio className="w-4 h-4 text-medical-600 dark:text-medical-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                Broadcast Announcement
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
              Push hospital operational alerts, emergency announcements, or corridor maintenance notices to waiting room monitors.
            </p>

            <form onSubmit={handlePublishBroadcast} className="mt-4 space-y-3">
              <textarea
                rows={4}
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                placeholder="Type hospital alert to broadcast (e.g. Pediatric Wing B elevator maintenance)..."
                className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-medical-500"
              />

              <button
                type="submit"
                disabled={!broadcastText.trim()}
                className="w-full py-2.5 rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish to All Displays</span>
              </button>
            </form>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-700 text-[11px] text-slate-400 text-center">
            Broadcasting via MediFlow WebSocket Hub
          </div>
        </div>
      </div>
    </div>
  );
}
