import React, { useState, useEffect } from 'react';
import { Users, Clock, Radio, Activity, RefreshCw, CheckCircle2 } from 'lucide-react';
import Badge from './Badge';
import { useAuth } from '../context/AuthContext';

export default function QueueLiveCard({ queueData: initialData }) {
  const { user } = useAuth();
  const [queue, setQueue] = useState(initialData);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (initialData) {
      setQueue(initialData);
    }
  }, [initialData]);

  // Simulation feature for demonstration: simulates the doctor calling next token
  const simulateNextToken = () => {
    if (!prevServingHasToken(queue.currentServingToken)) return;
    setIsSimulating(true);
    setTimeout(() => {
      setQueue(prev => {
        if (!prev.currentServingToken || prev.currentServingToken === 'None') return prev;
        const prefix = prev.currentServingToken.split('-')[0];
        const num = parseInt(prev.currentServingToken.split('-')[1], 10) || 1;
        const nextNum = num + 1;
        const newServing = `${prefix}-${nextNum.toString().padStart(2, '0')}`;
        
        const patNum = prev.patientToken ? parseInt(prev.patientToken.split('-')[1], 10) || 0 : 0;
        const newAhead = Math.max(0, patNum - nextNum);
        const newWait = newAhead * (prev.avgConsultationMin || 15);
        
        let newStatus = prev.status;
        if (newAhead === 0 && prev.patientToken) newStatus = 'called';
        if (newAhead < 0 && prev.patientToken) newStatus = 'in_consultation';

        return {
          ...prev,
          currentServingToken: newServing,
          patientsAhead: newAhead,
          estimatedWaitMinutes: newWait,
          status: newStatus,
          lastUpdated: 'Just now'
        };
      });
      setIsSimulating(false);
    }, 400);
  };

  const prevServingHasToken = (token) => token && token !== 'None' && token.includes('-');

  const getStatusBadge = () => {
    if (!queue.patientToken || queue.patientToken === 'None') {
      return <Badge status="pending">No Active Token</Badge>;
    }
    switch (queue.status) {
      case 'called':
        return <Badge status="called">It's Your Turn! Please proceed to Consultation</Badge>;
      case 'in_consultation':
        return <Badge status="in_consultation">In Consultation</Badge>;
      default:
        return <Badge status="waiting">Waiting in Queue</Badge>;
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 dark:from-[#0B1324] dark:to-[#0F172A] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-soft relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-medical-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-medical-50 dark:bg-medical-950/40 text-medical-600 dark:text-medical-400 border border-medical-200/50">
            <Radio className="w-5 h-5 animate-pulse text-medical-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                Live Queue Tracker
              </h3>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {queue.department} • {queue.doctorName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <button
            onClick={simulateNextToken}
            disabled={isSimulating || queue.patientsAhead <= 0}
            className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50"
            title="Demonstration feature: simulate queue progression"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>Call Next (Demo)</span>
          </button>
        </div>
      </div>

      {/* Main Queue Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 my-4">
        {/* Current Serving */}
        <div className="bg-slate-50 dark:bg-slate-750/70 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-700/60 text-center">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Now Serving
          </span>
          <span className="text-2xl font-extrabold text-medical-600 dark:text-medical-400 font-['Outfit'] mt-1 block">
            {queue.currentServingToken}
          </span>
          <span className="text-[10px] text-slate-400">Room 204</span>
        </div>

        {/* Your Token */}
        <div className="bg-medical-50/60 dark:bg-medical-950/30 p-3.5 rounded-xl border border-medical-200/80 dark:border-medical-800/60 text-center">
          <span className="text-[11px] font-medium text-medical-700 dark:text-medical-300 uppercase tracking-wider block">
            Your Token
          </span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-1 block">
            {queue.patientToken || 'None'}
          </span>
          <span className="text-[10px] text-medical-600 dark:text-medical-400 font-medium">{user?.name || 'You'}</span>
        </div>

        {/* Patients Ahead */}
        <div className="bg-slate-50 dark:bg-slate-750/70 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-700/60 text-center">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Patients Ahead
          </span>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
              {queue.patientsAhead}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">in waiting lounge</span>
        </div>

        {/* Est. Wait Time */}
        <div className="bg-slate-50 dark:bg-slate-750/70 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-700/60 text-center">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Est. Wait Time
          </span>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-['Outfit']">
              {queue.estimatedWaitMinutes}m
            </span>
          </div>
          <span className="text-[10px] text-slate-400">~{queue.avgConsultationMin} min / patient</span>
        </div>
      </div>

      {/* Progress tracker bar */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/80">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
          <span>Queue Position</span>
          <span>{queue.patientsAhead === 0 ? "You're up next!" : `${queue.patientsAhead} ahead • Est. ${queue.estimatedWaitMinutes} mins remaining`}</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-medical-500 to-tealAccent-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(15, 100 - queue.patientsAhead * 25))}%` }}
          />
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <span>Formula: Patients Ahead × Avg. Consultation ({queue.avgConsultationMin} mins)</span>
          <span>Updated: {queue.lastUpdated}</span>
        </div>
      </div>
    </div>
  );
}
