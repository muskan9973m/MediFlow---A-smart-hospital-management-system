import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Stethoscope,
  Building2,
  Info,
  ChevronRight,
  MapPin,
  Sparkles
} from 'lucide-react';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import QueueLiveCard from '../components/QueueLiveCard';
import BookAppointmentModal from '../components/BookAppointmentModal';
import {
  MOCK_USER,
  MOCK_APPOINTMENTS,
  MOCK_QUEUE,
  MOCK_DEPARTMENTS,
  MOCK_DOCTORS
} from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI } from '../services/api';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [cancelModalAppointment, setCancelModalAppointment] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchAppointments = async () => {
    try {
      const res = await appointmentAPI.getAll();
      if (res?.appointments) {
        setAppointments(res.appointments);
      }
    } catch (e) {
      console.warn('PatientDashboard fetch appointments fallback:', e.message);
    }
  };

  React.useEffect(() => {
    fetchAppointments();
  }, [user]);

  const currentUser = user || MOCK_USER;

  // Calculate statistics
  const totalCount = appointments.length;
  const upcomingCount = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;

  // Find next upcoming appointment
  const nextAppointment = appointments.find(a => a.status === 'confirmed' || a.status === 'pending');

  const activeQueueData = React.useMemo(() => {
    if (!nextAppointment || !nextAppointment.queueToken) {
      return {
        currentServingToken: "None",
        patientToken: null,
        patientsAhead: 0,
        avgConsultationMin: 15,
        estimatedWaitMinutes: 0,
        department: "General OPD",
        doctorName: "No Active Booking",
        status: "idle",
        lastUpdated: "Just now"
      };
    }
    const deptPrefix = nextAppointment.queueToken.split('-')[0] || 'T';
    return {
      currentServingToken: `${deptPrefix}-01`,
      patientToken: nextAppointment.queueToken,
      patientsAhead: 2,
      avgConsultationMin: 15,
      estimatedWaitMinutes: 30,
      department: nextAppointment.department,
      doctorName: nextAppointment.doctorName,
      status: nextAppointment.status === 'confirmed' ? 'waiting' : nextAppointment.status,
      lastUpdated: "Just now"
    };
  }, [nextAppointment]);

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchesTab =
      activeTab === 'all'
        ? true
        : activeTab === 'upcoming'
        ? apt.status === 'confirmed' || apt.status === 'pending'
        : apt.status === activeTab;

    const matchesSearch =
      apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.refNumber.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Handle new appointment booked
  const handleBookingSuccess = (newApt) => {
    setAppointments(prev => [newApt, ...prev]);
    showToast(`Appointment confirmed with ${newApt.doctorName}! Queue token: ${newApt.queueToken}`);
  };

  // Handle appointment cancellation
  const handleConfirmCancel = () => {
    if (!cancelModalAppointment) return;
    setAppointments(prev =>
      prev.map(a =>
        a.id === cancelModalAppointment.id ? { ...a, status: 'cancelled' } : a
      )
    );
    showToast(`Appointment ${cancelModalAppointment.refNumber} cancelled successfully.`);
    setCancelModalAppointment(null);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
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

      {/* Top Banner & Quick Action */}
      <div className="bg-gradient-to-r from-medical-600 via-medical-700 to-navy-800 rounded-3xl p-6 sm:p-8 text-white shadow-soft relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Phase 1 Demonstration Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-['Outfit']">
              Welcome back, {currentUser.name}!
            </h1>
            <p className="text-xs sm:text-sm text-medical-100 max-w-xl">
              Track your OPD live queue token, view scheduled consultations, or book an appointment with our specialist physicians.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsBookModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-white text-medical-700 hover:bg-medical-50 font-bold text-xs sm:text-sm shadow-card flex items-center gap-2 transition-all group"
            >
              <Plus className="w-4 h-4 text-medical-600 group-hover:rotate-90 transition-transform" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>

        {/* Academic Demo Data Notice banner */}
        <div className="mt-6 pt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-2 text-[11px] text-medical-200">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>Demonstration Mode: Using synthetic patient clinical data for testing & evaluation.</span>
          </div>
          <span>Patient ID: {currentUser.id || "pat_9812"}</span>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Consultations"
          value={totalCount}
          subtitle="All recorded visits"
          icon={Calendar}
          color="blue"
          trend="+1 this month"
        />
        <StatCard
          title="Upcoming Slots"
          value={upcomingCount}
          subtitle="Active & pending"
          icon={Clock}
          color="amber"
          trend="Next: Oct 18"
        />
        <StatCard
          title="Completed"
          value={completedCount}
          subtitle="Prescription ready"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Cancelled"
          value={cancelledCount}
          subtitle="Rescheduled / revoked"
          icon={XCircle}
          color="rose"
        />
      </div>

      {/* Live Queue & Next Appointment Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Next Scheduled Appointment Card (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0B1324] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-medical-600 dark:text-medical-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                  Next Scheduled Appointment
                </h3>
              </div>
              {nextAppointment && (
                <Badge status={nextAppointment.status}>
                  {nextAppointment.status}
                </Badge>
              )}
            </div>

            {nextAppointment ? (
              <div className="mt-4 space-y-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Physician & Department
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                    {nextAppointment.doctorName}
                  </h4>
                  <p className="text-xs text-medical-600 dark:text-medical-400 font-medium">
                    {nextAppointment.specialty} • {nextAppointment.room}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-750 rounded-xl border border-slate-200/60 dark:border-slate-700 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Date</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {nextAppointment.date}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Time Slot</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {nextAppointment.time}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Reference</span>
                    <span className="font-semibold text-medical-600 dark:text-medical-400">
                      {nextAppointment.refNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Queue Token</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {nextAppointment.queueToken}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                    Reason for Consultation
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-750 p-2.5 rounded-lg border border-slate-200/40 dark:border-slate-700">
                    {nextAppointment.reason}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                No active appointments scheduled.
              </div>
            )}
          </div>

          {nextAppointment && nextAppointment.status === 'confirmed' && (
            <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3">
              <button
                onClick={() => setCancelModalAppointment(nextAppointment)}
                className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold transition-colors"
              >
                Cancel Appointment
              </button>
              <button
                onClick={() => setIsBookModalOpen(true)}
                className="text-xs text-medical-600 dark:text-medical-400 hover:underline font-semibold"
              >
                Reschedule Slot
              </button>
            </div>
          )}
        </div>

        {/* Live Queue Tracking Card (7 cols) */}
        <div className="lg:col-span-7">
          <QueueLiveCard queueData={activeQueueData} />
        </div>
      </div>

      {/* Appointment History & Filterable Table */}
      <div className="bg-white dark:bg-[#0B1324] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
              My Appointments History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review and manage your scheduled, completed, and past consultations.
            </p>
          </div>

          {/* Controls: Search and Status Tabs */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search doctor, ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-750 p-1 rounded-xl text-xs font-medium">
              {['all', 'upcoming', 'completed', 'cancelled'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                    activeTab === tab
                      ? 'bg-white dark:bg-slate-700 text-medical-600 dark:text-medical-400 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {filteredAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No appointments found
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                No consultations match your selected filter or search keyword.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-750/70 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Ref Number</th>
                  <th className="py-3.5 px-4">Doctor & Department</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Room</th>
                  <th className="py-3.5 px-4">Queue Token</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
                {filteredAppointments.map((apt) => (
                  <tr
                    key={apt.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-750/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-medical-600 dark:text-medical-400">
                      {apt.refNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {apt.doctorName}
                      </div>
                      <div className="text-[11px] text-slate-400">{apt.department}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">
                        {apt.date}
                      </div>
                      <div className="text-[11px] text-slate-400">{apt.time}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {apt.room}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-900/40">
                        {apt.queueToken}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={apt.status}>{apt.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {apt.status === 'confirmed' || apt.status === 'pending' ? (
                        <button
                          onClick={() => setCancelModalAppointment(apt)}
                          className="text-rose-600 hover:text-rose-700 dark:text-rose-400 font-medium hover:underline text-[11px]"
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Hospital Departments & Specialist Directory */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
              Clinical Departments & Specialist Roster
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Explore hospital wings and verify physician consultation schedules.
            </p>
          </div>
          <button
            onClick={() => setIsBookModalOpen(true)}
            className="text-xs text-medical-600 dark:text-medical-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Book with any specialist</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_DOCTORS.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-medical-600 dark:text-medical-400 bg-medical-50 dark:bg-medical-950/40 px-2 py-0.5 rounded-md">
                    {doc.department}
                  </span>
                  <span className="text-xs text-amber-500 font-bold">
                    ★ {doc.rating}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white font-['Outfit']">
                  {doc.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {doc.specialty} • {doc.experience}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                  {doc.bio}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span>Room: {doc.room}</span>
                  <span>{doc.consultationDurationMin}m / slot</span>
                </div>
                <button
                  onClick={() => setIsBookModalOpen(true)}
                  className="w-full py-2 rounded-xl bg-slate-50 hover:bg-medical-50 dark:bg-slate-750 dark:hover:bg-medical-950/40 text-medical-600 dark:text-medical-400 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold transition-colors"
                >
                  Book Consultation
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* Cancel Confirmation Dialog */}
      {cancelModalAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white text-center font-['Outfit']">
              Cancel Appointment?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-2">
              Are you sure you want to cancel appointment <span className="font-semibold text-slate-800 dark:text-slate-200">{cancelModalAppointment.refNumber}</span> with {cancelModalAppointment.doctorName}? Your queue token ({cancelModalAppointment.queueToken}) will be released.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setCancelModalAppointment(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-soft"
              >
                Yes, Cancel Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
