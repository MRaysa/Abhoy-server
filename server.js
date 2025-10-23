const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./config/database');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const logger = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - MUST be before other middleware
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://abhoy-rho.vercel.app',
      'https://abhoy.vercel.app',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000'
    ];

    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked CORS for origin:', origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database connection (for Vercel serverless)
let dbInitialized = false;
const initializeDB = async () => {
  if (!dbInitialized) {
    try {
      await connectDB();
      dbInitialized = true;
      console.log('Database initialized for serverless function');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }
};

// Middleware to ensure DB is connected before handling requests
app.use(async (req, res, next) => {
  try {
    await initializeDB();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Custom middleware
app.use(logger);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SafeDesk Server is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      chat: '/api/chat',
      complaints: '/api/complaints',
      lawyers: '/api/lawyers',
      health: '/api/health'
    }
  });
});

// API routes
app.use('/api', routes);

// Error handling middleware (must be after routes)
app.use(notFound);
app.use(errorHandler);

// For local development
if (process.env.NODE_ENV !== 'production') {
  const startServer = async () => {
    try {
      await connectDB();

      app.listen(PORT, () => {
        console.log(`\n========================================`);
        console.log(`🚀 Server Started Successfully!`);
        console.log(`========================================`);
        console.log(`📡 Server running on port: ${PORT}`);
        console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 Local: http://localhost:${PORT}`);
        console.log(`📋 API Docs: http://localhost:${PORT}/api/health`);
        console.log(`========================================\n`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  };

  startServer();
}

// Export for Vercel serverless
module.exports = app;
