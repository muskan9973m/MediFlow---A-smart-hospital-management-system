/**
 * MediFlow AI - Demonstration & Mock Data (Phase 1)
 * Clearly labeled fictional hospital and clinical records for development & academic presentation.
 */

import drSarah from '../assets/doctors/dr_sarah_jenkins.jpg';
import drMarcus from '../assets/doctors/dr_marcus_chen.jpg';
import drSophia from '../assets/doctors/dr_sophia_patel.jpg';
import drRachel from '../assets/doctors/dr_rachel_adams.jpg';
import drDavid from '../assets/doctors/dr_david_kim.jpg';
import drLiam from '../assets/doctors/dr_liam_walker.jpg';

export const DOCTOR_IMAGES = {
  doc_101: drSarah,
  doc_102: drMarcus,
  doc_103: drSophia,
  doc_104: drRachel,
  doc_105: drDavid,
  doc_106: drLiam
};

export const MOCK_USER = {
  id: "pat_9812",
  name: "Muskan Singh",
  email: "muskan.singh@example.com",
  role: "patient",
  phone: "+1 (555) 382-9014",
  bloodGroup: "O+",
  dob: "1996-08-14",
  address: "742 Evergreen Terrace, Springfield",
  emergencyContact: "Elena Singh (+1 555-0192)",
  memberSince: "Jan 2024"
};

export const MOCK_DEPARTMENTS = [
  { id: "dept_cardio", name: "Cardiology", icon: "HeartPulse", head: "Dr. Sarah Jenkins", headImage: drSarah, headSpecialty: "Cardiologist", totalDoctors: 6, room: "Wing B - 2nd Floor" },
  { id: "dept_neuro", name: "Neurology", icon: "Brain", head: "Dr. Marcus Chen", headImage: drMarcus, headSpecialty: "Neurologist", totalDoctors: 4, room: "Wing A - 3rd Floor" },
  { id: "dept_ortho", name: "Orthopedics", icon: "Bone", head: "Dr. Rachel Adams", headImage: drRachel, headSpecialty: "Orthopedic Surgeon", totalDoctors: 5, room: "Wing C - 1st Floor" },
  { id: "dept_ped", name: "Pediatrics", icon: "Baby", head: "Dr. David Kim", headImage: drDavid, headSpecialty: "Pediatrician", totalDoctors: 7, room: "Wing B - 1st Floor" },
  { id: "dept_gen", name: "General Medicine", icon: "Stethoscope", head: "Dr. Sophia Patel", headImage: drSophia, headSpecialty: "General Physician", totalDoctors: 9, room: "Main OPD - Ground" },
  { id: "dept_derma", name: "Dermatology", icon: "Sparkles", head: "Dr. Liam Walker", headImage: drLiam, headSpecialty: "Dermatologist", totalDoctors: 3, room: "Wing A - 2nd Floor" }
];

export const getDoctorImage = (doctor) => {
  if (!doctor) return drSophia;
  if (typeof doctor === 'string') {
    if (DOCTOR_IMAGES[doctor]) return DOCTOR_IMAGES[doctor];
    const lower = doctor.toLowerCase();
    if (lower.includes('jenkins') || lower.includes('sarah')) return drSarah;
    if (lower.includes('chen') || lower.includes('marcus')) return drMarcus;
    if (lower.includes('patel') || lower.includes('sophia')) return drSophia;
    if (lower.includes('adams') || lower.includes('rachel')) return drRachel;
    if (lower.includes('kim') || lower.includes('david')) return drDavid;
    if (lower.includes('walker') || lower.includes('liam')) return drLiam;
    if (lower.includes('cardio')) return drSarah;
    if (lower.includes('neuro')) return drMarcus;
    if (lower.includes('ortho')) return drRachel;
    if (lower.includes('ped')) return drDavid;
    if (lower.includes('derm')) return drLiam;
    if (doctor.startsWith('http') || doctor.startsWith('data:')) return doctor;
    return drSophia;
  }
  if (doctor.id && DOCTOR_IMAGES[doctor.id]) {
    return DOCTOR_IMAGES[doctor.id];
  }
  const nameLower = (doctor.name || doctor.doctorName || '').toLowerCase();
  if (nameLower.includes('jenkins') || nameLower.includes('sarah')) return drSarah;
  if (nameLower.includes('chen') || nameLower.includes('marcus')) return drMarcus;
  if (nameLower.includes('patel') || nameLower.includes('sophia')) return drSophia;
  if (nameLower.includes('adams') || nameLower.includes('rachel')) return drRachel;
  if (nameLower.includes('kim') || nameLower.includes('david')) return drDavid;
  if (nameLower.includes('walker') || nameLower.includes('liam')) return drLiam;

  if (doctor.image && typeof doctor.image === 'string' && doctor.image.trim().length > 1) {
    const imgLower = doctor.image.toLowerCase();
    if (imgLower.includes('jenkins') || imgLower.includes('sarah')) return drSarah;
    if (imgLower.includes('chen') || imgLower.includes('marcus')) return drMarcus;
    if (imgLower.includes('patel') || imgLower.includes('sophia')) return drSophia;
    if (imgLower.includes('adams') || imgLower.includes('rachel')) return drRachel;
    if (imgLower.includes('kim') || imgLower.includes('david')) return drDavid;
    if (imgLower.includes('walker') || imgLower.includes('liam')) return drLiam;
    return doctor.image;
  }

  const dept = (doctor.department || doctor.specialty || '').toLowerCase();
  if (dept.includes('cardio')) return drSarah;
  if (dept.includes('neuro')) return drMarcus;
  if (dept.includes('ortho')) return drRachel;
  if (dept.includes('ped')) return drDavid;
  if (dept.includes('derm')) return drLiam;

  return drSophia;
};

