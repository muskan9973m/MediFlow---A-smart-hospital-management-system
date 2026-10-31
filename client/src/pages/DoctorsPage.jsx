import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Search,
  Star,
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  HeartPulse,
  Brain,
  Bone,
  Baby,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  X,
  Phone
} from 'lucide-react';
import Badge from '../components/Badge';
import BookAppointmentModal from '../components/BookAppointmentModal';
import { MOCK_DOCTORS, MOCK_DEPARTMENTS } from '../data/mockData';
import { doctorAPI } from '../services/api';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState(MOCK_DOCTORS);
  const [departments, setDepartments] = useState(MOCK_DEPARTMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [preSelectedDoctor, setPreSelectedDoctor] = useState(null);
  const [profileDoctor, setProfileDoctor] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      doctorAPI.getAll().catch(() => null),
      doctorAPI.getDepartments().catch(() => null)
    ]).then(([docRes, deptRes]) => {
      if (docRes?.doctors?.length) setDoctors(docRes.doctors);
      if (deptRes?.departments?.length) setDepartments(deptRes.departments);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleBookWithDoctor = (doc) => {
    setPreSelectedDoctor(doc);
    setIsBookModalOpen(true);
  };

  const handleBookingSuccess = (newApt) => {
    showToast(`Appointment confirmed with ${newApt.doctorName}! Token: ${newApt.queueToken}`);
  };

  // Filtered doctors
  const filteredDoctors = doctors.filter((doc) => {
    const matchesDept =
      selectedDept === 'all'
        ? true
        : doc.department.toLowerCase() === selectedDept.toLowerCase();

    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.bio && doc.bio.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesDept && matchesSearch;
  });

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
              <Stethoscope className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-medical-600 dark:text-medical-400 uppercase tracking-wider">
              Clinical Medical Staff
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
            Specialist Physicians
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Meet our board-certified clinical specialists, review consultation hours, check patient satisfaction ratings, and reserve OPD consultation slots.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-750 border border-slate-200/70 dark:border-slate-700 text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Specialists</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              {MOCK_DOCTORS.length} on Duty
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-soft flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Department Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedDept('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              selectedDept === 'all'
                ? 'bg-medical-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Departments
          </button>
          {MOCK_DEPARTMENTS.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setSelectedDept(dept.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedDept === dept.name
                  ? 'bg-medical-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {dept.headImage && (
                <img
                  src={dept.headImage}
                  alt={dept.head}
                  className="w-4 h-4 rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <span>{dept.name}</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search physician or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-medical-500"
          />
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
          >
            <div>
              {/* Doctor Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md shrink-0">
                    <img
                      src={doc.image}
                      alt={doc.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden w-full h-full bg-gradient-to-tr from-medical-600 to-tealAccent-500 text-white items-center justify-center font-bold text-lg">
                      {doc.name.split(' ')[1]?.[0] || 'D'}
                      {doc.name.split(' ')[2]?.[0] || 'R'}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                      {doc.name}
                    </h3>
                    <p className="text-xs font-medium text-medical-600 dark:text-medical-400">
                      {doc.specialty}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-750 px-2 py-0.5 rounded-md">
                      {doc.department}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 px-2.5 py-1 rounded-xl text-amber-700 dark:text-amber-300">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold">{doc.rating}</span>
                  <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80">({doc.reviewsCount})</span>
                </div>
              </div>

              {/* Bio summary */}
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-4 line-clamp-2">
                {doc.bio}
              </p>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-2.5 my-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-750/70 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Experience</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {doc.experience}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Room Location</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {doc.room}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Consultation Duration</span>
                  <span className="font-semibold text-medical-600 dark:text-medical-400">
                    {doc.consultationDurationMin} min / patient
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">OPD Hours</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {doc.availableTime.split(' - ')[0]}
                  </span>
                </div>
              </div>

              {/* Available Days */}
              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                <span className="text-[10px] text-slate-400 mr-1 font-semibold uppercase">Days:</span>
                {doc.availableDays.map(day => (
                  <span
                    key={day}
                    className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-medical-50 dark:bg-medical-950/40 text-medical-700 dark:text-medical-300"
                  >
                    {day.slice(0, 3)}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-750">
              <button
                onClick={() => handleBookWithDoctor(doc)}
                className="flex-1 py-2.5 rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Consultation</span>
              </button>
              <button
                onClick={() => setProfileDoctor(doc)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold transition-colors"
              >
                Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Doctor Profile Drawer/Modal */}
      {profileDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-medical-600 to-tealAccent-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-lg">
                  {profileDoctor.name.split(' ')[1]?.[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold font-['Outfit']">{profileDoctor.name}</h3>
                  <p className="text-xs text-medical-100">{profileDoctor.specialty} • {profileDoctor.department}</p>
                </div>
              </div>
              <button
                onClick={() => setProfileDoctor(null)}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Physician Overview
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-750 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                  {profileDoctor.bio}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-750 rounded-xl border border-slate-200/60 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Clinical Experience</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{profileDoctor.experience}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-750 rounded-xl border border-slate-200/60 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Patient Rating</span>
                  <span className="font-bold text-amber-500 text-sm">★ {profileDoctor.rating} ({profileDoctor.reviewsCount} reviews)</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-750 rounded-xl border border-slate-200/60 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Room & Wing</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{profileDoctor.room}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-750 rounded-xl border border-slate-200/60 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Schedule Hours</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{profileDoctor.availableTime}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => {
                    const doc = profileDoctor;
                    setProfileDoctor(null);
                    handleBookWithDoctor(doc);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-semibold transition-colors"
                >
                  Book with {profileDoctor.name.split(',')[0]}
                </button>
                <button
                  onClick={() => setProfileDoctor(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => {
          setIsBookModalOpen(false);
          setPreSelectedDoctor(null);
        }}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  );
}
