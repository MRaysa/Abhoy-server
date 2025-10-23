const User = require('../models/User');
const { connectDB } = require('../config/database');

// Admin credentials
const adminData = {
  email: 'admin@safedesk.com',
  password: 'Admin1234@',
  displayName: 'SafeDesk Admin',
  role: 'admin',
  photoURL: ''
};

async function createAdmin() {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Check if admin already exists
    const existingAdmin = await User.findByEmail(adminData.email);
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      
      // Update password and ensure admin role
      await User.update(existingAdmin._id, {
        password: adminData.password,
        role: 'admin',
        isActive: true
      });
      console.log('✅ Admin password and role updated!');
    } else {
      // Create new admin user
      const admin = await User.create(adminData);
      console.log('✅ Admin user created successfully!');
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
    }

    console.log('\n🎉 Admin account ready!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: admin@safedesk.com');
    console.log('🔑 Password: Admin1234@');
    console.log('👤 Role: admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
