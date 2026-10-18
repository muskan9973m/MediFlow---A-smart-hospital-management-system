import React, { useState, useEffect } from 'react';
import {
  Radio,
  Clock,
  Users,
  Volume2,
  VolumeX,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  ChevronRight,
  ArrowRight,
  Navigation,
  Sparkles,
  ShieldAlert,
  Info
} from 'lucide-react';
import Badge from '../components/Badge';
import { MOCK_DEPARTMENTS, MOCK_QUEUE } from '../data/mockData';
import { queueAPI, getSocket } from '../services/api';

// Department queue presets for realistic switching
const DEPT_QUEUES = {
  Cardiology: {
    prefix: "C",
    currentNum: 0,
    patientNum: 0,
    doctor: "Dr. Sarah Jenkins, MD",
    room: "Room 204 - Wing B",
    avgMin: 15,
    floor: "2nd Floor, Wing B (Take Elevator 2)"
  },
  Neurology: {
    prefix: "N",
    currentNum: 0,
    patientNum: 0,
    doctor: "Dr. Marcus Chen, MD",
    room: "Room 312 - Wing A",
    avgMin: 20,
    floor: "3rd Floor, Wing A (Follow Blue Line)"
  },
  Orthopedics: {
    prefix: "O",
    currentNum: 0,
    patientNum: 0,
    doctor: "Dr. Rachel Adams, MS",
    room: "Room 108 - Wing C",
    avgMin: 18,
    floor: "1st Floor, Wing C (Adjacent to Radiology)"
  },
  Pediatrics: {
    prefix: "P",
    currentNum: 0,
    patientNum: 0,
    doctor: "Dr. David Kim, MD",
    room: "Room 102 - Wing B",
    avgMin: 12,
    floor: "1st Floor, Wing B (Kids Play Zone)"
  },
  "General Medicine": {
    prefix: "G",
    currentNum: 0,
    patientNum: 0,
    doctor: "Dr. Sophia Patel, MBBS",
    room: "OPD Desk 4 - Ground Floor",
    avgMin: 10,
    floor: "Ground Floor Main Atrium"
  }
};

