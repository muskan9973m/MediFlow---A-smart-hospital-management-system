import axios from 'axios';
import { io } from 'socket.io-client';
import { getDoctorImage } from '../data/mockData';

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    const trimmed = envUrl.replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }
  return 'https://mediflow-backend-txp0.onrender.com/api';
};

const getSocketUrl = () => {
  const envUrl = import.meta.env.VITE_SOCKET_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }
  return 'https://mediflow-backend-txp0.onrender.com';
};

const API_BASE_URL = getApiBaseUrl();
const SOCKET_URL = getSocketUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Attach JWT token automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('mediflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle auth expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if explicitly expired/invalid
      if (!window.location.pathname.includes('/login')) {
        // Optional: notify or redirect if needed
      }
    }
    return Promise.reject(error);
  }
);

// Socket.io singleton connection
let socketInstance = null;
export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
  }
  return socketInstance;
};

// API Services
export const authAPI = {
  login: async (credentials) => {
    const res = await apiClient.post('/auth/login', credentials);
    if (res.data?.token) {
      localStorage.setItem('mediflow_token', res.data.token);
      localStorage.setItem('mediflow_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  register: async (userData) => {
    const res = await apiClient.post('/auth/register', userData);
    if (res.data?.token) {
      localStorage.setItem('mediflow_token', res.data.token);
      localStorage.setItem('mediflow_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
  updateProfile: async (profileData) => {
    const res = await apiClient.put('/auth/profile', profileData);
    if (res.data?.user) {
      localStorage.setItem('mediflow_user', JSON.stringify(res.data.user));
    }
    return res.data;
  }
};

export const appointmentAPI = {
  getAll: async (params) => {
    const res = await apiClient.get('/appointments', { params });
    if (res.data?.appointments && Array.isArray(res.data.appointments)) {
      res.data.appointments = res.data.appointments.map(a => ({
        ...a,
        doctorImage: a.doctorImage || getDoctorImage(a.doctorId || a.doctorName)
      }));
    }
    return res.data;
  },
  getById: async (id) => {
    const res = await apiClient.get(`/appointments/${id}`);
    if (res.data?.appointment) {
      res.data.appointment = {
        ...res.data.appointment,
        doctorImage: res.data.appointment.doctorImage || getDoctorImage(res.data.appointment.doctorId || res.data.appointment.doctorName)
      };
    }
    return res.data;
  },
  create: async (appointmentData) => {
    const res = await apiClient.post('/appointments', appointmentData);
    return res.data;
  },
  reschedule: async (id, newDateTime) => {
    const res = await apiClient.put(`/appointments/${id}/reschedule`, newDateTime);
    return res.data;
  },
  cancel: async (id) => {
    const res = await apiClient.put(`/appointments/${id}/cancel`);
    return res.data;
  },
  updateStatus: async (id, status) => {
    const res = await apiClient.patch(`/appointments/${id}/status`, { status });
    return res.data;
  }
};

export const queueAPI = {
  getLiveQueue: async (params) => {
    const res = await apiClient.get('/queue', { params });
    if (res.data?.queue && Array.isArray(res.data.queue)) {
      res.data.queue = res.data.queue.map(q => ({
        ...q,
        doctorImage: q.doctorImage || getDoctorImage(q.doctorId || q.doctor)
      }));
    }
    return res.data;
  },
  callNextToken: async (data) => {
    const res = await apiClient.post('/queue/call-next', data);
    return res.data;
  },
  updateToken: async (token, updateData) => {
    const res = await apiClient.patch(`/queue/${token}`, updateData);
    return res.data;
  }
};

export const doctorAPI = {
  getAll: async (params) => {
    const res = await apiClient.get('/doctors', { params });
    if (res.data?.doctors && Array.isArray(res.data.doctors)) {
      res.data.doctors = res.data.doctors.map(d => ({
        ...d,
        image: d.image || getDoctorImage(d)
      }));
    }
    return res.data;
  },
  getById: async (id) => {
    const res = await apiClient.get(`/doctors/${id}`);
    if (res.data?.doctor) {
      res.data.doctor = {
        ...res.data.doctor,
        image: res.data.doctor.image || getDoctorImage(res.data.doctor)
      };
    }
    return res.data;
  },
  getDepartments: async () => {
    const res = await apiClient.get('/doctors/departments');
    if (res.data?.departments && Array.isArray(res.data.departments)) {
      res.data.departments = res.data.departments.map(dept => ({
        ...dept,
        headImage: dept.headImage || getDoctorImage(dept.head || dept.name)
      }));
    }
    return res.data;
  },
  updateStatus: async (id, status) => {
    const res = await apiClient.patch(`/doctors/${id}/status`, { status });
    return res.data;
  }
};

export const patientAPI = {
  getRecords: async (patientId) => {
    const url = patientId ? `/patients/${patientId}/records` : '/patients/records';
    const res = await apiClient.get(url);
    return res.data;
  },
  updateRecord: async (recordData, patientId) => {
    const url = patientId ? `/patients/${patientId}/records` : '/patients/records';
    const res = await apiClient.put(url, recordData);
    return res.data;
  },
  addVitals: async (vitalsData, patientId) => {
    const url = patientId ? `/patients/${patientId}/vitals` : '/patients/vitals';
    const res = await apiClient.post(url, vitalsData);
    return res.data;
  },
  getNotifications: async () => {
    const res = await apiClient.get('/patients/notifications');
    return res.data;
  },
  markNotificationRead: async (id = 'all') => {
    const res = await apiClient.put(`/patients/notifications/${id}/read`);
    return res.data;
  }
};

export const adminAPI = {
  getAnalytics: async () => {
    const res = await apiClient.get('/admin/analytics');
    return res.data;
  },
  publishBroadcast: async (broadcastData) => {
    const res = await apiClient.post('/admin/broadcast', broadcastData);
    return res.data;
  }
};

export const aiAPI = {
  analyzeSymptoms: async (symptoms) => {
    const res = await apiClient.post('/ai/triage', { symptoms });
    return res.data;
  },
  chatAssistant: async (query) => {
    const res = await apiClient.post('/ai/chat', { query });
    return res.data;
  }
};
