import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AppointmentsPage from './pages/AppointmentsPage';
import LiveQueuePage from './pages/LiveQueuePage';
import DoctorsPage from './pages/DoctorsPage';
import AIAssistantPage from './pages/AIAssistantPage';
import PatientProfilePage from './pages/PatientProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

/**
 * Role-aware dashboard index dispatcher
 */
function DashboardIndex() {
  const { user } = useAuth();
  if (user?.role === 'doctor') {
    return <DoctorDashboard />;
  }
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }
  return <PatientDashboard />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes with Navbar & Footer */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* Authenticated Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardIndex />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="queue" element={<LiveQueuePage />} />
              <Route path="doctors" element={<DoctorsPage />} />
              <Route path="assistant" element={<AIAssistantPage />} />
              <Route path="profile" element={<PatientProfilePage />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
