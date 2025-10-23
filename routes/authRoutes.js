const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, verifyToken } = require('../middleware/auth');

// Validation helpers
const validateEmail = (email) => {
  const re = /^\S+@\S+\.\S+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName, photoURL } = req.body;

    // Validate input
    if (!email || !password || !displayName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, password, and display name are required' 
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Create new user
    const userData = {
      email: email.toLowerCase(),
      password,
      displayName,
      photoURL: photoURL || '',
      role: 'employee' // Default role
    };

    const user = await User.create(userData);

    // Generate token
    const token = generateToken(user._id, user.role, user.email);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: User.sanitize(user),
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error registering user' 
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is deactivated. Please contact support.' 
      });
    }

    // Verify password
    const isPasswordValid = await User.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Update last login
    await User.updateLastLogin(user._id);

    // Generate token
    const token = generateToken(user._id, user.role, user.email);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: User.sanitize(user),
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error logging in' 
    });
  }
});

// Get current user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching profile' 
    });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { displayName, photoURL } = req.body;
    
    const updateData = {};
    if (displayName) updateData.displayName = displayName;
    if (photoURL !== undefined) updateData.photoURL = photoURL;

    const result = await User.update(req.user._id, updateData);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: User.sanitize(result)
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating profile' 
    });
  }
});

// Verify token endpoint
router.post('/verify', verifyToken, (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

// Google Sign-in (Firebase token verification)
router.post('/google-signin', async (req, res) => {
  try {
    const { email, displayName, photoURL, uid } = req.body;

    if (!email || !uid) {
      return res.status(400).json({
        success: false,
        message: 'Email and UID are required'
      });
    }

    // Check if user exists
    let user = await User.findByEmail(email);

    if (!user) {
      // Create new user for Google sign-in
      const userData = {
        email: email.toLowerCase(),
        displayName: displayName || email.split('@')[0],
        photoURL: photoURL || '',
        uid: uid,
        role: 'employee',
        isActive: true
      };

      user = await User.create(userData);
    } else {
      // Update last login
      await User.updateLastLogin(user._id);
    }

    // Generate token
    const token = generateToken(user._id, user.role, user.email);

    res.json({
      success: true,
      message: 'Google sign-in successful',
      data: {
        user: User.sanitize(user),
        token
      }
    });
  } catch (error) {
    console.error('Google sign-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Error with Google sign-in'
    });
  }
});

module.exports = router;