export const MOCK_DOCTORS = [
  {
    id: "doc_101",
    name: "Dr. Sarah Jenkins, MD",
    specialty: "Cardiologist",
    department: "Cardiology",
    experience: "14 years",
    rating: 4.9,
    reviewsCount: 184,
    consultationDurationMin: 20,
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableTime: "09:00 AM - 02:00 PM",
    room: "Room 204 - Wing B",
    bio: "Board-certified cardiologist specializing in preventive cardiology and heart rhythm disorders.",
    image: drSarah
  },
  {
    id: "doc_102",
    name: "Dr. Marcus Chen, MD, PhD",
    specialty: "Neurologist",
    department: "Neurology",
    experience: "11 years",
    rating: 4.8,
    reviewsCount: 142,
    consultationDurationMin: 25,
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    availableTime: "10:00 AM - 03:00 PM",
    room: "Room 312 - Wing A",
    bio: "Expert in neuro-diagnostics, migraines, and cognitive wellness therapy.",
    image: drMarcus
  },
  {
    id: "doc_103",
    name: "Dr. Sophia Patel, MBBS, MD",
    specialty: "General Physician",
    department: "General Medicine",
    experience: "9 years",
    rating: 4.9,
    reviewsCount: 310,
    consultationDurationMin: 15,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    availableTime: "08:30 AM - 01:30 PM",
    room: "OPD Desk 4",
    bio: "Primary care physician dedicated to routine check-ups and chronic symptom control.",
    image: drSophia
  },
  {
    id: "doc_104",
    name: "Dr. Rachel Adams, MS",
    specialty: "Orthopedic Surgeon",
    department: "Orthopedics",
    experience: "16 years",
    rating: 4.7,
    reviewsCount: 198,
    consultationDurationMin: 20,
    availableDays: ["Monday", "Wednesday", "Thursday"],
    availableTime: "11:00 AM - 04:00 PM",
    room: "Room 108 - Wing C",
    bio: "Specializes in joint restoration, sports injury rehabilitation, and bone trauma.",
    image: drRachel
  },
  {
    id: "doc_105",
    name: "Dr. David Kim, MD, FAAP",
    specialty: "Pediatrician",
    department: "Pediatrics",
    experience: "12 years",
    rating: 4.9,
    reviewsCount: 220,
    consultationDurationMin: 15,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Friday"],
    availableTime: "09:00 AM - 01:00 PM",
    room: "Room 102 - Wing B",
    bio: "Compassionate pediatrician committed to infant wellness, developmental screenings, and immunizations.",
    image: drDavid
  },
  {
    id: "doc_106",
    name: "Dr. Liam Walker, MD",
    specialty: "Dermatologist",
    department: "Dermatology",
    experience: "10 years",
    rating: 4.8,
    reviewsCount: 165,
    consultationDurationMin: 20,
    availableDays: ["Tuesday", "Wednesday", "Thursday"],
    availableTime: "10:30 AM - 03:30 PM",
    room: "Room 208 - Wing A",
    bio: "Specialist in dermatological treatments, acne therapies, mole evaluations, and skin allergy management.",
    image: drLiam
  }
];

export const MOCK_APPOINTMENTS = [];

export const MOCK_QUEUE = {
  currentServingToken: "None",
  patientToken: null,
  patientsAhead: 0,
  avgConsultationMin: 15,
  estimatedWaitMinutes: 0,
  department: "None",
  doctorName: "None",
  status: "idle",
  lastUpdated: "Just now"
};

export const MOCK_NOTIFICATIONS = [];

