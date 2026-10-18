import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu, Calendar, Clock, Bell, UserCircle, Activity } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import NotificationDropdown from '../components/NotificationDropdown';
import ThemeToggle from '../components/ThemeToggle';
import ChatbotDrawer from '../components/ChatbotDrawer';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#090E17] text-slate-100 flex transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-[#0B1324]/85 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-medical-500" />
              <span>{currentDate}</span>
              <span className="mx-1">•</span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                OPD Open
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <NotificationDropdown />

            {/* Dark mode switcher */}
            <ThemeToggle />

            {/* User Avatar & name */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-700">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-medical-600 to-tealAccent-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {user?.name ? user.name.slice(0, 2) : "MS"}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  {user?.name || "Muskan Singh"}
                </p>
                <p className="text-[10px] text-medical-600 dark:text-medical-400 font-medium capitalize">
                  {user?.role || "Patient"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>

        {/* Floating AI Chatbot */}
        <ChatbotDrawer />
      </div>
    </div>
  );
}
