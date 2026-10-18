import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      type="button"
      aria-label="Toggle theme"
      className={`p-2 rounded-xl transition-all duration-200 border text-slate-600 hover:text-medical-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-medical-400 dark:border-slate-700 dark:hover:bg-slate-800 ${className}`}
      title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {darkMode ? (
        <Sun className="w-5 h-5 text-amber-400 animate-pulse" />
      ) : (
        <Moon className="w-5 h-5 text-slate-600" />
      )}
    </button>
  );
}
