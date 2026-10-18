import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

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
    return res.data;
  },
  getById: async (id) => {
    const res = await apiClient.get(`/appointments/${id}`);
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
    return res.data;
  },
  getById: async (id) => {
    const res = await apiClient.get(`/doctors/${id}`);
    return res.data;
  },
  getDepartments: async () => {
    const res = await apiClient.get('/doctors/departments');
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