export default function LiveQueuePage() {
  const [selectedDept, setSelectedDept] = useState("Orthopedics");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isCallingNext, setIsCallingNext] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState(null);

  // Queue state for active department
  const [deptState, setDeptState] = useState(() => {
    const initial = {};
    Object.keys(DEPT_QUEUES).forEach(dept => {
      const d = DEPT_QUEUES[dept];
      initial[dept] = {
        currentNum: d.currentNum,
        patientNum: d.patientNum,
        status: 'waiting'
      };
    });
    return initial;
  });

  const activeDeptInfo = DEPT_QUEUES[selectedDept] || DEPT_QUEUES.Orthopedics;
  const activeQueue = deptState[selectedDept] || { currentNum: 0, patientNum: 0, status: 'waiting' };

  const currentServingToken = activeQueue.currentNum > 0
    ? `${activeDeptInfo.prefix}-${String(activeQueue.currentNum).padStart(2, '0')}`
    : "None";
  const myToken = activeQueue.patientNum > 0
    ? `${activeDeptInfo.prefix}-${String(activeQueue.patientNum).padStart(2, '0')}`
    : "No Token";
  const patientsAhead = Math.max(0, activeQueue.patientNum - activeQueue.currentNum);
  const estimatedWaitMin = patientsAhead * activeDeptInfo.avgMin;

  // Web Audio API Synthesizer for realistic Hospital Chime sound
  const playHospitalChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const playTone = (freq, start, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      playTone(659.25, 0, 0.4); // E5
      playTone(880, 0.25, 0.6); // A5
    } catch (e) {
      // AudioContext fallback
    }
  };

  const fetchLiveQueue = async () => {
    try {
      const res = await queueAPI.getLiveQueue({ department: selectedDept });
      if (res?.currentlyServing && res.currentlyServing !== 'None') {
        const tokenNum = parseInt(res.currentlyServing.split('-')[1], 10);
        if (!isNaN(tokenNum)) {
          setDeptState(prev => ({
            ...prev,
            [selectedDept]: {
              ...prev[selectedDept],
              currentNum: tokenNum
            }
          }));
        }
      }
    } catch (e) {
      console.warn('Queue live fetch fallback:', e);
    }
  };

  useEffect(() => {
    fetchLiveQueue();
    const socket = getSocket();
    const onQueueUpdate = () => {
      fetchLiveQueue();
      playHospitalChime();
    };
    const onTokenCall = (data) => {
      fetchLiveQueue();
      playHospitalChime();
    };

    socket.on('queue_updated', onQueueUpdate);
    socket.on('token_called', onTokenCall);

    return () => {
      socket.off('queue_updated', onQueueUpdate);
      socket.off('token_called', onTokenCall);
    };
  }, [selectedDept, soundEnabled]);

  const handleCallNext = async () => {
    setIsCallingNext(true);
    try {
      await queueAPI.callNextToken({ department: selectedDept });
    } catch (e) {
      console.warn('Remote call next token failed, using local simulation:', e);
    }

    setDeptState(prev => {
      const current = prev[selectedDept];
      const nextNum = current.currentNum + 1;
      let nextStatus = 'waiting';
      if (nextNum === current.patientNum) nextStatus = 'called';
      if (nextNum > current.patientNum) nextStatus = 'in_consultation';

      return {
        ...prev,
        [selectedDept]: {
          ...current,
          currentNum: nextNum,
          status: nextStatus
        }
      };
    });

    playHospitalChime();
    setIsCallingNext(false);
  };

  // Priority Emergency Triage Case Simulation
  const handleSimulateEmergency = () => {
    setEmergencyAlert({
      title: "Priority Emergency Triage Injected",
      dept: selectedDept,
      time: "Just now"
    });
    playHospitalChime();

    setTimeout(() => {
      setEmergencyAlert(null);
    }, 6000);
  };

  // Generate tokens lineup
  const tokenLineup = [];
  if (activeQueue.currentNum > 0) {
    for (let i = 0; i <= 5; i++) {
      const num = activeQueue.currentNum + i;
      const tokenStr = `${activeDeptInfo.prefix}-${String(num).padStart(2, '0')}`;
      let roleStatus = i === 0 ? "Serving Now" : i === 1 ? "Next In Line" : `Waiting (${i * activeDeptInfo.avgMin} min)`;
      let isMyToken = num === activeQueue.patientNum;
      tokenLineup.push({ num, tokenStr, roleStatus, isMyToken });
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-medical-50 dark:bg-medical-950/40 text-medical-600 dark:text-medical-400">
              <Radio className="w-4 h-4 animate-pulse text-medical-500" />
            </span>
            <span className="text-xs font-semibold text-medical-600 dark:text-medical-400 uppercase tracking-wider">
              Real-Time Outpatient Operations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
            OPD Live Queue Board
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Simulate and track real-time queue tokens, estimated waiting times, and digital overhead waiting hall announcements across hospital departments.
          </p>
        </div>

        {/* Chime audio toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playHospitalChime();
            }}
            className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              soundEnabled
                ? 'bg-medical-50 border-medical-200 text-medical-700 dark:bg-medical-950/40 dark:border-medical-800 dark:text-medical-300'
                : 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-750 dark:border-slate-700 dark:text-slate-400'
            }`}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-medical-600 dark:text-medical-400" />
                <span>Audio Chime: On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span>Audio Chime: Off</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Emergency Triage Notice */}
      {emergencyAlert && (
        <div className="bg-rose-500 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 animate-bounce" />
            <div>
              <p className="font-bold text-sm">Emergency Triage Alert</p>
              <p className="text-xs text-rose-100">
                A critical trauma case was fast-tracked into {emergencyAlert.dept} OPD. Wait times temporarily paused for 5 minutes.
              </p>
            </div>
          </div>
          <button
            onClick={() => setEmergencyAlert(null)}
            className="text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Department Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {Object.keys(DEPT_QUEUES).map((dept) => {
          const isSelected = selectedDept === dept;
          return (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-navy-900 text-white dark:bg-medical-600 shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{dept}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {DEPT_QUEUES[dept].prefix}
              </span>
            </button>
          );
        })}
      </div>

      {/* Big Digital Display Monitor (Hospital Overhead Style) */}
      <div className="bg-gradient-to-br from-navy-900 via-slate-900 to-navy-950 rounded-3xl p-6 sm:p-10 text-white shadow-2xl border border-slate-700 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-medical-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_#10B981]" />
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-medical-400 font-semibold">
                OPD WAITING HALL MONITOR • LIVE FEED
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-['Outfit']">
                {selectedDept} Department
              </h2>
            </div>
          </div>

          <div className="text-left md:text-right text-xs text-slate-400">
            <p className="font-semibold text-slate-300">{activeDeptInfo.doctor}</p>
            <p className="text-medical-400 font-mono mt-0.5">{activeDeptInfo.room}</p>
          </div>
        </div>

        {/* Display Core: Big Serving Token & Next in line */}
        <div className="relative z-10 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Huge Token (7 cols) */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-2">
            <span className="text-xs uppercase font-mono tracking-widest text-slate-400 block font-bold">
              NOW SERVING PATIENT TOKEN
            </span>
            <div className="inline-block py-2 px-8 rounded-3xl bg-slate-850/80 border border-slate-700/80 shadow-inner">
              <span className="text-6xl sm:text-7xl lg:text-8xl font-black font-['Outfit'] tracking-tight bg-gradient-to-r from-medical-400 via-tealAccent-300 to-medical-200 bg-clip-text text-transparent">
                {currentServingToken}
              </span>
            </div>
            <p className="text-xs text-slate-400 pt-2 flex items-center justify-center lg:justify-start gap-2">
              <MapPin className="w-4 h-4 text-medical-400" />
              <span>Please proceed immediately to <strong>{activeDeptInfo.room}</strong></span>
            </p>
          </div>

          {/* Interactive Simulation Controls (5 cols) */}
          <div className="lg:col-span-5 bg-slate-850/60 backdrop-blur-md rounded-2xl p-5 border border-slate-700 space-y-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">Simulation Console</span>
              <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800">
                Evaluation Mode
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Test queue progression and audio announcement chime as if the physician just completed a consultation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleCallNext}
                disabled={isCallingNext}
                className="py-2.5 px-3 rounded-xl bg-medical-600 hover:bg-medical-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCallingNext ? 'animate-spin' : ''}`} />
                <span>Call Next Token</span>
              </button>

              <button
                onClick={handleSimulateEmergency}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-900/60 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Inject Triage</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Patient's Personal Token Status Card & Wait Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Personal Token Card (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-medical-50 dark:bg-medical-950/40 text-medical-600 dark:text-medical-400">
                <Users className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                Your Assigned Token
              </h3>
            </div>
            {activeQueue.status === 'called' ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 animate-pulse">
                It's Your Turn!
              </span>
            ) : activeQueue.status === 'in_consultation' ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300">
                In Consultation
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300">
                Waiting ({patientsAhead} ahead)
              </span>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-750 border border-slate-200/60 dark:border-slate-700/60 text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Digital Token Pass
            </span>
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] my-1 block">
              {myToken}
            </span>
            <span className="text-xs text-medical-600 dark:text-medical-400 font-medium">
              Muskan Singh • Ref: MF-2026-8941
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200/50 dark:border-slate-700/50">
              <span className="text-slate-400 block text-[10px]">Patients Ahead</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                {patientsAhead}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200/50 dark:border-slate-700/50">
              <span className="text-slate-400 block text-[10px]">Estimated Wait</span>
              <span className="text-lg font-bold text-medical-600 dark:text-medical-400 font-['Outfit']">
                ~{estimatedWaitMin} min
              </span>
            </div>
          </div>

          {/* Navigation floor guide */}
          <div className="p-4 rounded-2xl bg-medical-50/60 dark:bg-medical-950/20 border border-medical-200/60 dark:border-medical-900/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-medical-900 dark:text-medical-300">
              <Navigation className="w-4 h-4 text-medical-600" />
              <span>Wayfinding Guide:</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {activeDeptInfo.floor}
            </p>
          </div>
        </div>

        {/* Live Queue Lineup Table (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-medical-600 dark:text-medical-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                  Upcoming Queue Progression ({selectedDept})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Avg. ~{activeDeptInfo.avgMin} min / patient
              </span>
            </div>

            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-750">
              {tokenLineup.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Queue is clear • No active patient tokens waiting in {selectedDept}.
                </div>
              ) : (
                tokenLineup.map((item, idx) => (
                  <div
                    key={item.tokenStr}
                    className={`py-3 px-3 rounded-xl flex items-center justify-between transition-colors ${
                      item.isMyToken
                        ? 'bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40'
                        : idx === 0
                        ? 'bg-medical-50/50 dark:bg-medical-950/20'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center text-xs font-mono font-bold text-slate-400">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                          {item.tokenStr}
                        </span>
                        {item.isMyToken && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                            Your Token
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Room {activeDeptInfo.room.split(' - ')[0]}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-semibold ${
                      idx === 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : idx === 1
                        ? 'text-medical-600 dark:text-medical-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {item.roleStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-medical-500" />
              <span>Tokens refresh automatically upon consultation completion.</span>
            </span>
            <span className="font-mono">Updated just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}
