import { db } from '../config/db.js';

export const getDoctors = (req, res) => {
  try {
    const { department, search } = req.query;
    let doctors = db.get('doctors');

    if (department && department !== 'All') {
      doctors = doctors.filter(d => d.department.toLowerCase() === department.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      doctors = doctors.filter(d => 
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.department.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: doctors.length, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch doctors.' });
  }
};

export const getDoctorById = (req, res) => {
  try {
    const { id } = req.params;
    const doc = db.findOne('doctors', d => d.id === id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
    res.json({ success: true, doctor: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve doctor.' });
  }
};

export const getDepartments = (req, res) => {
  try {
    const departments = db.get('departments');
    res.json({ success: true, departments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch departments.' });
  }
};
