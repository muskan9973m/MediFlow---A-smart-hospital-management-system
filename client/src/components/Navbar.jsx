import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, Menu, X, ArrowRight, UserCircle } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, switchRole, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel bg-[#0B1324]/85 border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medical-500 to-tealAccent-500 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white font-['Outfit']">
                MediFlow<span className="text-medical-400">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Smart Hospital Suite
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-medical-400 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-medical-400 transition-colors">
              How It Works
            </a>
            <a href="#benefits" className="hover:text-medical-400 transition-colors">
              Benefits
            </a>
            <a href="#security" className="hover:text-medical-400 transition-colors">
              Security
            </a>
            <Link to="/dashboard" className="text-medical-400 font-semibold hover:underline">
              Patient Portal
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Demo Quick Role Switcher for Academic Evaluation */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0E172C] rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 font-medium">Demo:</span>
              <button
                onClick={() => {
                  switchRole('patient');
                  navigate('/dashboard');
                }}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                  user?.role === 'patient'
                    ? 'bg-medical-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Patient
              </button>
              <button
                onClick={() => {
                  switchRole('doctor');
                  navigate('/dashboard');
                }}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                  user?.role === 'doctor'
                    ? 'bg-medical-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-medical-600'
                }`}
              >
                Doctor
              </button>
              <button
                onClick={() => {
                  switchRole('admin');
                  navigate('/dashboard');
                }}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                  user?.role === 'admin'
                    ? 'bg-medical-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-medical-600'
                }`}
              >
                Admin
              </button>
            </div>

            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="px-4 py-2 rounded-xl bg-medical-600 hover:bg-medical-700 text-white text-xs font-semibold shadow-soft hover:shadow-card transition-all flex items-center gap-1.5"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={logout}
                  className="px-3 py-2 text-xs text-slate-500 hover:text-rose-600 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-medical-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-medical-600 hover:bg-medical-700 text-white text-xs font-semibold shadow-soft hover:shadow-card transition-all flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              How It Works
            </a>
            <a
              href="#benefits"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Benefits
            </a>
            <a
              href="#security"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Security
            </a>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg text-medical-600 font-semibold bg-medical-50 dark:bg-medical-950/40"
            >
              Open Patient Dashboard
            </Link>
          </nav>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <div className="text-xs text-slate-400 font-medium">Switch Demo Profile:</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  switchRole('patient');
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
                className="px-2 py-1.5 rounded-lg bg-medical-50 dark:bg-medical-950/40 text-medical-700 dark:text-medical-300 text-xs font-semibold text-center"
              >
                Patient
              </button>
              <button
                onClick={() => {
                  switchRole('doctor');
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
                className="px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold text-center"
              >
                Doctor
              </button>
              <button
                onClick={() => {
                  switchRole('admin');
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
                className="px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold text-center"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
