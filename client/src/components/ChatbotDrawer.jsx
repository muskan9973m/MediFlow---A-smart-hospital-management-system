import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, AlertTriangle, User, RotateCcw } from 'lucide-react';
import { MOCK_FAQ_RESPONSES } from '../data/mockData';
import { aiAPI } from '../services/api';

export default function ChatbotDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "msg_welcome",
      sender: "bot",
      text: "Hello! I'm your MediFlow AI Hospital Assistant. How can I assist you today with hospital timings, departments, doctors, booking, or live queue tracking?",
      time: "Just now"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "What are OPD hospital timings?",
    "How do I book an appointment?",
    "How does the live queue tracker work?",
    "Which departments are available?",
    "How can I cancel or reschedule?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

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
      console.warn('Backend AI API error, falling back to local simulation:', err);
    }

    // Fallback simulation
    setTimeout(() => {
      const lower = query.toLowerCase();
      let matchedResponse = null;

      if (lower.includes("emergency") || lower.includes("chest pain") || lower.includes("tightness") || lower.includes("severe")) {
        matchedResponse = "⚠️ MEDICAL ALERT: If you or someone with you is experiencing severe symptoms, sudden chest pain, or breathing distress, do NOT rely on online chat. Please immediately contact your local emergency services (911/112) or proceed to MediFlow 24/7 Emergency Wing.";
      } else {
        for (const item of MOCK_FAQ_RESPONSES) {
          if (item.keywords.some(k => lower.includes(k))) {
            matchedResponse = item.answer;
            break;
          }
        }
      }

      if (!matchedResponse) {
        matchedResponse = "I can help you with hospital timings, doctor availability, appointment bookings, and live queue status. For medical advice, please consult one of our licensed physicians directly.";
      }

      const botReply = {
        id: `bot_${Date.now()}`,
        sender: "bot",
        text: matchedResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botReply]);
      setIsTyping(false);
    }, 400);
  };

  const handleReset = () => {
    setMessages([
      {
        id: `msg_welcome_${Date.now()}`,
        sender: "bot",
        text: "Conversation refreshed. How can I assist you with hospital operations today?",
        time: "Just now"
      }
    ]);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-2xl bg-gradient-to-r from-medical-600 to-tealAccent-600 hover:from-medical-700 hover:to-tealAccent-700 text-white shadow-xl hover:shadow-glow transition-all duration-300 flex items-center gap-2 group"
        aria-label="Open Hospital AI Assistant"
      >
        <Bot className="w-6 h-6 transition-transform group-hover:scale-110" />
        <span className="hidden sm:inline font-semibold text-sm">Ask MediFlow AI</span>
      </button>

      {/* Slide-over Chat Drawer / Window */}
      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 w-[94vw] sm:w-[420px] h-[550px] bg-white dark:bg-slate-850 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-medical-600 to-tealAccent-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight font-['Outfit']">MediFlow Assistant</h4>
                <p className="text-[11px] text-medical-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block"></span>
                  Informational Hospital AI
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Reset conversation"
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Safety disclaimer banner */}
          <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-100 dark:border-amber-900/40 flex items-center gap-2 text-[11px] text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Informational only: Not a doctor. In emergency, call 911/112.</span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 dark:bg-slate-900/40 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-lg bg-medical-100 dark:bg-medical-950/60 text-medical-600 dark:text-medical-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-3.5 ${
                    m.sender === 'user'
                      ? 'bg-medical-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-none shadow-sm'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-line">{m.text}</p>
                  <span
                    className={`block text-[10px] mt-1.5 text-right ${
                      m.sender === 'user' ? 'text-medical-200' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-lg bg-medical-100 dark:bg-medical-950/60 text-medical-600 dark:text-medical-400 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2 text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-medical-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-medical-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-medical-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Prompts */}
          <div className="px-3 py-2 bg-white dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-750 hover:bg-medical-50 dark:hover:bg-medical-950/50 text-slate-600 hover:text-medical-600 dark:text-slate-300 dark:hover:text-medical-400 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white dark:bg-slate-850 border-t border-slate-100 dark:border-slate-750 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about hospital OPD, queue, doctors..."
              className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-medical-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2 rounded-xl bg-medical-600 hover:bg-medical-700 text-white disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
