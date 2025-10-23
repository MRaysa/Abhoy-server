const express = require('express');
const router = express.Router();

// Import all route modules
const userRoutes = require('./userRoutes');
const complaintRoutes = require('./complaintRoutes');
const authRoutes = require('./authRoutes');
const firebaseAuthRoutes = require('./firebaseAuthRoutes');
const chatRoutes = require('./chatRoutes');

// Mount routes
router.use('/users', userRoutes);
router.use('/complaints', complaintRoutes);
router.use('/auth', authRoutes);
router.use('/auth', firebaseAuthRoutes);
router.use('/chat', chatRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
