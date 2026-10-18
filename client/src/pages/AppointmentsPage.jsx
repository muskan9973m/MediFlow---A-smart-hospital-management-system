import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Search,
  Plus,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  Stethoscope,
  X,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../components/Badge';
import BookAppointmentModal from '../components/BookAppointmentModal';
import { MOCK_APPOINTMENTS, MOCK_DEPARTMENTS, MOCK_USER } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI } from '../services/api';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modals for actions
  const [slipAppointment, setSlipAppointment] = useState(null);
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
  const [cancelAppointment, setCancelAppointment] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Form states for reschedule
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  const currentUser = user || MOCK_USER;

  // Load appointments from backend
  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await appointmentAPI.getAll();
      if (res?.appointments) {
        setAppointments(res.appointments);
      }
    } catch (err) {
      console.warn('Backend fetch appointments fallback to local:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleBookingSuccess = (newApt) => {
    setAppointments(prev => [newApt, ...prev]);
    showToast(`Appointment confirmed with ${newApt.doctorName}! Queue Token: ${newApt.queueToken}`);
    fetchAppointments();
  };

  const handleConfirmCancel = async () => {
    if (!cancelAppointment) return;
    try {
      await appointmentAPI.cancel(cancelAppointment.id);
    } catch (e) {
      console.warn('Failed remote cancel:', e);
    }
    setAppointments(prev =>
      prev.map(a => a.id === cancelAppointment.id ? { ...a, status: 'cancelled' } : a)
    );
    showToast(`Appointment ${cancelAppointment.refNumber} was cancelled.`);
    setCancelAppointment(null);
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleAppointment || !newDate || !newTime) return;
    try {
      await appointmentAPI.reschedule(rescheduleAppointment.id, { date: newDate, time: newTime });
    } catch (e) {
      console.warn('Failed remote reschedule:', e);
    }
    setAppointments(prev =>
      prev.map(a =>
        a.id === rescheduleAppointment.id
          ? { ...a, date: newDate, time: newTime, status: 'confirmed' }
          : a
      )
    );
    showToast(`Appointment ${rescheduleAppointment.refNumber} rescheduled to ${newDate} at ${newTime}.`);
    setRescheduleAppointment(null);
    setNewDate('');
    setNewTime('');
  };

  // Filtered Appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchesTab =
      activeTab === 'all'
        ? true
        : activeTab === 'upcoming'
        ? apt.status === 'confirmed' || apt.status === 'pending'
        : apt.status === activeTab;

    const matchesDept =
      selectedDept === 'all'
        ? true
        : apt.department.toLowerCase() === selectedDept.toLowerCase();

    const matchesSearch =
      apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.refNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.reason.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesDept && matchesSearch;
  });

  const totalCount = appointments.length;
  const upcomingCount = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-medical-50 dark:bg-medical-950/40 text-medical-600 dark:text-medical-400">
              <Calendar className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-medical-600 dark:text-medical-400 uppercase tracking-wider">
              Outpatient Department
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
            Consultation Appointments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            View upcoming clinical bookings, download digital entry tokens, reschedule visit slots, or book a new OPD consultation.
          </p>
        </div>

        <button
          onClick={() => setIsBookModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-medical-600 to-tealAccent-600 hover:from-medical-700 hover:to-tealAccent-700 text-white font-bold text-xs sm:text-sm shadow-card flex items-center justify-center gap-2 transition-all shrink-0 group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-soft">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Visits</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit'] mt-1">{totalCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-soft">
          <span className="text-[11px] text-amber-500 font-semibold uppercase">Upcoming / Pending</span>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-['Outfit'] mt-1">{upcomingCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-soft">
          <span className="text-[11px] text-emerald-500 font-semibold uppercase">Completed Visits</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-['Outfit'] mt-1">{completedCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-soft">
          <span className="text-[11px] text-rose-500 font-semibold uppercase">Cancelled</span>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-['Outfit'] mt-1">{cancelledCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-750 rounded-xl text-xs font-semibold">
          {[
            { id: 'all', label: `All (${totalCount})` },
            { id: 'upcoming', label: `Upcoming (${upcomingCount})` },
            { id: 'completed', label: `Completed (${completedCount})` },
            { id: 'cancelled', label: `Cancelled (${cancelledCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-850 text-medical-600 dark:text-medical-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Department Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Department Select */}
          <div className="relative w-full sm:w-44">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-medical-500"
            >
              <option value="all">All Departments</option>
              {MOCK_DEPARTMENTS.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search doctor, ref, reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-medical-500"
            />
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-700 shadow-soft">
            <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
              {appointments.length === 0 ? "No Appointments Scheduled Yet" : "No Appointments Found"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {appointments.length === 0
                ? "You haven't scheduled any consultations yet. Click below to book an appointment with any of our specialists."
                : "No bookings matched your filter criteria. Try adjusting the search keywords or status tab."}
            </p>
            {appointments.length === 0 ? (
              <button
                onClick={() => setIsBookModalOpen(true)}
                className="mt-4 px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-medical-600 to-tealAccent-600 text-white shadow-soft inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Book First Appointment</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setActiveTab('all');
                  setSelectedDept('all');
                  setSearchTerm('');
                }}
                className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-medical-50 dark:bg-medical-950/40 text-medical-600 dark:text-medical-400"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-700 shadow-soft hover:shadow-card transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left Doctor & Visit details */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge status={apt.status}>{apt.status}</Badge>
                    <span className="text-xs font-mono font-bold text-medical-600 dark:text-medical-400 bg-medical-50 dark:bg-medical-950/50 px-2.5 py-0.5 rounded-lg border border-medical-200/50 dark:border-medical-900/40">
                      Ref: {apt.refNumber}
                    </span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-lg border border-amber-200/50 dark:border-amber-900/40">
                      Token: {apt.queueToken}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                      {apt.doctorName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Stethoscope className="w-3.5 h-3.5 text-medical-500" />
                      <span>{apt.specialty} • {apt.department}</span>
                      <span className="mx-1">•</span>
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{apt.room}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-750 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 max-w-2xl">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Reason: </span>
                    {apt.reason}
                  </p>
                </div>

                {/* Right Date/Time and Action Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-700/60">
                  <div className="text-left lg:text-right">
                    <div className="flex items-center lg:justify-end gap-1.5 text-slate-900 dark:text-white font-bold text-sm">
                      <Calendar className="w-4 h-4 text-medical-500" />
                      <span>{apt.date}</span>
                    </div>
                    <div className="flex items-center lg:justify-end gap-1.5 text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{apt.time}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* View Digital Pass */}
                    <button
                      onClick={() => setSlipAppointment(apt)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="View printable digital OPD slip"
                    >
                      <FileText className="w-3.5 h-3.5 text-medical-500" />
                      <span>Token Slip</span>
                    </button>

                    {/* Live queue tracker quick jump */}
                    {(apt.status === 'confirmed' || apt.status === 'pending') && (
                      <Link
                        to="/dashboard/queue"
                        className="px-3 py-1.5 rounded-xl bg-medical-50 hover:bg-medical-100 dark:bg-medical-950/40 dark:hover:bg-medical-900/60 text-medical-600 dark:text-medical-400 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>Track Queue</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}

                    {/* Reschedule Button */}
                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => {
                          setRescheduleAppointment(apt);
                          setNewDate(apt.date);
                          setNewTime(apt.time);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                      >
                        Reschedule
                      </button>
                    )}

                    {/* Cancel Button */}
                    {(apt.status === 'confirmed' || apt.status === 'pending') && (
                      <button
                        onClick={() => setCancelAppointment(apt)}
                        className="px-3 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* Digital Token Slip Modal */}
      {slipAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-medical-600 to-tealAccent-600 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-medical-100">
                  MediFlow Outpatient Slip
                </span>
                <h3 className="text-xl font-bold font-['Outfit']">Digital OPD Pass</h3>
              </div>
              <button
                onClick={() => setSlipAppointment(null)}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center py-4 bg-slate-50 dark:bg-slate-750 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Official Queue Token
                </span>
                <span className="text-4xl font-extrabold text-medical-600 dark:text-medical-400 font-['Outfit'] block my-1">
                  {slipAppointment.queueToken}
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  Ref: {slipAppointment.refNumber}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-400">Patient:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser.name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-400">Physician:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{slipAppointment.doctorName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-400">Department:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{slipAppointment.department}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-400">Consultation Room:</span>
                  <span className="font-semibold text-medical-600 dark:text-medical-400">{slipAppointment.room}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-400">Schedule:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{slipAppointment.date} at {slipAppointment.time}</span>
                </div>
              </div>

              <div className="p-3 bg-medical-50 dark:bg-medical-950/40 rounded-xl text-[11px] text-medical-800 dark:text-medical-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-medical-600 shrink-0 mt-0.5" />
                <span>Please arrive 15 minutes before your time slot and monitor the OPD Live Queue screen.</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setSlipAppointment(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                Reschedule Consultation
              </h3>
              <button
                onClick={() => setRescheduleAppointment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a new date and available time slot for your appointment with {rescheduleAppointment.doctorName}.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Time Slot
                </label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-500"
                >
                  <option value="">Select slot</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:15 AM">10:15 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:15 PM">03:15 PM</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleConfirmReschedule}
                disabled={!newDate || !newTime}
                className="flex-1 py-2.5 rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-semibold text-xs transition-colors disabled:opacity-50"
              >
                Confirm Reschedule
              </button>
              <button
                onClick={() => setRescheduleAppointment(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                Cancel Appointment?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to cancel your consultation ({cancelAppointment.refNumber}) with {cancelAppointment.doctorName} on {cancelAppointment.date}?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors"
              >
                Yes, Cancel Booking
              </button>
              <button
                onClick={() => setCancelAppointment(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Keep Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
