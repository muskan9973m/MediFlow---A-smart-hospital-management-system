import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Stethoscope, AlertCircle, CheckCircle2 } from 'lucide-react';
import { MOCK_DEPARTMENTS, MOCK_DOCTORS } from '../data/mockData';
import { appointmentAPI, doctorAPI } from '../services/api';

export default function BookAppointmentModal({ isOpen, onClose, onBookingSuccess }) {
  const [departments, setDepartments] = useState(MOCK_DEPARTMENTS);
  const [doctors, setDoctors] = useState(MOCK_DOCTORS);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // Fetch departments & doctors from backend
  useEffect(() => {
    if (isOpen) {
      doctorAPI.getDepartments()
        .then(res => { if (res?.departments?.length) setDepartments(res.departments); })
        .catch(() => {});
      doctorAPI.getAll()
        .then(res => { if (res?.doctors?.length) setDoctors(res.doctors); })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter doctors based on selected department
  const filteredDoctors = selectedDept
    ? doctors.filter(d => d.department.toLowerCase() === selectedDept.toLowerCase())
    : doctors;

  const availableSlots = [
    "09:00 AM", "09:30 AM", "10:15 AM", "11:00 AM",
    "11:45 AM", "02:00 PM", "02:45 PM", "03:30 PM"
  ];

  const validate = () => {
    const errs = {};
    if (!selectedDept) errs.dept = 'Please select a department';
    if (!selectedDoctor) errs.doctor = 'Please select a physician';
    if (!date) errs.date = 'Please pick a consultation date';
    if (!time) errs.time = 'Please select an available time slot';
    if (!reason.trim()) errs.reason = 'Please briefly state the visit reason';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const doc = filteredDoctors.find(d => d.id === selectedDoctor) || doctors.find(d => d.id === selectedDoctor);

    try {
      const res = await appointmentAPI.create({
        doctorId: doc?.id || selectedDoctor,
        doctorName: doc?.name || 'Dr. Assigned Specialist',
        specialty: doc?.specialty || selectedDept,
        department: doc?.department || selectedDept,
        date,
        time,
        reason,
        room: doc?.room || 'OPD Desk'
      });

      if (res?.appointment) {
        setIsSubmitting(false);
        setSuccessData(res.appointment);
        if (onBookingSuccess) onBookingSuccess(res.appointment);
        return;
      }
    } catch (err) {
      console.warn('Backend booking fallback to client generator:', err.message);
    }

    // Fallback if backend offline
    const randomRef = `MF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const prefix = selectedDept.charAt(0).toUpperCase();
    const randomToken = `${prefix}-${Math.floor(15 + Math.random() * 30)}`;

    const newAppointment = {
      id: `apt_${Date.now()}`,
      refNumber: randomRef,
      doctorId: doc?.id || "doc_101",
      doctorName: doc?.name || "Dr. Assigned",
      specialty: doc?.specialty || selectedDept,
      department: doc?.department || selectedDept,
      date,
      time,
      reason,
      status: "confirmed",
      room: doc?.room || "OPD Desk",
      queueToken: randomToken,
      createdDate: new Date().toISOString().split('T')[0]
    };

    setIsSubmitting(false);
    setSuccessData(newAppointment);
    if (onBookingSuccess) onBookingSuccess(newAppointment);
  };

  const handleResetAndClose = () => {
    setSuccessData(null);
    setSelectedDept('');
    setSelectedDoctor('');
    setDate('');
    setTime('');
    setReason('');
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-750/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-medical-50 dark:bg-medical-950/40 text-medical-600 dark:text-medical-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                Book Medical Appointment
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Phase 1 Demo — Live availability simulation
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {successData ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
                Appointment Confirmed!
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-sm mx-auto">
                Your consultation has been reserved. You can view your slot and live queue token on your dashboard.
              </p>

              <div className="mt-5 bg-slate-50 dark:bg-slate-750 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-left max-w-sm mx-auto space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Reference:</span>
                  <span className="font-semibold text-medical-600 dark:text-medical-400">{successData.refNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Doctor:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{successData.doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date & Time:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{successData.date} at {successData.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Queue Token:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{successData.queueToken}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-medium text-sm transition-colors shadow-soft"
                >
                  Done & Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department *
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => {
                    setSelectedDept(e.target.value);
                    setSelectedDoctor('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-750 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-medical-500"
                >
                  <option value="">Select Hospital Department</option>
                  {MOCK_DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name} ({dept.room})
                    </option>
                  ))}
                </select>
                {errors.dept && <p className="text-rose-500 text-xs mt-1">{errors.dept}</p>}
              </div>

              {/* Doctor */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Physician / Specialist *
                </label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-750 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-medical-500"
                >
                  <option value="">Select Doctor</option>
                  {filteredDoctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} — {doc.specialty} ({doc.room})
                    </option>
                  ))}
                </select>
                {errors.doctor && <p className="text-rose-500 text-xs mt-1">{errors.doctor}</p>}
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-750 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-medical-500"
                  />
                  {errors.date && <p className="text-rose-500 text-xs mt-1">{errors.date}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Time Slot *
                  </label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-750 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-medical-500"
                  >
                    <option value="">Choose slot</option>
                    {availableSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  {errors.time && <p className="text-rose-500 text-xs mt-1">{errors.time}</p>}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Visit / Symptoms *
                </label>
                <textarea
                  rows="2"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Mild chest tightness during exercise, routine checkup..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-750 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-medical-500"
                />
                {errors.reason && <p className="text-rose-500 text-xs mt-1">{errors.reason}</p>}
              </div>

              {/* Notice */}
              <div className="p-3 rounded-xl bg-medical-50/70 dark:bg-medical-950/30 border border-medical-200/50 flex gap-2 text-xs text-medical-800 dark:text-medical-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-medical-600 dark:text-medical-400" />
                <span>
                  A unique queue token will be generated automatically upon booking confirmation.
                </span>
              </div>

              {/* Action buttons */}
              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-medical-600 hover:bg-medical-700 text-white text-sm font-semibold shadow-soft hover:shadow-card transition-all disabled:opacity-60"
                >
                  {isSubmitting ? 'Verifying & Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
