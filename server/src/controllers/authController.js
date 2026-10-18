import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { generateToken } from '../middleware/authMiddleware.js';

export const login = (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    // Find user by email (case-insensitive)
    let user = db.findOne('users', u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!user) {
      // Demo / development fallback if user is selecting demo role
      if (role) {
        user = db.findOne('users', u => u.role === role);
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // If password provided, compare with hash (allow bypass if password is 'password123' or during quick role preview)
    if (password) {
      const isMatch = bcrypt.compareSync(password, user.password) || password === 'password123';
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }
    }

    const token = generateToken(user);
    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

export const register = (req, res) => {
  try {
    const { name, email, password, role = 'patient', phone, bloodGroup, dob, address, emergencyContact } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = db.findOne('users', u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newId = `${role === 'doctor' ? 'doc_' : role === 'admin' ? 'adm_' : 'pat_'}${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser = {
      id: newId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role,
      phone: phone || '',
      bloodGroup: bloodGroup || 'O+',
      dob: dob || '',
      address: address || '',
      emergencyContact: emergencyContact || '',
      memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };

    db.insert('users', newUser);

    // If patient, initialize clinical record
    if (role === 'patient') {
      db.updateRecord(newId, {
        patientId: newId,
        fullName: newUser.name,
        dob: newUser.dob,
        gender: 'Not specified',
        bloodGroup: newUser.bloodGroup,
        phone: newUser.phone,
        email: newUser.email,
        allergies: [],
        chronicConditions: [],
        activeMedications: [],
        vitalsHistory: [],
        labReports: []
      });
    }

    const token = generateToken(newUser);
    const { password: _, ...safeUser } = newUser;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

export const getMe = (req, res) => {
  try {
    const user = db.findOne('users', u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const { password: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
};

export const updateProfile = (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address, emergencyContact, bloodGroup, dob } = req.body;

    db.update('users', u => u.id === userId, u => ({
      ...u,
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(emergencyContact !== undefined && { emergencyContact }),
      ...(bloodGroup !== undefined && { bloodGroup }),
      ...(dob !== undefined && { dob })
    }));

    // Update patient record if exists
    db.updateRecord(userId, rec => ({
      ...rec,
      ...(name && { fullName: name }),
      ...(phone !== undefined && { phone }),
      ...(bloodGroup !== undefined && { bloodGroup }),
      ...(dob !== undefined && { dob })
    }));

    const updated = db.findOne('users', u => u.id === userId);
    const { password: _, ...safeUser } = updated;

    res.json({ success: true, message: 'Profile updated successfully.', user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};
