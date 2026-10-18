import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  LayoutDashboard,
  Calendar,
  Radio,
  Users,
  Bot,
  UserCheck,
  Settings,
  LogOut,
  X,
  Stethoscope,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Badge from './Badge';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user, logout, switchRole } = useAuth();

  const getNavItems = () => {
    if (user?.role === 'doctor') {
      return [
        { name: "Doctor Console", icon: LayoutDashboard, path: "/dashboard" },
        { name: "Live Patient Queue", icon: Radio, path: "/dashboard/queue" },
        { name: "Appointments Roster", icon: Calendar, path: "/dashboard/appointments" },
        { name: "Specialist Directory", icon: Stethoscope, path: "/dashboard/doctors" },
        { name: "Clinical AI Guide", icon: Bot, path: "/dashboard/assistant" },
        { name: "Physician Profile", icon: UserCheck, path: "/dashboard/profile" }
      ];
    }
    if (user?.role === 'admin') {
      return [
        { name: "Hospital Operations", icon: LayoutDashboard, path: "/dashboard" },
        { name: "Live Queue Matrix", icon: Radio, path: "/dashboard/queue" },
        { name: "Doctor Staff Roster", icon: Stethoscope, path: "/dashboard/doctors" },
        { name: "Central Bookings", icon: Calendar, path: "/dashboard/appointments" },
        { name: "Operations AI Concierge", icon: Bot, path: "/dashboard/assistant" },
        { name: "Facility Profile", icon: UserCheck, path: "/dashboard/profile" }
      ];
    }
    return [
      { name: "Patient Portal", icon: LayoutDashboard, path: "/dashboard" },
      { name: "My Appointments", icon: Calendar, path: "/dashboard/appointments" },
      { name: "OPD Live Queue", icon: Radio, path: "/dashboard/queue" },
      { name: "Specialist Directory", icon: Stethoscope, path: "/dashboard/doctors" },
      { name: "MediFlow Assistant", icon: Bot, path: "/dashboard/assistant" },
      { name: "Health Passport", icon: UserCheck, path: "/dashboard/profile" }
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0B1324] border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medical-500 to-tealAccent-500 flex items-center justify-center text-white shadow-glow">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-white leading-none font-['Outfit']">
                MediFlow<span className="text-medical-400">AI</span>
              </h1>
              <span className="text-[10px] text-slate-400 font-medium">Healthcare OS</span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Role switcher badge */}
        <div className="px-5 py-3 bg-[#0E172C]/70 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Role:</span>
            <Badge status="demo">{user?.role?.toUpperCase() || 'PATIENT'}</Badge>
          </div>
          <span className="text-[10px] text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-md">
            Phase 1 Active
          </span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/dashboard');
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-medical-500/15 text-medical-300 border border-medical-500/30 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-medical-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-medical-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Academic Demo Switcher Box */}
        <div className="p-4 mx-3 mb-3 bg-[#0E172C]/80 border border-slate-850 rounded-2xl">
          <p className="text-[11px] font-semibold text-medical-300 mb-1.5">
            Test Roles (Academic Demo):
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            <button
              onClick={() => switchRole('patient')}
              className={`py-1.5 rounded-lg font-medium transition-all ${
                user?.role === 'patient'
                  ? 'bg-medical-600 text-white shadow-sm'
                  : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300'
              }`}
            >
              Patient
            </button>
            <button
              onClick={() => switchRole('doctor')}
              className={`py-1.5 rounded-lg font-medium transition-all ${
                user?.role === 'doctor'
                  ? 'bg-medical-600 text-white shadow-sm'
                  : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300'
              }`}
            >
              Doctor
            </button>
            <button
              onClick={() => switchRole('admin')}
              className={`py-1.5 rounded-lg font-medium transition-all ${
                user?.role === 'admin'
                  ? 'bg-medical-600 text-white shadow-sm'
                  : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300'
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        {/* User footer profile */}
        <div className="p-4 border-t border-slate-800/80 bg-[#070C17]/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-medical-500 to-tealAccent-500 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {user?.name ? user.name.slice(0, 2) : "MS"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {user?.name || "Demo User"}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.email || "demo@mediflow.local"}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
