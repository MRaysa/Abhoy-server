require('dotenv').config();

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyAA6YQ-L_VgJApFwVOvBUQWqNhco8qQgC0';

async function resetAdminPassword() {
  const adminEmail = 'admin@safedesk.com';
  const newPassword = 'Admin1234@';

  try {
    console.log('🔐 Resetting admin password in Firebase...');
    
    const { default: fetch } = await import('node-fetch');
    
    // First, get the user's ID token by signing in (to verify email exists)
    const signInResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail,
          password: 'Admin1234@', // Try current password
          returnSecureToken: true,
        }),
      }
    );

    const signInData = await signInResponse.json();

    if (signInResponse.ok) {
      console.log('✅ Password is already correct!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email: admin@safedesk.com');
      console.log('🔑 Password: Admin1234@');
      console.log('👤 UID:', signInData.localId);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('✅ You can login with these credentials!');
      process.exit(0);
    } else {
      // Password is wrong, user doesn't exist, or other error
      if (signInData.error?.message === 'EMAIL_NOT_FOUND') {
        console.log('❌ Admin user not found in Firebase!');
        console.log('Please run: pnpm run create-admin-firebase');
        process.exit(1);
      } else if (signInData.error?.message === 'INVALID_PASSWORD') {
        console.log('⚠️  Password is incorrect. Attempting to reset...');
        
        // Note: Firebase REST API doesn't support password reset without current password
        // We need to delete and recreate the user
        console.log('');
        console.log('❌ Cannot reset password via API without current password.');
        console.log('Please delete the admin user from Firebase Console and run:');
        console.log('   pnpm run create-admin-firebase');
        process.exit(1);
      } else {
        console.error('❌ Error:', signInData.error?.message || 'Unknown error');
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetAdminPassword();
