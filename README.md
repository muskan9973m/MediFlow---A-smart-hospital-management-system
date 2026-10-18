# MediFlow AI — Hospital OPD Queue & Clinical Management System

A full-stack medical outpatient department (OPD) queue tracking, patient appointment booking, doctor consultation, and hospital administrative suite.

---

## 🌟 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Recharts, Axios, Socket.io-client.
- **Backend**: Node.js, Express.js (ES Modules), Socket.io, JSON Web Tokens (JWT), Bcrypt.js, Dotenv, Cors.
- **Database / Storage**: Dual-mode storage engine:
  - **Local Persistent Store**: Zero-dependency persistent JSON store (`server/src/data/store.json`) with automated seeding of mock hospital records.
  - **MongoDB Ready**: Connect remote MongoDB Atlas by setting `MONGODB_URI` in `server/.env`.
- **Real-Time Sockets**: Instant queue token transitions, doctor calls, chime triggers, and live room display synchronization.

---

## 📂 Project Architecture

```
MediFlow/
├── client/                     # React Frontend Single Page Application
│   ├── src/
│   │   ├── components/         # Modals, Navbar, Sidebar, Badge, NotificationDropdown
│   │   ├── context/            # AuthContext (JWT + role persistence), ThemeContext
│   │   ├── data/               # Default Clinical Datasets & Mock Fallbacks
│   │   ├── layouts/            # PublicLayout & DashboardLayout
│   │   ├── pages/              # 12 Full application pages
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── PatientDashboard.jsx
│   │   │   ├── DoctorDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AppointmentsPage.jsx
│   │   │   ├── LiveQueuePage.jsx
│   │   │   ├── DoctorsPage.jsx
│   │   │   ├── AIAssistantPage.jsx
│   │   │   └── PatientProfilePage.jsx
│   │   └── services/
│   │       └── api.js          # Axios API client & Socket.io singleton
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Express & Socket.io Backend Server
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # Persistent storage manager
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── appointmentController.js
│   │   │   ├── queueController.js
│   │   │   ├── doctorController.js
│   │   │   ├── patientController.js
│   │   │   ├── adminController.js
│   │   │   └── aiController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js # JWT & Role authorization
│   │   │   └── errorHandler.js
│   │   ├── routes/             # REST API Routes
│   │   ├── seeds/
│   │   │   └── seedData.js     # Hospital initial records & hashed credentials
│   │   ├── socket/
│   │   │   └── queueSocket.js  # Real-time WebSocket room dispatcher
│   │   └── index.js            # Express server entrypoint
│   ├── .env                    # PORT=5001, JWT_SECRET, etc.
│   └── package.json
│
├── package.json                # Root package with unified dev scripts
└── README.md
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Start the Backend Server
```bash
cd server
npm start
# Server runs on http://localhost:5001
# Health check: http://localhost:5001/api/health
```

### 3. Start the Frontend Client
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🔐 Demo Accounts & Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Patient** | `muskan.singh@example.com` | `password123` | Patient portal, booking, vitals, live queue |
| **Doctor** | `sarah.jenkins@mediflow.org` | `password123` | Cardiology OPD console, queue caller, consultation EHR |
| **Admin** | `admin@mediflow.org` | `password123` | Executive analytics, department telemetry, broadcasts |

---

## 📡 API Endpoints Overview

- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/profile`
- **Appointments**: `GET /api/appointments`, `POST /api/appointments`, `PUT /api/appointments/:id/reschedule`, `PUT /api/appointments/:id/cancel`
- **Queue**: `GET /api/queue`, `POST /api/queue/call-next`, `PATCH /api/queue/:token`
- **Doctors**: `GET /api/doctors`, `GET /api/doctors/departments`, `GET /api/doctors/:id`
- **Patients**: `GET /api/patients/records`, `POST /api/patients/vitals`, `GET /api/patients/notifications`
- **Admin**: `GET /api/admin/analytics`
- **AI Triage**: `POST /api/ai/triage`, `POST /api/ai/chat`