export const MOCK_FAQ_RESPONSES = [
  {
    keywords: ["timing", "hours", "open", "schedule"],
    answer: "MediFlow Hospital OPD operates Monday through Saturday, from 8:00 AM to 8:00 PM. The Emergency & Trauma Centre is available 24/7 with immediate critical triage."
  },
  {
    keywords: ["book", "appointment", "schedule", "how to book"],
    answer: "You can book an appointment directly from your Patient Dashboard by clicking the 'Book Appointment' button. Choose your desired department, select an available doctor, pick a convenient time slot, and confirm."
  },
  {
    keywords: ["queue", "waiting", "token", "track"],
    answer: "Our Live Queue tracker updates in real-time. When you have an appointment today, your unique Queue Token appears on the dashboard with the current serving token and estimated waiting time."
  },
  {
    keywords: ["emergency", "urgent", "ambulance", "serious"],
    answer: "⚠️ If you or someone nearby is experiencing a life-threatening medical emergency (chest pain, shortness of breath, severe trauma), please call your local emergency number (e.g. 911 / 112) or head immediately to our 24/7 Emergency Wing."
  },
  {
    keywords: ["cancel", "reschedule", "change"],
    answer: "You can reschedule or cancel an appointment up to 2 hours prior to the scheduled slot under the 'Recent Appointments' section in your dashboard."
  },
  {
    keywords: ["doctor", "specialist", "departments"],
    answer: "MediFlow hosts 6 specialized departments: Cardiology, Neurology, Orthopedics, Pediatrics, Dermatology, and General Medicine, led by board-certified physicians."
  }
];

export const MOCK_DOCTOR_QUEUE = [];

export const MOCK_PATIENT_RECORDS = {
  patientId: "pat_9812",
  fullName: "Muskan Singh",
  dob: "1996-08-14",
  age: 29,
  gender: "Female",
  bloodGroup: "O+",
  height: "--",
  weight: "--",
  bmi: "--",
  phone: "+91 98765 43210",
  email: "muskan.singh@example.com",
  emergencyContact: {
    name: "Elena Singh",
    relation: "Sister",
    phone: "+91 98765 00000"
  },
  allergies: [],
  chronicConditions: [],
  activeMedications: [],
  vitalsHistory: [],
  labReports: []
};

export const MOCK_ADMIN_ANALYTICS = {
  kpis: {
    totalPatientsToday: 248,
    activeConsultations: 18,
    avgWaitTimeMinutes: 22,
    bedOccupancyRate: 84, // percentage
    emergencyCasesToday: 14,
    doctorsOnDuty: 27
  },
  hourlyInflow: [
    { time: "08:00 AM", arrivals: 18, discharges: 4 },
    { time: "09:00 AM", arrivals: 34, discharges: 14 },
    { time: "10:00 AM", arrivals: 46, discharges: 28 },
    { time: "11:00 AM", arrivals: 52, discharges: 42 },
    { time: "12:00 PM", arrivals: 38, discharges: 45 },
    { time: "01:00 PM", arrivals: 22, discharges: 30 },
    { time: "02:00 PM", arrivals: 35, discharges: 26 },
    { time: "03:00 PM", arrivals: 41, discharges: 34 },
    { time: "04:00 PM", arrivals: 29, discharges: 38 }
  ],
  departmentStats: [
    { department: "Cardiology", currentQueue: 24, avgWait: 28, capacity: 35, doctorsActive: 5 },
    { department: "Neurology", currentQueue: 16, avgWait: 32, capacity: 25, doctorsActive: 3 },
    { department: "Orthopedics", currentQueue: 28, avgWait: 25, capacity: 30, doctorsActive: 4 },
    { department: "Pediatrics", currentQueue: 32, avgWait: 18, capacity: 40, doctorsActive: 6 },
    { department: "General Med", currentQueue: 48, avgWait: 15, capacity: 60, doctorsActive: 7 },
    { department: "Dermatology", currentQueue: 12, avgWait: 14, capacity: 20, doctorsActive: 2 }
  ],
  appointmentStatusBreakdown: [
    { name: "Completed", value: 142, color: "#10B981" },
    { name: "Confirmed / Waiting", value: 78, color: "#0EA5E9" },
    { name: "Pending Approval", value: 16, color: "#F59E0B" },
    { name: "Cancelled", value: 12, color: "#EF4444" }
  ],
  doctorRoster: [
    { name: "Dr. Sarah Jenkins", dept: "Cardiology", room: "Wing B - Room 204", status: "In Consultation", queue: 5 },
    { name: "Dr. Marcus Chen", dept: "Neurology", room: "Wing A - Room 312", status: "In Consultation", queue: 4 },
    { name: "Dr. Sophia Patel", dept: "General Medicine", room: "OPD Desk 4", status: "Available", queue: 2 },
    { name: "Dr. Rachel Adams", dept: "Orthopedics", room: "Wing C - Room 108", status: "On Break", queue: 6 },
    { name: "Dr. David Kim", dept: "Pediatrics", room: "Wing B - Room 102", status: "In Consultation", queue: 7 },
    { name: "Dr. Liam Walker", dept: "Dermatology", room: "Wing A - Room 208", status: "Available", queue: 3 }
  ]
};

