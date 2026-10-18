import { db } from '../config/db.js';
import { emitQueueUpdate } from '../socket/queueSocket.js';

// Department code prefix for token generation
const DEPT_PREFIX_MAP = {
  Cardiology: 'C',
  Neurology: 'N',
  Orthopedics: 'O',
  Pediatrics: 'P',
  'General Medicine': 'G',
  Dermatology: 'D'
};

export const getAppointments = (req, res) => {
  try {
    const { status, doctorId, date } = req.query;
    let list = db.get('appointments');

    // Role-based filtering
    if (req.user.role === 'patient') {
      list = list.filter(a => a.patientId === req.user.id || a.patientEmail === req.user.email);
    } else if (req.user.role === 'doctor') {
      list = list.filter(a => a.doctorId === req.user.id || a.doctorName?.includes(req.user.name));
    }

    // Additional query filters
    if (status && status !== 'all') {
      list = list.filter(a => a.status.toLowerCase() === status.toLowerCase());
    }
    if (doctorId) {
      list = list.filter(a => a.doctorId === doctorId);
    }
    if (date) {
      list = list.filter(a => a.date === date);
    }

    res.json({ success: true, count: list.length, appointments: list });
  } catch (err) {
    console.error('getAppointments error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch appointments.' });
  }
};

export const getAppointmentById = (req, res) => {
  try {
    const { id } = req.params;
    const apt = db.findOne('appointments', a => a.id === id);
    if (!apt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }
    res.json({ success: true, appointment: apt });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve appointment.' });
  }
};

export const createAppointment = (req, res) => {
  try {
    const { doctorId, doctorName, specialty, department, date, time, reason, room } = req.body;

    if (!doctorId || !date || !time) {
      return res.status(400).json({ success: false, message: 'Doctor, date, and time are required.' });
    }

    // Find doctor info if not provided
    const doc = db.findOne('doctors', d => d.id === doctorId);
    const resolvedDoctorName = doctorName || doc?.name || 'Dr. Specialist';
    const resolvedDept = department || doc?.department || 'General Medicine';
    const resolvedSpecialty = specialty || doc?.specialty || resolvedDept;
    const resolvedRoom = room || doc?.room || 'OPD Desk 1';

    // Generate unique reference & token
    const randomRefNum = Math.floor(1000 + Math.random() * 9000);
    const refNumber = `MF-2026-${randomRefNum}`;
    const prefix = DEPT_PREFIX_MAP[resolvedDept] || 'M';
    const randomTokenNum = Math.floor(10 + Math.random() * 89);
    const queueToken = `${prefix}-${randomTokenNum}`;
    const newId = `apt_${Date.now()}`;

    const newAppointment = {
      id: newId,
      refNumber,
      patientId: req.user.id,
      patientName: req.user.name,
      patientEmail: req.user.email,
      doctorId,
      doctorName: resolvedDoctorName,
      specialty: resolvedSpecialty,
      department: resolvedDept,
      date,
      time,
      reason: reason || 'Routine clinical consultation',
      status: 'confirmed',
      room: resolvedRoom,
      queueToken,
      createdDate: new Date().toISOString().split('T')[0]
    };

    db.insert('appointments', newAppointment);

    // Also add to active queue
    const queueItems = db.get('queue');
    const newQueueEntry = {
      id: `q_${Date.now()}`,
      token: queueToken,
      department: resolvedDept,
      doctorId,
      doctorName: resolvedDoctorName,
      patientId: req.user.id,
      patientName: req.user.name,
      age: 29,
      gender: 'Patient',
      status: 'waiting',
      triageLevel: 'Normal',
      appointmentTime: time,
      visitReason: reason || 'Scheduled Consultation',
      vitals: { bp: '120/80', heartRate: '72 bpm', spo2: '99%', temp: '98.6°F' },
      allergies: [],
      pastVisits: 1,
      notes: 'Booked via MediFlow Portal',
      order: queueItems.length + 1
    };

    db.insert('queue', newQueueEntry);

    // Create confirmation notification
    db.insert('notifications', {
      id: `notif_${Date.now()}`,
      userId: req.user.id,
      title: 'Appointment Booked',
      message: `Your appointment with ${resolvedDoctorName} (${resolvedDept}) is confirmed for ${date} at ${time}. Token: ${queueToken}`,
      time: 'Just now',
      read: false,
      type: 'appointment'
    });

    emitQueueUpdate(resolvedDept);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully.',
      appointment: newAppointment,
      queueToken
    });
  } catch (err) {
    console.error('createAppointment error:', err);
    res.status(500).json({ success: false, message: 'Failed to create appointment.' });
  }
};

export const rescheduleAppointment = (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({ success: false, message: 'New date and time are required.' });
    }

    const apt = db.findOne('appointments', a => a.id === id);
    if (!apt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Check authorization
    if (req.user.role === 'patient' && apt.patientId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this appointment.' });
    }

    db.update('appointments', a => a.id === id, a => ({
      ...a,
      date,
      time,
      status: 'confirmed'
    }));

    const updated = db.findOne('appointments', a => a.id === id);

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully.',
      appointment: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reschedule appointment.' });
  }
};

export const cancelAppointment = (req, res) => {
  try {
    const { id } = req.params;
    const apt = db.findOne('appointments', a => a.id === id);
    if (!apt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (req.user.role === 'patient' && apt.patientId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this appointment.' });
    }

    db.update('appointments', a => a.id === id, a => ({
      ...a,
      status: 'cancelled'
    }));

    // Update queue status if present
    db.update('queue', q => q.token === apt.queueToken, q => ({
      ...q,
      status: 'cancelled'
    }));

    emitQueueUpdate(apt.department);

    res.json({ success: true, message: 'Appointment cancelled successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to cancel appointment.' });
  }
};

export const updateAppointmentStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['confirmed', 'pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment status.' });
    }

    const apt = db.findOne('appointments', a => a.id === id);
    if (!apt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    db.update('appointments', a => a.id === id, a => ({
      ...a,
      status
    }));

    const updated = db.findOne('appointments', a => a.id === id);
    res.json({ success: true, message: `Status updated to ${status}.`, appointment: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update appointment status.' });
  }
};
