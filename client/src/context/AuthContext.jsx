import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USER } from '../data/mockData';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('mediflow_token') || '');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mediflow_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name === 'Alex Morgan') {
          parsed.name = 'Muskan Singh';
          parsed.email = 'muskan.singh@example.com';
          localStorage.setItem('mediflow_user', JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {
        // Fallback
      }
    }
    return MOCK_USER;
  });
  const [loading, setLoading] = useState(false);

  // Sync profile from backend if token exists or auto-login demo patient
  useEffect(() => {
    if (token) {
      authAPI.getMe()
        .then(res => {
          if (res?.user) {
            setUser(res.user);
            localStorage.setItem('mediflow_user', JSON.stringify(res.user));
          }
        })
        .catch(() => {
          // Keep local state if server is offline or token invalid
        });
    } else {
      // Auto-fetch demo session token so bookings always succeed
      authAPI.login({ email: 'muskan.singh@example.com', password: 'password123', role: 'patient' })
        .then(res => {
          if (res?.token && res?.user) {
            setToken(res.token);
            setUser(res.user);
            localStorage.setItem('mediflow_token', res.token);
            localStorage.setItem('mediflow_user', JSON.stringify(res.user));
          }
        })
        .catch(() => {});
    }
  }, [token]);

  const login = async (roleOrEmail = 'patient', emailArg, passwordArg = 'password123') => {
    setLoading(true);
    let email = emailArg || 'muskan.singh@example.com';
    let role = 'patient';

    if (roleOrEmail === 'doctor' || roleOrEmail === 'admin' || roleOrEmail === 'patient') {
      role = roleOrEmail;
      if (role === 'doctor') email = 'sarah.jenkins@mediflow.org';
      else if (role === 'admin') email = 'admin@mediflow.org';
      else email = 'muskan.singh@example.com';
    } else if (typeof roleOrEmail === 'string' && roleOrEmail.includes('@')) {
      email = roleOrEmail;
      if (email.includes('doctor') || email.includes('jenkins')) role = 'doctor';
      else if (email.includes('admin')) role = 'admin';
    }

    try {
      // Attempt backend API login
      const response = await authAPI.login({
        email,
        password: passwordArg || 'password123',
        role
      });

      if (response?.user && response?.token) {
        setUser(response.user);
        setToken(response.token);
        setLoading(false);
        return response.user;
      }
    } catch (err) {
      console.warn('Backend login attempt fell back to offline demo profile:', err.message);
    }

    // Fallback demo user simulation if server connection fails
    let loggedUser = { ...MOCK_USER, role, email };
    if (role === 'doctor') {
      loggedUser = {
        id: 'doc_101',
        name: 'Dr. Sarah Jenkins, MD',
        email: 'sarah.jenkins@mediflow.org',
        role: 'doctor',
        department: 'Cardiology',
        room: 'Room 204 - Wing B'
      };
    } else if (role === 'admin') {
      loggedUser = {
        id: 'adm_001',
        name: 'Chief Admin Reynolds',
        email: 'admin@mediflow.org',
        role: 'admin',
        department: 'Hospital Administration'
      };
    }

    setUser(loggedUser);
    localStorage.setItem('mediflow_user', JSON.stringify(loggedUser));
    setLoading(false);
    return loggedUser;
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authAPI.register(userData);
      if (res?.user && res?.token) {
        setUser(res.user);
        setToken(res.token);
        setLoading(false);
        return res.user;
      }
    } catch (err) {
      console.warn('Backend register failed, offline fallback:', err);
    }

    const fallbackUser = {
      id: `pat_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role || 'patient',
      phone: userData.phone || '',
      bloodGroup: userData.bloodGroup || 'O+'
    };
    setUser(fallbackUser);
    localStorage.setItem('mediflow_user', JSON.stringify(fallbackUser));
    setLoading(false);
    return fallbackUser;
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('mediflow_user');
    localStorage.removeItem('mediflow_token');
  };

  const switchRole = (newRole) => {
    return login(newRole);
  };

  const updateProfile = async (updates) => {
    try {
      const res = await authAPI.updateProfile(updates);
      if (res?.user) {
        setUser(res.user);
        return res.user;
      }
    } catch (e) {
      console.warn('Failed to update remote profile:', e);
    }
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('mediflow_user', JSON.stringify(updated));
    return updated;
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, loading, login, register, logout, switchRole, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