export const MOCK_SYMPTOM_TRIAGE = [
  {
    id: "sym_ortho",
    pointLabel: "Knee / Joint stiffness & trauma",
    keywords: ["joint", "knee", "bone", "fracture", "back pain", "shoulder", "sprain", "swelling", "ligament", "orthopedic", "orthology"],
    urgency: "moderate",
    recommendation: "Orthopedics Department",
    primaryDept: "Orthopedics",
    doctorName: "Dr. Rachel Adams, MS",
    doctorSpecialty: "Orthopedic Surgeon",
    doctorImage: drRachel,
    doctorRoom: "Room 108 - Wing C",
    doctorRating: 4.7,
    guidance: "For chronic joint stiffness, sports injury recovery, bone trauma, or spinal alignment, consult Dr. Rachel Adams in Orthopedics. Digital X-Ray imaging is available in Wing C."
  },
  {
    id: "sym_neuro",
    pointLabel: "Migraine / Dizziness & Numbness",
    keywords: ["headache", "migraine", "dizziness", "numbness", "tingling", "vertigo", "seizure", "memory", "neurology", "neuro"],
    urgency: "moderate",
    recommendation: "Neurology Department",
    primaryDept: "Neurology",
    doctorName: "Dr. Marcus Chen, MD, PhD",
    doctorSpecialty: "Neurologist",
    doctorImage: drMarcus,
    doctorRoom: "Room 312 - Wing A",
    doctorRating: 4.8,
    guidance: "For recurrent migraines, visual auras, or peripheral tingling, a comprehensive neurological exam with Dr. Marcus Chen is recommended. Sudden severe thunderclap headache warrants immediate ER."
  },
  {
    id: "sym_chest",
    pointLabel: "Chest tightness / Palpitations",
    keywords: ["chest pain", "tightness", "palpitation", "heart", "shortness of breath", "angina", "cardiology"],
    urgency: "urgent",
    recommendation: "Emergency / Cardiology OPD",
    primaryDept: "Cardiology",
    doctorName: "Dr. Sarah Jenkins, MD",
    doctorSpecialty: "Cardiologist",
    doctorImage: drSarah,
    doctorRoom: "Room 204 - Wing B",
    doctorRating: 4.9,
    guidance: "⚠️ Sudden severe chest pressure or radiating pain requires IMMEDIATE 911 / Emergency Room triage. For mild or intermittent palpitations without distress, consult Dr. Sarah Jenkins in Cardiology."
  },
  {
    id: "sym_ped",
    pointLabel: "Child fever / Immunization",
    keywords: ["child", "infant", "toddler", "pediatric", "fever in kid", "vaccination", "baby", "pediatrics"],
    urgency: "moderate",
    recommendation: "Pediatrics Department",
    primaryDept: "Pediatrics",
    doctorName: "Dr. David Kim, MD, FAAP",
    doctorSpecialty: "Pediatrician",
    doctorImage: drDavid,
    doctorRoom: "Room 102 - Wing B",
    doctorRating: 4.9,
    guidance: "Dedicated pediatric wing with Dr. David Kim provides routine developmental screenings, child immunizations, and childhood acute fever management."
  },
  {
    id: "sym_general",
    pointLabel: "Persistent cough & general fatigue",
    keywords: ["fever", "cough", "cold", "flu", "fatigue", "routine", "annual checkup", "weakness", "general medicine"],
    urgency: "routine",
    recommendation: "General Medicine / Primary Care",
    primaryDept: "General Medicine",
    doctorName: "Dr. Sophia Patel, MBBS, MD",
    doctorSpecialty: "General Physician",
    doctorImage: drSophia,
    doctorRoom: "OPD Desk 4 - Ground",
    doctorRating: 4.9,
    guidance: "Dr. Sophia Patel performs comprehensive preventive checkups, routine diagnostics, viral care, and coordinates specialized referrals."
  },
  {
    id: "sym_derma",
    pointLabel: "Skin allergy / Rash & Acne",
    keywords: ["rash", "skin", "acne", "mole", "itching", "eczema", "allergy on skin", "dermatology"],
    urgency: "routine",
    recommendation: "Dermatology Department",
    primaryDept: "Dermatology",
    doctorName: "Dr. Liam Walker, MD",
    doctorSpecialty: "Dermatologist",
    doctorImage: drLiam,
    doctorRoom: "Room 208 - Wing A",
    doctorRating: 4.8,
    guidance: "Consult Dr. Liam Walker for diagnostic skin exams, mole evaluations, eczema management, and targeted clinical therapies."
  }
];

