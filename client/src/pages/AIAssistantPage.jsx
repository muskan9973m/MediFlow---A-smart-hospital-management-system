import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  Building2,
  Clock,
  Radio,
  FileQuestion,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  User,
  HeartPulse,
  Star,
  MapPin,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MOCK_FAQ_RESPONSES, MOCK_SYMPTOM_TRIAGE } from '../data/mockData';
import { aiAPI } from '../services/api';

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    {
      id: "msg_init",
      sender: "bot",
      text: "Hello! I am MediFlow AI, your clinical guide and hospital operations assistant. I can assist you with department recommendations, physician schedules, OPD queue tracking, or appointment preparation. How may I help you today?",
      time: "Just now"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState(MOCK_SYMPTOM_TRIAGE[0]);
  const chatEndRef = useRef(null);

  const suggestedQuestions = [
    "What are OPD hospital timings?",
    "How do I fast for blood lab tests?",
    "How does the live queue tracker work?",
    "Where is the Cardiology department located?",
    "How can I reschedule my appointment?"
  ];

  const quickSymptoms = [
    {
      id: "sym_ortho",
      label: "Knee / Joint stiffness",
      subLabel: "Sports injury, joint pain & bone trauma",
      dept: "Orthopedics",
      doctorName: "Dr. Rachel Adams, MS",
      specialty: "Orthopedic Surgeon",
      image: "/doctors/dr_rachel_adams.jpg"
    },
    {
      id: "sym_neuro",
      label: "Migraine / Dizziness",
      subLabel: "Frequent headaches, vertigo & nerve tingling",
      dept: "Neurology",
      doctorName: "Dr. Marcus Chen, MD, PhD",
      specialty: "Neurologist",
      image: "/doctors/dr_marcus_chen.jpg"
    },
    {
      id: "sym_chest",
      label: "Chest tightness / Heart",
      subLabel: "Palpitations, blood pressure & ECG",
      dept: "Cardiology",
      doctorName: "Dr. Sarah Jenkins, MD",
      specialty: "Cardiologist",
      image: "/doctors/dr_sarah_jenkins.jpg"
    },
    {
      id: "sym_ped",
      label: "Child fever / Vaccine",
      subLabel: "Pediatric checkups & infant immunizations",
      dept: "Pediatrics",
      doctorName: "Dr. David Kim, MD",
      specialty: "Pediatrician",
      image: "/doctors/dr_david_kim.jpg"
    },
    {
      id: "sym_general",
      label: "Cough & general fatigue",
      subLabel: "Routine health checkup & fever care",
      dept: "General Medicine",
      doctorName: "Dr. Sophia Patel, MBBS",
      specialty: "General Physician",
      image: "/doctors/dr_sophia_patel.jpg"
    },
    {
      id: "sym_derma",
      label: "Skin allergy / Rash",
      subLabel: "Acne, eczema, moles & topical therapies",
      dept: "Dermatology",
      doctorName: "Dr. Liam Walker, MD",
      specialty: "Dermatologist",
      image: "/doctors/dr_liam_walker.jpg"
    }
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const res = await aiAPI.chatAssistant(query);
      if (res?.answer) {
        const botReply = {
          id: `bot_${Date.now()}`,
          sender: "bot",
          text: res.answer,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botReply]);
        setIsTyping(false);
        return;
      }
    } catch (err) {
      console.warn('Backend AI chat fallback to local rules:', err.message);
    }

    // Fallback if offline
    setTimeout(() => {
      const lower = query.toLowerCase();
      let matchedResponse = null;

      let matchedDoctor = null;

      if (
        lower.includes("emergency") ||
        lower.includes("chest pain") ||
        lower.includes("unconscious") ||
        lower.includes("severe bleed") ||
        lower.includes("stroke")
      ) {
        matchedResponse = "⚠️ CRITICAL MEDICAL ALERT: The symptoms you described may indicate a life-threatening acute condition. Do not wait for an online response. Immediately dial emergency services (911/112) or head to MediFlow 24/7 Emergency & Trauma Centre at Main Gate 1.";
      } else if (lower.includes("fasting") || lower.includes("lipid") || lower.includes("blood test")) {
        matchedResponse = "For fasting blood tests (such as Lipid Profiles or Fasting Blood Glucose), water is permitted, but please refrain from food and sweetened beverages for 10-12 hours prior to your lab visit in Wing A - Ground Floor.";
      } else {
        for (const item of MOCK_FAQ_RESPONSES) {
          if (item.keywords.some(k => lower.includes(k))) {
            matchedResponse = item.answer;
            break;
          }
        }

        // Symptom Triage & Specialist Match
        if (!matchedResponse) {
          for (const rule of MOCK_SYMPTOM_TRIAGE) {
            if (rule.keywords.some(k => lower.includes(k.toLowerCase()))) {
              matchedResponse = `🩺 Clinical Recommendation: Your symptoms indicate an evaluation in ${rule.primaryDept}. We recommend scheduling an appointment with ${rule.doctorName} (${rule.doctorSpecialty}) in ${rule.doctorRoom}. ${rule.guidance}`;
              matchedDoctor = {
                name: rule.doctorName,
                specialty: rule.doctorSpecialty,
                image: rule.doctorImage,
                dept: rule.primaryDept,
                room: rule.doctorRoom,
                rating: rule.doctorRating
              };
              break;
            }
          }
        }
      }

      if (!matchedResponse) {
        matchedResponse = "Thank you for asking. For specific clinical evaluations, I recommend booking an OPD slot with one of our specialists. You can also view live doctor schedules in the Specialists section.";
      }

      const botReply = {
        id: `bot_${Date.now()}`,
        sender: "bot",
        text: matchedResponse,
        doctor: matchedDoctor,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botReply]);
      setIsTyping(false);
    }, 450);
  };

  const handleSelectSymptom = (symptomId) => {
    const item = MOCK_SYMPTOM_TRIAGE.find(s => s.id === symptomId) || MOCK_SYMPTOM_TRIAGE[0];
    setSelectedSymptom(item);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg_init_${Date.now()}`,
        sender: "bot",
        text: "Conversation refreshed. How can I assist you with clinical departments or hospital operations?",
        time: "Just now"
      }
    ]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-medical-50 dark:bg-medical-950/40 text-medical-600 dark:text-medical-400">
              <Bot className="w-4 h-4 text-medical-500" />
            </span>
            <span className="text-xs font-semibold text-medical-600 dark:text-medical-400 uppercase tracking-wider">
              MediFlow Clinical Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
            AI Health & Hospital Concierge
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Conversational triage guidance, department matchmaker, lab preparation protocols, and operational FAQs.
          </p>
        </div>

        <button
          onClick={handleResetChat}
          className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-750 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Session</span>
        </button>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Clinical Disclaimer: </span>
          MediFlow AI is an educational triage and hospital scheduling assistant. It does not replace professional medical diagnosis. For urgent or life-threatening symptoms, dial emergency numbers (911 / 112) or report directly to the 24/7 Trauma Unit.
        </div>
      </div>

      {/* Two Column Layout: Symptom Triage Matrix + Interactive Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Symptom-to-Department Triage Guide (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-soft">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
              <Stethoscope className="w-4 h-4 text-medical-600 dark:text-medical-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                Symptom Triage Matchmaker
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
              Select symptoms below to preview the recommended hospital department, urgency level, and clinical directions.
            </p>

            {/* Quick symptom points with doctor images */}
            <div className="space-y-2 my-4">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Symptom & Department Points (Click to Preview Specialist):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickSymptoms.map((q) => {
                  const isSelected = selectedSymptom.id === q.id;
                  return (
                    <button
                      key={q.id}
                      onClick={() => handleSelectSymptom(q.id)}
                      className={`p-2.5 rounded-2xl text-left transition-all border flex items-center gap-2.5 group ${
                        isSelected
                          ? 'bg-medical-50/90 dark:bg-medical-950/50 border-medical-500 shadow-soft ring-1 ring-medical-500/30'
                          : 'bg-slate-50/80 dark:bg-slate-750/80 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {/* Doctor Image near the point */}
                      <div className="relative shrink-0">
                        <img
                          src={q.image}
                          alt={q.doctorName}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-600 shadow-xs group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="hidden w-11 h-11 rounded-xl bg-gradient-to-tr from-medical-600 to-tealAccent-500 text-white font-bold text-xs items-center justify-center">
                          {q.doctorName.split(' ')[1]?.[0] || 'D'}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold truncate ${
                          isSelected ? 'text-medical-700 dark:text-medical-300' : 'text-slate-900 dark:text-white'
                        }`}>
                          {q.label}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {q.dept} • <span className="text-medical-600 dark:text-medical-400 font-medium">{q.doctorName}</span>
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Diagnostic Triage Recommendation Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-medical-50/40 dark:from-slate-750 dark:via-slate-800 dark:to-medical-950/20 border border-slate-200/80 dark:border-slate-700 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Recommended Specialist & OPD
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                  selectedSymptom.urgency === 'urgent'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    : selectedSymptom.urgency === 'moderate'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}>
                  {selectedSymptom.urgency} urgency
                </span>
              </div>

              {/* Doctor Spotlight Box */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3.5 shadow-xs">
                <div className="relative shrink-0">
                  <img
                    src={selectedSymptom.doctorImage || '/doctors/dr_rachel_adams.jpg'}
                    alt={selectedSymptom.doctorName || 'Doctor'}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-medical-500/40 shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-emerald-500 text-[9px] font-bold text-white shadow-xs">
                    OPD
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit'] truncate">
                      {selectedSymptom.doctorName || 'Dr. Rachel Adams, MS'}
                    </h4>
                  </div>
                  <p className="text-xs font-semibold text-medical-600 dark:text-medical-400">
                    {selectedSymptom.doctorSpecialty || selectedSymptom.primaryDept}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{selectedSymptom.doctorRoom || 'Wing OPD'}</span>
                    <span>•</span>
                    <span className="text-amber-500 font-bold">★ {selectedSymptom.doctorRating || '4.8'}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/80 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  {selectedSymptom.guidance}
                </p>
              </div>

              <div className="pt-1 flex items-center gap-2">
                <Link
                  to="/dashboard/appointments"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-soft"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book in {selectedSymptom.primaryDept}</span>
                </Link>
                <Link
                  to="/dashboard/doctors"
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 text-xs font-semibold"
                >
                  View Doctors
                </Link>
              </div>
            </div>
          </div>

          {/* Quick FAQ Chips */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-soft">
            <span className="text-xs font-bold text-slate-900 dark:text-white font-['Outfit'] block mb-2">
              Frequently Asked Prompts:
            </span>
            <div className="space-y-1.5">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="w-full text-left p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-750 hover:bg-medical-50 dark:hover:bg-medical-950/40 text-slate-700 dark:text-slate-300 hover:text-medical-600 dark:hover:text-medical-400 border border-slate-200/60 dark:border-slate-700/60 transition-colors flex items-center justify-between group"
                >
                  <span>{q}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-medical-500 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Full Conversational Chat Window (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-soft flex flex-col h-[650px] overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 px-6 border-b border-slate-100 dark:border-slate-750 flex items-center justify-between bg-slate-50/60 dark:bg-slate-750/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-medical-600 to-tealAccent-500 text-white flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                  <span>MediFlow Assistant</span>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </h3>
                <span className="text-[10px] text-slate-400">Always active • Verified Hospital Knowledge Base</span>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-xl bg-medical-50 dark:bg-medical-950/50 text-medical-600 dark:text-medical-400 flex items-center justify-center shrink-0 border border-medical-200/60 dark:border-medical-900/40">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-medical-600 to-tealAccent-600 text-white shadow-soft rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-750 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 rounded-tl-none'
                  }`}
                >
                  <p>{m.text}</p>

                  {m.doctor && (
                    <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={m.doctor.image}
                          alt={m.doctor.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-600 shrink-0"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {m.doctor.name}
                          </p>
                          <p className="text-[11px] text-medical-600 dark:text-medical-400 font-medium truncate">
                            {m.doctor.specialty} • {m.doctor.room}
                          </p>
                        </div>
                      </div>
                      <Link
                        to="/dashboard/appointments"
                        className="px-2.5 py-1.5 rounded-lg bg-medical-600 hover:bg-medical-700 text-white font-semibold text-[11px] shrink-0 transition-colors shadow-xs"
                      >
                        Book Slot
                      </Link>
                    </div>
                  )}

                  <span
                    className={`block mt-1 text-[10px] ${
                      m.sender === 'user' ? 'text-medical-100 text-right' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>

                {m.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-navy-800 to-slate-700 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    MS
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs pl-11">
                <span className="w-2 h-2 rounded-full bg-medical-500 animate-pulse"></span>
                <span className="w-2 h-2 rounded-full bg-medical-500 animate-pulse delay-100"></span>
                <span className="w-2 h-2 rounded-full bg-medical-500 animate-pulse delay-200"></span>
                <span className="text-[11px] font-medium text-medical-600 dark:text-medical-400">Formulating response...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-4 border-t border-slate-100 dark:border-slate-750 bg-white dark:bg-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about symptoms, doctor schedules, wait times, lab instructions..."
              className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-medical-500"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-medical-600 hover:bg-medical-700 text-white transition-colors disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
