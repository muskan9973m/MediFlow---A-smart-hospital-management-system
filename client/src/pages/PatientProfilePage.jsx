import React, { useState, useEffect } from 'react';
import {
  User,
  HeartPulse,
  AlertTriangle,
  Pill,
  FileText,
  Activity,
  Edit2,
  Check,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  Printer,
  Plus,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import Badge from '../components/Badge';
import { MOCK_PATIENT_RECORDS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { patientAPI } from '../services/api';

export default function PatientProfilePage() {
  const { user, updateProfile } = useAuth();
  const [records, setRecords] = useState({
    ...MOCK_PATIENT_RECORDS,
    allergies: [],
    chronicConditions: [],
    activeMedications: [],
    vitalsHistory: [],
    labReports: []
  });

  const [isEditingContact, setIsEditingContact] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    address: '742 Evergreen Terrace, Springfield',
    emergencyPhone: '+91 98765 00000',
    emergencyName: 'Elena Singh',
    bloodGroup: 'O+',
    height: '--',
    weight: '--'
  });

  const [toastMessage, setToastMessage] = useState(null);

  // Modals for adding records
  const [isAddVitalsOpen, setIsAddVitalsOpen] = useState(false);
  const [isAddAllergyOpen, setIsAddAllergyOpen] = useState(false);
  const [isAddMedOpen, setIsAddMedOpen] = useState(false);

  // Form states
  const [vitalsInput, setVitalsInput] = useState({ bp: '120/80', heartRate: '72 bpm', spo2: '99%', weight: '68 kg' });
  const [allergyInput, setAllergyInput] = useState({ allergen: '', severity: 'Moderate', reaction: '' });
  const [medInput, setMedInput] = useState({ name: '', dosage: '', frequency: 'Once daily', prescribedFor: '', doctor: 'Self/Prescribed' });

  useEffect(() => {
    patientAPI.getRecords()
      .then(res => {
        if (res?.record) {
          setRecords(res.record);
          setFormData({
            phone: res.record.phone || user?.phone || '+91 98765 43210',
            address: user?.address || '742 Evergreen Terrace, Springfield',
            emergencyPhone: res.record.emergencyContact?.phone || '+91 98765 00000',
            emergencyName: res.record.emergencyContact?.name || 'Elena Singh',
            bloodGroup: res.record.bloodGroup || user?.bloodGroup || 'O+',
            height: res.record.height || '--',
            weight: res.record.weight || '--'
          });
        }
      })
      .catch(() => {});
  }, [user]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveContact = async () => {
    try {
      if (updateProfile) {
        await updateProfile({
          phone: formData.phone,
          address: formData.address,
          emergencyContact: `${formData.emergencyName} (${formData.emergencyPhone})`
        });
      }
      if (patientAPI.updateRecord) {
        await patientAPI.updateRecord({
          phone: formData.phone,
          bloodGroup: formData.bloodGroup,
          height: formData.height,
          weight: formData.weight,
          emergencyContact: {
            name: formData.emergencyName,
            relation: 'Emergency Contact',
            phone: formData.emergencyPhone
          }
        });
      }
    } catch (e) {
      console.warn('Failed profile update:', e);
    }

    setRecords(prev => ({
      ...prev,
      phone: formData.phone,
      bloodGroup: formData.bloodGroup,
      height: formData.height,
      weight: formData.weight,
      emergencyContact: {
        ...prev.emergencyContact,
        name: formData.emergencyName,
        phone: formData.emergencyPhone
      }
    }));
    setIsEditingContact(false);
    showToast('Contact and demographic details successfully updated.');
  };

  const handleAddVitals = async (e) => {
    e.preventDefault();
    try {
      const res = await patientAPI.addVitals(vitalsInput);
      if (res?.record) {
        setRecords(res.record);
      } else {
        const newV = {
          date: new Date().toISOString().split('T')[0],
          ...vitalsInput
        };
        setRecords(prev => ({
          ...prev,
          vitalsHistory: [newV, ...(prev.vitalsHistory || [])]
        }));
      }
      setIsAddVitalsOpen(false);
      showToast('New clinical vitals recorded successfully.');
    } catch (err) {
      showToast('Failed to save vitals.');
    }
  };

  const handleAddAllergy = async (e) => {
    e.preventDefault();
    if (!allergyInput.allergen.trim()) return;

    const newAllergy = { ...allergyInput };
    const updatedAllergies = [...(records.allergies || []), newAllergy];

    try {
      if (patientAPI.updateRecord) {
        await patientAPI.updateRecord({ allergies: updatedAllergies });
      }
    } catch (err) {}

    setRecords(prev => ({ ...prev, allergies: updatedAllergies }));
    setAllergyInput({ allergen: '', severity: 'Moderate', reaction: '' });
    setIsAddAllergyOpen(false);
    showToast(`Allergy to ${newAllergy.allergen} added to profile.`);
  };

  const handleAddMedication = async (e) => {
    e.preventDefault();
    if (!medInput.name.trim()) return;

    const newMed = { ...medInput };
    const updatedMeds = [...(records.activeMedications || []), newMed];

    try {
      if (patientAPI.updateRecord) {
        await patientAPI.updateRecord({ activeMedications: updatedMeds });
      }
    } catch (err) {}

    setRecords(prev => ({ ...prev, activeMedications: updatedMeds }));
    setMedInput({ name: '', dosage: '', frequency: 'Once daily', prescribedFor: '', doctor: 'Self/Prescribed' });
    setIsAddMedOpen(false);
    showToast(`Prescription for ${newMed.name} added.`);
  };

  const severeAllergy = (records.allergies || []).find(a =>
    a.severity?.toLowerCase().includes('severe') ||
    a.severity?.toLowerCase().includes('anaphylaxis') ||
    a.severity?.toLowerCase().includes('critical')
  );

  const displayName = user?.name || records.fullName || 'Muskan Singh';
  const displayId = user?.id || records.patientId || 'pat_9812';
  const displayEmail = user?.email || records.email || 'muskan.singh@example.com';
  const displayBlood = records.bloodGroup || formData.bloodGroup || 'O+';

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
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-medical-600 via-tealAccent-500 to-navy-700 text-white flex items-center justify-center font-extrabold text-xl shadow-card">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                {displayName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300">
                Blood: {displayBlood}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Patient ID: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{displayId}</span> • Age: {records.age || 29} • Gender: {records.gender || 'Female'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-750 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-medical-500" />
            <span>Print Passport</span>
          </button>
        </div>
      </div>

      {/* Emergency Medical ICE Alert Card */}
      {severeAllergy ? (
        <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 rounded-3xl p-6 text-white shadow-card relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-2xl bg-white/20 backdrop-blur-sm shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-100">
                  IN CASE OF EMERGENCY (ICE) QUICK ACCESS
                </span>
                <h3 className="text-lg font-bold font-['Outfit'] mt-0.5">
                  Critical Drug Allergy: {severeAllergy.allergen} ({severeAllergy.severity})
                </h3>
                <p className="text-xs text-rose-100 mt-1">
                  Reaction: {severeAllergy.reaction || 'Severe adverse event'} • Contact: <strong>{formData.emergencyName}</strong> ({formData.emergencyPhone})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl self-start sm:self-auto text-xs font-mono font-bold">
              <span>Blood Group: {displayBlood}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-medical-700 rounded-3xl p-6 text-white shadow-card relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-2xl bg-white/20 backdrop-blur-sm shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-100">
                  IN CASE OF EMERGENCY (ICE) STATUS: CLEAR
                </span>
                <h3 className="text-lg font-bold font-['Outfit'] mt-0.5">
                  No Critical Drug Allergies Flagged
                </h3>
                <p className="text-xs text-teal-100 mt-1">
                  Medical Record Active • ICE Contact: <strong>{formData.emergencyName}</strong> • {formData.emergencyPhone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl self-start sm:self-auto text-xs font-mono font-bold">
              <span>Blood Group: {displayBlood}</span>
            </div>
          </div>
        </div>
      )}

      {/* Personal Info & Allergies/Conditions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Contact & Demographics (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-medical-600 dark:text-medical-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                Contact & Clinical Metrics
              </h3>
            </div>
            {!isEditingContact ? (
              <button
                onClick={() => setIsEditingContact(true)}
                className="text-xs text-medical-600 dark:text-medical-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleSaveContact}
                  className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  title="Save"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsEditingContact(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Mobile Phone</span>
              {isEditingContact ? (
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 text-slate-800 dark:text-slate-200"
                />
              ) : (
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formData.phone || 'Not provided'}</span>
              )}
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">Email Address</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{displayEmail}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">Primary Address</span>
              {isEditingContact ? (
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 text-slate-800 dark:text-slate-200"
                />
              ) : (
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formData.address}</span>
              )}
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">Emergency Contact</span>
              {isEditingContact ? (
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <input
                    type="text"
                    value={formData.emergencyName}
                    onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                    placeholder="Contact Name"
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs"
                  />
                  <input
                    type="text"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    placeholder="Contact Phone"
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs"
                  />
                </div>
              ) : (
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formData.emergencyName} • {formData.emergencyPhone}
                </span>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-700 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-750 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Height</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{records.height || formData.height}</span>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-750 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Weight</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{records.weight || formData.weight}</span>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-750 rounded-xl">
              <span className="text-[10px] text-slate-400 block">BMI</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{records.bmi || '--'}</span>
            </div>
          </div>
        </div>

        {/* Allergies & Chronic Conditions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Allergies Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-soft">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                  Allergies & Adverse Reactions
                </h3>
              </div>
              <button
                onClick={() => setIsAddAllergyOpen(true)}
                className="text-xs text-medical-600 dark:text-medical-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Allergy
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {records.allergies && records.allergies.length > 0 ? (
                records.allergies.map((all, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-rose-900 dark:text-rose-200">{all.allergen}</span>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">Reaction: {all.reaction || 'Not specified'}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-200 shrink-0">
                      {all.severity}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-750/50 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-1">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No drug allergies recorded</p>
                  <p className="text-[11px] text-slate-400">Clinical profile indicates no known adverse medication reactions.</p>
                </div>
              )}
            </div>
          </div>

          {/* Chronic Conditions & Active Medications */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-soft">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-medical-600 dark:text-medical-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                  Active Prescriptions & Regimens
                </h3>
              </div>
              <button
                onClick={() => setIsAddMedOpen(true)}
                className="text-xs text-medical-600 dark:text-medical-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Medication
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {records.activeMedications && records.activeMedications.length > 0 ? (
                records.activeMedications.map((med, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-750 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{med.name}</span>
                        {med.dosage && (
                          <span className="text-[10px] font-semibold text-medical-600 dark:text-medical-400 bg-medical-50 dark:bg-medical-950/40 px-2 py-0.5 rounded-md">
                            {med.dosage}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                        {med.frequency} {med.prescribedFor && `• For: ${med.prescribedFor}`}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400">{med.doctor}</span>
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-750/50 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-1">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No active prescriptions</p>
                  <p className="text-[11px] text-slate-400">Medications prescribed during doctor consultations will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vitals History & Lab Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Vitals History (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-soft">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                Clinical Vitals History
              </h3>
            </div>
            <button
              onClick={() => setIsAddVitalsOpen(true)}
              className="text-xs text-medical-600 dark:text-medical-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Log Vitals
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-750">
            {records.vitalsHistory && records.vitalsHistory.length > 0 ? (
              records.vitalsHistory.map((v, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{v.date}</span>
                    <span className="text-[11px] text-slate-400">Weight: {v.weight}</span>
                  </div>
                  <div className="text-right space-y-0.5">
                    <div className="font-mono font-bold text-slate-900 dark:text-white">BP: {v.bp}</div>
                    <div className="text-[11px] text-slate-400">HR: {v.heartRate} • SpO2: {v.spo2}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-750/50 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-1">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No vitals history recorded</p>
                <p className="text-[11px] text-slate-400">Log your BP and heart rate above or during your next OPD consultation.</p>
              </div>
            )}
          </div>
        </div>

        {/* Diagnostic Lab Reports (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-soft">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
            <FileText className="w-4 h-4 text-medical-600 dark:text-medical-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
              Diagnostic Lab & Pathology Records
            </h3>
          </div>

          <div className="mt-4 space-y-3.5">
            {records.labReports && records.labReports.length > 0 ? (
              records.labReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-750 border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white">{report.title}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      {report.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>{report.date}</span>
                    <span>•</span>
                    <span>{report.department}</span>
                    <span>•</span>
                    <span>Ordered by: {report.doctor}</span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                    {report.results}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-750/50 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-1">
                <FileText className="w-8 h-8 text-slate-400 mx-auto stroke-1" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No diagnostic reports uploaded yet</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Diagnostic pathology tests, blood panels, and radiology ordered during your specialist OPD appointments will be published here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Vitals Modal */}
      {isAddVitalsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" /> Log Clinical Vitals
              </h3>
              <button onClick={() => setIsAddVitalsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddVitals} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-500 block mb-1">Blood Pressure (BP)</label>
                <input
                  type="text"
                  placeholder="e.g. 120/80"
                  value={vitalsInput.bp}
                  onChange={e => setVitalsInput({ ...vitalsInput, bp: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 block mb-1">Heart Rate (HR)</label>
                  <input
                    type="text"
                    placeholder="e.g. 72 bpm"
                    value={vitalsInput.heartRate}
                    onChange={e => setVitalsInput({ ...vitalsInput, heartRate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Oxygen (SpO2)</label>
                  <input
                    type="text"
                    placeholder="e.g. 99%"
                    value={vitalsInput.spo2}
                    onChange={e => setVitalsInput({ ...vitalsInput, spo2: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-500 block mb-1">Weight</label>
                <input
                  type="text"
                  placeholder="e.g. 68 kg"
                  value={vitalsInput.weight}
                  onChange={e => setVitalsInput({ ...vitalsInput, weight: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 text-slate-800 dark:text-slate-200"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddVitalsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-semibold"
                >
                  Save Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Allergy Modal */}
      {isAddAllergyOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" /> Record Drug Allergy
              </h3>
              <button onClick={() => setIsAddAllergyOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddAllergy} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-500 block mb-1">Allergen / Drug Name</label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Aspirin, Pollen"
                  value={allergyInput.allergen}
                  onChange={e => setAllergyInput({ ...allergyInput, allergen: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
              <div>
                <label className="text-slate-500 block mb-1">Severity</label>
                <select
                  value={allergyInput.severity}
                  onChange={e => setAllergyInput({ ...allergyInput, severity: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 text-slate-800 dark:text-slate-200"
                >
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe (Anaphylaxis risk)">Severe (Anaphylaxis risk)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-500 block mb-1">Adverse Reaction Details</label>
                <input
                  type="text"
                  placeholder="e.g. Rash, facial swelling, breathing difficulty"
                  value={allergyInput.reaction}
                  onChange={e => setAllergyInput({ ...allergyInput, reaction: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 text-slate-800 dark:text-slate-200"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAllergyOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                >
                  Record Allergy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Medication Modal */}
      {isAddMedOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Pill className="w-4 h-4 text-medical-600" /> Add Prescription Medication
              </h3>
              <button onClick={() => setIsAddMedOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddMedication} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-500 block mb-1">Medication Name</label>
                <input
                  type="text"
                  placeholder="e.g. Paracetamol, Amoxicillin"
                  value={medInput.name}
                  onChange={e => setMedInput({ ...medInput, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 block mb-1">Dosage</label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg, 10ml"
                    value={medInput.dosage}
                    onChange={e => setMedInput({ ...medInput, dosage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Frequency</label>
                  <input
                    type="text"
                    placeholder="e.g. Twice daily, As needed"
                    value={medInput.frequency}
                    onChange={e => setMedInput({ ...medInput, frequency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-500 block mb-1">Prescribed For / Indication</label>
                <input
                  type="text"
                  placeholder="e.g. Fever, joint pain, seasonal allergy"
                  value={medInput.prescribedFor}
                  onChange={e => setMedInput({ ...medInput, prescribedFor: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 text-slate-800 dark:text-slate-200"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMedOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-semibold"
                >
                  Add Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
