const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'safedesk_db';

// Debug flag: when true, allows connecting with invalid/inspect-intercepted TLS certs.
// WARNING: only use for local debugging. Never enable in production.
const allowInvalidCerts = process.env.MONGO_TLS_ALLOW_INVALID_CERTS === 'true';
// Optional server selection timeout (ms)
const serverSelectionTimeoutMS = parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS, 10) || 10000;

let client;
let db;

const connectDB = async () => {
  try {
    if (db) {
      return db;
    }

    const clientOptions = {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      serverSelectionTimeoutMS,
    };

    // Only add TLS options for MongoDB Atlas (production)
    if (uri.includes('mongodb+srv://') || uri.includes('mongodb.net')) {
      clientOptions.tls = true;
      clientOptions.tlsAllowInvalidCertificates = allowInvalidCerts;

      if (allowInvalidCerts) {
        console.warn('⚠️  MONGO_TLS_ALLOW_INVALID_CERTS is enabled — skipping TLS cert validation (debug only)');
      }
    }

    client = new MongoClient(uri, clientOptions);

    await client.connect();
    db = client.db("safe_desk");

    console.log('✅ Successfully connected to MongoDB!');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // print nested cause if present (useful for TLS/OpenSSL errors)
    if (error.cause) console.error('Cause:', error.cause);
    // don't exit here to let calling code handle process lifecycle if desired
    // but keep existing behavior for now for backward compatibility
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

const closeDB = async () => {
  if (client) {
    await client.close();
    console.log('Database connection closed');
  }
};

module.exports = { connectDB, getDB, closeDB };
