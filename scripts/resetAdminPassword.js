const User = require('../models/User');
const { connectDB } = require('../config/database');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  try {
    await connectDB();
    console.log('✅ Connected to database');

    const adminEmail = 'admin@safedesk.com';
    const newPassword = 'Admin1234@';

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Find admin user
    const admin = await User.findByEmail(adminEmail);
    
    if (admin) {
      // Update password directly
      const { getDB } = require('../config/database');
      const db = getDB();
      
      await db.collection('users').updateOne(
        { email: adminEmail },
        { 
          $set: { 
            password: hashedPassword,
            role: 'admin',
            uid: 'ZYMmqzGp0uQXs1eKvsQXJgkGaG53',
            isActive: true,
            displayName: 'SafeDesk Admin',
            updatedAt: new Date()
          } 
        }
      );
      
      console.log('✅ Admin password reset successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email: admin@safedesk.com');
      console.log('🔑 Password: Admin1234@');
      console.log('👤 Role: admin');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('✅ You can now login!');
    } else {
      console.log('⚠️  Admin user not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetAdminPassword();
