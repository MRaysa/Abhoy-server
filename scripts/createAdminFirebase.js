require('dotenv').config();

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyAA6YQ-L_VgJApFwVOvBUQWqNhco8qQgC0';

async function createAdminInFirebase() {
  const adminData = {
    email: 'admin@safedesk.com',
    password: 'Admin1234@',
    displayName: 'SafeDesk Admin',
    returnSecureToken: true
  };

  try {
    console.log('🔐 Creating admin user in Firebase...');
    
    const { default: fetch } = await import('node-fetch');
    
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: adminData.email,
          password: adminData.password,
          displayName: adminData.displayName,
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Admin user created successfully in Firebase!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:', adminData.email);
      console.log('🔑 Password:', adminData.password);
      console.log('👤 UID:', data.localId);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('✅ You can now login with these credentials!');
      process.exit(0);
    } else {
      if (data.error?.message === 'EMAIL_EXISTS') {
        console.log('⚠️  Admin user already exists in Firebase!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:', adminData.email);
        console.log('🔑 Password:', adminData.password);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('✅ You can login with these credentials!');
        process.exit(0);
      } else {
        console.error('❌ Firebase Error:', data.error?.message || 'Unknown error');
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdminInFirebase();
