require('dotenv').config();

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyAA6YQ-L_VgJApFwVOvBUQWqNhco8qQgC0';

async function createTestUser() {
  try {
    console.log('🔐 Creating test user in Firebase...');
    
    const { default: fetch } = await import('node-fetch');
    
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@safedesk.com',
          password: 'Test1234@',
          displayName: 'Test User',
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Test user created successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email: test@safedesk.com');
      console.log('🔑 Password: Test1234@');
      console.log('👤 UID:', data.localId);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('✅ Try logging in with this test user!');
      console.log('(This will be created as an employee user)\n');
      process.exit(0);
    } else {
      if (data.error?.message === 'EMAIL_EXISTS') {
        console.log('✅ Test user already exists!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email: test@safedesk.com');
        console.log('🔑 Password: Test1234@');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
        process.exit(0);
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

createTestUser();
