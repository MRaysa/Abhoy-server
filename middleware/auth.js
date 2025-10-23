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
      console.log('❌ No token provided in request');
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    console.log('🔑 Token received:', token.substring(0, 20) + '...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token decoded successfully:', { userId: decoded.userId, email: decoded.email });
    
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      console.log('❌ User not found for ID:', decoded.userId);
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    if (!user.isActive) {
      console.log('❌ User is not active:', user.email);
      return res.status(401).json({ 
        success: false, 
        message: 'User account is not active' 
      });
    }

    req.user = User.sanitize(user);
    console.log('✅ User authenticated:', { email: user.email, role: user.role, uid: user.uid });
    next();
  } catch (error) {
    console.error('❌ Token verification error:', error.message);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token',
      error: error.message
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
