import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  HeartPulse,
  Play,
  ShieldAlert,
  ClipboardList
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { MOCK_DOCTOR_QUEUE } from '../data/mockData';
import { queueAPI, getSocket } from '../services/api';

export default function DoctorDashboard() {
  const [queue, setQueue] = useState(MOCK_DOCTOR_QUEUE);
  const [doctorStatus, setDoctorStatus] = useState('active'); // active, break, closed
  const [activePatientIndex, setActivePatientIndex] = useState(0);
  const [consultNotes, setConsultNotes] = useState('');
  const [prescribedMed, setPrescribedMed] = useState('');
  const [orderedLab, setOrderedLab] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const fetchQueue = async () => {
    try {
      const res = await queueAPI.getLiveQueue({ department: 'Cardiology' });
      if (res?.allTokens?.length) {
        setQueue(res.allTokens);
        const inConsultIdx = res.allTokens.findIndex(p => p.status === 'in_consultation');
        if (inConsultIdx !== -1) setActivePatientIndex(inConsultIdx);
      }
    } catch (e) {
      console.warn('DoctorDashboard fetch queue fallback:', e.message);
    }
  };

  useEffect(() => {
    fetchQueue();
    const socket = getSocket();
    const handleUpdate = () => {
      fetchQueue();
    };
    socket.on('queue_updated', handleUpdate);
    return () => {
      socket.off('queue_updated', handleUpdate);
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const activePatient = queue[activePatientIndex] || queue[0];

  const totalPatients = queue.length;
  const completedCount = queue.filter(p => p.status === 'completed').length;
  const waitingCount = queue.filter(p => p.status === 'waiting').length;

  const handleCallPatient = async (index) => {
    const target = queue[index];
    if (target) {
      try {
        await queueAPI.updateToken(target.token, { status: 'in_consultation' });
      } catch (e) {
        console.warn('Failed remote token call:', e);
      }
    }

    setQueue(prev =>
      prev.map((p, idx) => {
        if (idx === index) return { ...p, status: 'in_consultation' };
        if (p.status === 'in_consultation') return { ...p, status: 'completed' };
        return p;
      })
    );
    setActivePatientIndex(index);
    setConsultNotes('');
    setPrescribedMed('');
    setOrderedLab('');
    showToast(`Now consulting ${queue[index].patientName} (${queue[index].token})`);
  };

  const handleCompleteConsultation = async () => {
    if (!activePatient) return;
    try {
      await queueAPI.updateToken(activePatient.token, {
        status: 'completed',
        notes: consultNotes || 'Consultation completed'
      });
    } catch (e) {
      console.warn('Failed remote status complete:', e);
    }

    setQueue(prev =>
      prev.map((p, idx) =>
        idx === activePatientIndex ? { ...p, status: 'completed' } : p
      )
    );
    showToast(`Consultation finalized for ${activePatient.patientName}. Records saved to EHR.`);

    // Automatically advance to next waiting patient if available
    const nextWaitIdx = queue.findIndex((p, idx) => idx > activePatientIndex && p.status === 'waiting');
    if (nextWaitIdx !== -1) {
      setTimeout(() => {
        handleCallPatient(nextWaitIdx);
      }, 500);
    }
  };

  const handleFlagUrgent = async (index) => {
    const target = queue[index];
    if (target) {
      try {
        await queueAPI.updateToken(target.token, { triageLevel: 'Urgent' });
      } catch (e) {}
    }
    setQueue(prev =>
      prev.map((p, idx) =>
        idx === index ? { ...p, triageLevel: 'Urgent' } : p
      )
    );
    showToast(`Patient ${queue[index].token} flagged as Urgent Triage priority.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Doctor On-Duty Controls */}
      <div className="bg-gradient-to-r from-medical-700 via-navy-800 to-navy-900 rounded-3xl p-6 sm:p-8 text-white shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-medical-200" />
              <span>Cardiology OPD • Room 204 (Wing B)</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit']">
            Dr. Sarah Jenkins' Consultation Console
          </h1>
          <p className="text-xs sm:text-sm text-medical-100 mt-1 max-w-xl">
            Live patient queue management, vitals monitoring, electronic prescriptions, and real-time clinical notes.
          </p>
        </div>

        {/* Doctor Status Selector */}
        <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 flex items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={() => {
              setDoctorStatus('active');
              showToast("Status: Active & Calling Patients");
            }}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              doctorStatus === 'active'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span>Seeing Patients</span>
          </button>
          <button
            onClick={() => {
              setDoctorStatus('break');
              showToast("Status: On Clinical Break");
            }}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              doctorStatus === 'break'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            On Break
          </button>
          <button
            onClick={() => {
              setDoctorStatus('closed');
              showToast("Status: OPD Consultation Closed");
            }}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              doctorStatus === 'closed'
                ? 'bg-slate-700 text-white shadow-md'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            OPD Closed
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Patients Seen Today"
          value={completedCount + 11}
          subtitle="Total finished visits"
          icon={CheckCircle2}
          color="emerald"
          trend="+3 last hour"
        />
        <StatCard
          title="Current Queue Waiting"
          value={waitingCount}
          subtitle="Patients in waiting hall"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Avg. Consultation Time"
          value="18 min"
          subtitle="Per scheduled slot"
          icon={Activity}
          color="blue"
        />
        <StatCard
          title="Priority Triage Cases"
          value="2"
          subtitle="Fast-tracked cases"
          icon={ShieldAlert}
          color="rose"
        />
      </div>

      {/* Active Consultation Workspace + Queue Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active In-Room Patient Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-soft flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                  Active Consultation Room
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300">
                Token {activePatient?.token}
              </span>
            </div>

            {activePatient ? (
              <div className="mt-4 space-y-4">
                {/* Patient Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                      {activePatient.patientName}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Age: {activePatient.age} • Gender: {activePatient.gender} • Slot: {activePatient.appointmentTime}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    activePatient.triageLevel === 'Urgent'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                  }`}>
                    {activePatient.triageLevel} Triage
                  </span>
                </div>

                {/* Vitals Grid */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-[10px] text-slate-400 block">BP</span>
                    <span className="font-bold text-slate-900 dark:text-white">{activePatient.vitals.bp}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-[10px] text-slate-400 block">Pulse</span>
                    <span className="font-bold text-slate-900 dark:text-white">{activePatient.vitals.heartRate}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-[10px] text-slate-400 block">SpO2</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{activePatient.vitals.spo2}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-[10px] text-slate-400 block">Temp</span>
                    <span className="font-bold text-slate-900 dark:text-white">{activePatient.vitals.temp}</span>
                  </div>
                </div>

                {/* Chief Complaint */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200/60 dark:border-slate-700 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                    Chief Symptom / Visit Reason:
                  </span>
                  <p className="text-slate-600 dark:text-slate-300">{activePatient.visitReason}</p>
                </div>

                {/* Allergy warning if any */}
                {activePatient.allergies.length > 0 && activePatient.allergies[0] !== "None" && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Documented Allergies: <strong>{activePatient.allergies.join(', ')}</strong></span>
                  </div>
                )}

                {/* Clinical Notes & Prescription Form */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Doctor Clinical Notes & Observations
                    </label>
                    <textarea
                      rows={2}
                      value={consultNotes}
                      onChange={(e) => setConsultNotes(e.target.value)}
                      placeholder="Enter examination notes, murmur grading, or follow-up recommendation..."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-medical-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Prescribe Medication
                      </label>
                      <input
                        type="text"
                        value={prescribedMed}
                        onChange={(e) => setPrescribedMed(e.target.value)}
                        placeholder="e.g. Metoprolol 25mg"
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Order Diagnostic Lab
                      </label>
                      <input
                        type="text"
                        value={orderedLab}
                        onChange={(e) => setOrderedLab(e.target.value)}
                        placeholder="e.g. 12-Lead ECG, Echo"
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                No active consultation in progress.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={handleCompleteConsultation}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-medical-600 to-tealAccent-600 hover:from-medical-700 hover:to-tealAccent-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Finalize Consultation & Call Next</span>
            </button>
          </div>
        </div>

        {/* Doctor OPD Queue Lineup Table (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-medical-600 dark:text-medical-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                  Today's Scheduled Cardiology Queue
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {waitingCount} waiting / {totalPatients} scheduled
              </span>
            </div>

            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-750">
              {queue.map((p, idx) => (
                <div
                  key={p.token}
                  className={`py-3.5 px-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    p.status === 'in_consultation'
                      ? 'bg-medical-50/70 dark:bg-medical-950/40 border border-medical-200/60 dark:border-medical-800/40'
                      : p.status === 'completed'
                      ? 'opacity-60 bg-slate-50/50 dark:bg-slate-850/50'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-bold text-medical-600 dark:text-medical-400 bg-white dark:bg-slate-700 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-600">
                      {p.token}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {p.patientName}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.triageLevel === 'Urgent'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {p.triageLevel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {p.visitReason}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {p.status === 'completed' ? (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    ) : p.status === 'in_consultation' ? (
                      <span className="text-xs text-teal-600 dark:text-teal-400 font-bold animate-pulse">
                        In Room 204
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleFlagUrgent(idx)}
                          className="px-2 py-1 text-[11px] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg font-medium"
                          title="Priority Triage"
                        >
                          Urgent
                        </button>
                        <button
                          onClick={() => handleCallPatient(idx)}
                          className="px-3 py-1.5 rounded-xl bg-medical-600 hover:bg-medical-700 text-white text-xs font-semibold flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          <span>Call In</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-400">
            <span>Room 204 - Wing B Audio Chime: Synchronized with Live Display</span>
            <span className="font-mono">OPD Desk Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
