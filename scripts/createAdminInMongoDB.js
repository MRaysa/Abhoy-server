require('dotenv').config();
const User = require('../models/User');
const { connectDB } = require('../config/database');

async function createAdminInMongoDB() {
  try {
    console.log('🔧 Creating admin user in MongoDB...\n');

    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Firebase UID from the latest creation
    const firebaseUID = 'ZXVCpQSFx1YONgjfU21l0rIBXuk2';
    const adminEmail = 'admin@safedesk.com';

    // Check if user exists by email
    let admin = await User.findByEmail(adminEmail);

    if (admin) {
      console.log('📝 User exists in MongoDB with email:', admin.email);
      console.log('Current UID:', admin.uid);
      console.log('Current Role:', admin.role);
      
      // Update the user to ensure it has the correct Firebase UID and role
      await User.update(admin._id, {
        uid: firebaseUID,
        role: 'admin',
        isActive: true,
        displayName: 'SafeDesk Admin',
      });

      console.log('\n✅ Updated existing user to admin');
    } else {
      // Check if user exists by UID
      admin = await User.findByUid(firebaseUID);

      if (admin) {
        console.log('📝 User exists in MongoDB with UID:', admin.uid);
        console.log('Current Email:', admin.email);
        console.log('Current Role:', admin.role);

        // Update to ensure email matches
        await User.update(admin._id, {
          email: adminEmail,
          role: 'admin',
          isActive: true,
          displayName: 'SafeDesk Admin',
        });

        console.log('\n✅ Updated existing user to admin');
      } else {
        // Create new admin user
        console.log('📝 Creating new admin user...\n');

        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin1234@', salt);

        const newAdmin = await User.create({
          email: adminEmail,
          password: hashedPassword,
          displayName: 'SafeDesk Admin',
          uid: firebaseUID,
          role: 'admin',
          isActive: true,
          photoURL: '',
        });

        console.log('✅ Admin user created in MongoDB');
        console.log('_id:', newAdmin._id);
      }
    }

    // Verify the final state
    const finalAdmin = await User.findByEmail(adminEmail);
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', finalAdmin.email);
    console.log('👤 Firebase UID:', finalAdmin.uid);
    console.log('🎯 Role:', finalAdmin.role);
    console.log('✅ Active:', finalAdmin.isActive);
    console.log('👤 Display Name:', finalAdmin.displayName);
    console.log('🆔 MongoDB _id:', finalAdmin._id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ Setup complete!');
    console.log('👉 You can now login at: http://localhost:5174/signin');
    console.log('📧 Email: admin@safedesk.com');
    console.log('🔑 Password: Admin1234@');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createAdminInMongoDB();
