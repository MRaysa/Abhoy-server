const express = require('express');
const router = express.Router();

// Import all route modules
const userRoutes = require('./userRoutes');
const complaintRoutes = require('./complaintRoutes');

// Mount routes
router.use('/users', userRoutes);
router.use('/complaints', complaintRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
