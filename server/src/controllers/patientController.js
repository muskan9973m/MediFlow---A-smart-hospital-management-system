import { db } from '../config/db.js';

export const getPatientRecords = (req, res) => {
  try {
    const targetPatientId = req.params.patientId || req.user.id;

    // Only allow if accessing own record, or user is doctor/admin
    if (req.user.role === 'patient' && targetPatientId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this record.' });
    }

    const record = db.getRecord(targetPatientId);
    if (!record) {
      // Return empty profile record structure
      return res.json({
        success: true,
        record: {
          patientId: targetPatientId,
          fullName: req.user.name,
          email: req.user.email,
          phone: req.user.phone || '',
          allergies: [],
          chronicConditions: [],
          activeMedications: [],
          vitalsHistory: [],
          labReports: []
        }
      });
    }

    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve patient medical records.' });
  }
};

export const addVitals = (req, res) => {
  try {
    const patientId = req.params.patientId || req.user.id;
    const { bp, heartRate, spo2, weight, temp } = req.body;

    const newVitals = {
      date: new Date().toISOString().split('T')[0],
      bp: bp || '120/80',
      heartRate: heartRate || '72 bpm',
      spo2: spo2 || '99%',
      weight: weight || '68 kg',
      temp: temp || '98.6°F'
    };

    const updated = db.updateRecord(patientId, rec => ({
      ...rec,
      vitalsHistory: [newVitals, ...(rec.vitalsHistory || [])]
    }));

    res.status(201).json({ success: true, message: 'Vitals recorded successfully.', record: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to log vitals.' });
  }
};

export const getNotifications = (req, res) => {
  try {
    const notifs = db.find('notifications', n => n.userId === req.user.id || !n.userId);
    res.json({ success: true, notifications: notifs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
};

export const markNotificationRead = (req, res) => {
  try {
    const { id } = req.params;
    if (id === 'all') {
      db.update('notifications', n => n.userId === req.user.id, n => ({ ...n, read: true }));
    } else {
      db.update('notifications', n => n.id === id, n => ({ ...n, read: true }));
    }
    res.json({ success: true, message: 'Marked notifications as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
};

export const updatePatientRecord = (req, res) => {
  try {
    const patientId = req.params.patientId || req.user.id;
    const {
      allergies,
      chronicConditions,
      activeMedications,
      vitalsHistory,
      bloodGroup,
      height,
      weight,
      bmi,
      emergencyContact,
      phone,
      email
    } = req.body;

    const updated = db.updateRecord(patientId, rec => ({
      ...(rec || {}),
      patientId,
      fullName: req.user.name,
      ...(allergies !== undefined && { allergies }),
      ...(chronicConditions !== undefined && { chronicConditions }),
      ...(activeMedications !== undefined && { activeMedications }),
      ...(vitalsHistory !== undefined && { vitalsHistory }),
      ...(bloodGroup !== undefined && { bloodGroup }),
      ...(height !== undefined && { height }),
      ...(weight !== undefined && { weight }),
      ...(bmi !== undefined && { bmi }),
      ...(emergencyContact !== undefined && { emergencyContact }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email })
    }));

    res.json({ success: true, message: 'Medical record updated successfully.', record: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update patient record.' });
  }
};

