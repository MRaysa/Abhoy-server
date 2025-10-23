const User = require('../models/User');
const { connectDB } = require('../config/database');

async function updateAdminWithFirebaseUID() {
  try {
    await connectDB();
    console.log('✅ Connected to database');

    const adminEmail = 'admin@safedesk.com';
    const firebaseUID = 'ZYMmqzGp0uQXs1eKvsQXJgkGaG53'; // From Firebase creation

    // Find and update admin user
    const admin = await User.findByEmail(adminEmail);
    
    if (admin) {
      await User.update(admin._id, {
        uid: firebaseUID,
        role: 'admin',
        isActive: true,
        displayName: 'SafeDesk Admin'
      });
      
      console.log('✅ Admin user updated successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:', admin.email);
      console.log('👤 Firebase UID:', firebaseUID);
      console.log('🔑 Role:', 'admin');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.log('⚠️  Admin user not found in database');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating admin:', error);
    process.exit(1);
  }
}

updateAdminWithFirebaseUID();
