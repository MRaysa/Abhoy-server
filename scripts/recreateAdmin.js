require('dotenv').config();

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyAA6YQ-L_VgJApFwVOvBUQWqNhco8qQgC0';

async function deleteAndRecreateAdmin() {
  try {
    console.log('🗑️  Deleting old admin from Firebase (if exists)...');
    console.log('⚠️  Note: We cannot delete via REST API without ID token.');
    console.log('');
    console.log('🔐 Creating fresh admin user in Firebase...');
    
    const { default: fetch } = await import('node-fetch');
    
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@safedesk.com',
          password: 'Admin1234@',
          displayName: 'SafeDesk Admin',
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Admin user created/updated successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email: admin@safedesk.com');
      console.log('🔑 Password: Admin1234@');
      console.log('👤 UID:', data.localId);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('✅ Try logging in now!');
      
      // Update MongoDB with new UID
      const User = require('../models/User');
      const { connectDB } = require('../config/database');
      
      await connectDB();
      const admin = await User.findByEmail('admin@safedesk.com');
      if (admin) {
        await User.update(admin._id, { uid: data.localId });
        console.log('✅ MongoDB updated with new UID');
      }
      
      process.exit(0);
    } else {
      if (data.error?.message === 'EMAIL_EXISTS') {
        console.log('⚠️  Email already exists in Firebase.');
        console.log('');
        console.log('Please go to Firebase Console and:');
        console.log('1. Go to Authentication > Users');
        console.log('2. Find admin@safedesk.com');
        console.log('3. Delete the user');
        console.log('4. Run this script again');
        console.log('');
        console.log('OR manually reset password to: Admin1234@');
        process.exit(1);
      } else {
        console.error('❌ Error:', data.error?.message || 'Unknown error');
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deleteAndRecreateAdmin();
