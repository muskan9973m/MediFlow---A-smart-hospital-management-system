import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Clock, Calendar, Users, X } from 'lucide-react';
import { MOCK_NOTIFICATIONS } from '../data/mockData';
import { patientAPI } from '../services/api';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const dropdownRef = useRef(null);

  useEffect(() => {
    patientAPI.getNotifications()
      .then(res => {
        if (res?.notifications) {
          setNotifications(res.notifications);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    try {
      await patientAPI.markNotificationRead('all');
    } catch (e) {}
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'queue':
        return <Users className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-teal-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-medical-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-medical-400 dark:hover:bg-slate-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-800 shadow-card border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {unreadCount} unread alert{unreadCount === 1 ? '' : 's'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-medical-600 hover:text-medical-700 dark:text-medical-400 font-medium flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No notifications right now
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 transition-colors flex gap-3 ${
                    n.read ? 'bg-transparent' : 'bg-medical-50/50 dark:bg-medical-950/20'
                  } hover:bg-slate-50 dark:hover:bg-slate-750`}
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-sm shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {n.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-750 border-t border-slate-100 dark:border-slate-700 text-center">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Real-time alerts via Socket.IO (Simulation in Phase 1)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
