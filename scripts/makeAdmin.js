const User = require('../models/User');
const { connectDB } = require('../config/database');

async function makeUserAdmin() {
  const email = process.argv[2] || 'test@safedesk.com';
  
  try {
    await connectDB();
    console.log('✅ Connected to database');

    const user = await User.findByEmail(email);
    
    if (user) {
      await User.update(user._id, { role: 'admin' });
      console.log('✅ User upgraded to admin!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:', email);
      console.log('👤 Role: admin');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.log('❌ User not found in database');
      console.log('The user must login at least once to be created in the database.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

makeUserAdmin();
