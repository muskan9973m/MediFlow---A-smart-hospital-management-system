import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email address and password');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      let role = 'patient';
      if (email.includes('doctor') || email.includes('jenkins')) role = 'doctor';
      if (email.includes('admin')) role = 'admin';

      await login(role, email, password);
      setIsLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'Failed to login');
      setIsLoading(false);
    }
  };

  // Demo account pre-fill handler
  const handleQuickDemo = async (role) => {
    setIsLoading(true);
    let demoEmail = 'muskan.singh@example.com';
    let demoPass = 'password123';

    if (role === 'doctor') {
      demoEmail = 'sarah.jenkins@mediflow.org';
    } else if (role === 'admin') {
      demoEmail = 'admin@mediflow.org';
    }

    setEmail(demoEmail);
    setPassword(demoPass);
    await login(role, demoEmail, demoPass);
    setIsLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-700 shadow-xl relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-medical-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medical-600 to-tealAccent-500 text-white flex items-center justify-center shadow-soft">
              <Activity className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-xl text-slate-900 dark:text-white font-['Outfit']">
              MediFlow<span className="text-medical-600 dark:text-medical-400">AI</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
            Sign In to Your Portal
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access your patient appointments, doctor schedules, or admin controls
          </p>
        </div>

        {/* Quick Demo Selector */}
        <div className="mb-6 p-3.5 bg-medical-50/70 dark:bg-medical-950/30 rounded-2xl border border-medical-200/70 dark:border-medical-900/40">
          <p className="text-[11px] font-semibold text-medical-900 dark:text-medical-300 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-medical-600 dark:text-medical-400" />
            <span>Academic Demonstration Quick Logins:</span>
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemo('patient')}
              className="py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-medical-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-center transition-colors shadow-xs"
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('doctor')}
              className="py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-medical-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-center transition-colors shadow-xs"
            >
              Doctor
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-medical-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-center transition-colors shadow-xs"
            >
              Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-medical-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-medical-600 dark:text-medical-400 hover:underline font-medium"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-medical-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-medical-600 to-tealAccent-600 hover:from-medical-700 hover:to-tealAccent-700 text-white font-semibold text-xs shadow-soft hover:shadow-card transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            <span>{isLoading ? 'Verifying Credentials...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
          <span>Don't have a patient account? </span>
          <Link to="/register" className="text-medical-600 dark:text-medical-400 font-semibold hover:underline">
            Register as Patient
          </Link>
        </div>
      </div>
    </div>
  );
}
