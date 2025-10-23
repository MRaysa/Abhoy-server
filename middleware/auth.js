const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Secret key for JWT (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'safedesk-secret-key-change-in-production-2024';

// Generate JWT token
const generateToken = (userId, role, email) => {
  return jwt.sign(
    { userId: userId.toString(), role, email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Verify JWT token middleware
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token or user not active' 
      });
    }

    req.user = User.sanitize(user);
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin only.' 
    });
  }
};

module.exports = {
  generateToken,
  verifyToken,
  isAdmin,
  JWT_SECRET
};
