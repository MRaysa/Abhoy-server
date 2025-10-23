const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// Verify Firebase user and get/create backend user
router.post('/verify-firebase', async (req, res) => {
  try {
    const { uid, email } = req.body;

    if (!uid || !email) {
      return res.status(400).json({
        success: false,
        message: 'UID and email are required'
      });
    }

    // Find user by Firebase UID
    let user = await User.findByUid(uid);

    if (!user) {
      // Try to find by email
      user = await User.findByEmail(email);
      
      if (user) {
        // Update UID if found by email
        await User.update(user._id, { uid });
        user = await User.findByEmail(email);
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found in system'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Update last login
    await User.updateLastLogin(user._id);

    // Generate token
    const token = generateToken(user._id, user.role, user.email);

    res.json({
      success: true,
      message: 'User verified successfully',
      data: {
        user: User.sanitize(user),
        token
      }
    });
  } catch (error) {
    console.error('Firebase verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying Firebase user'
    });
  }
});

// Create user from Firebase authentication
router.post('/firebase-user', async (req, res) => {
  try {
    const { uid, email, displayName, photoURL } = req.body;

    if (!uid || !email) {
      return res.status(400).json({
        success: false,
        message: 'UID and email are required'
      });
    }

    // Check if user already exists
    let user = await User.findByUid(uid);
    if (!user) {
      user = await User.findByEmail(email);
    }

    if (user) {
      // User exists, just return token
      const token = generateToken(user._id, user.role, user.email);
      return res.json({
        success: true,
        data: {
          user: User.sanitize(user),
          token
        }
      });
    }

    // Create new user
    const userData = {
      uid,
      email: email.toLowerCase(),
      displayName: displayName || email.split('@')[0],
      photoURL: photoURL || '',
      role: 'employee', // Default role for new users
      isActive: true
    };

    const newUser = await User.create(userData);

    // Generate token
    const token = generateToken(newUser._id, newUser.role, newUser.email);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: User.sanitize(newUser),
        token
      }
    });
  } catch (error) {
    console.error('Firebase user creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user from Firebase'
    });
  }
});

module.exports = router;
