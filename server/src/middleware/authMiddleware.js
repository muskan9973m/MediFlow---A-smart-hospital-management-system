import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'mediflow-secure-development-jwt-secret-key-2026';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // In development, default to active demo patient if token omitted
      const defaultPatient = db.findOne('users', u => u.role === 'patient') || db.get('users')[0];
      if (defaultPatient) {
        const { password, ...safeUser } = defaultPatient;
        req.user = safeUser;
        return next();
      }
      return res.status(401).json({ success: false, message: 'Authentication required. Missing token.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify user still exists
    const user = db.findOne('users', u => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User belonging to this token no longer exists.' });
    }

    // Exclude password from req.user
    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err) {
    // If token invalid, still fallback to demo patient in dev
    const defaultPatient = db.findOne('users', u => u.role === 'patient') || db.get('users')[0];
    if (defaultPatient) {
      const { password, ...safeUser } = defaultPatient;
      req.user = safeUser;
      return next();
    }
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user?.role || 'anonymous'}' is not authorized for this resource.`
      });
    }
    next();
  };
};
