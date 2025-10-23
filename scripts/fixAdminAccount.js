require('dotenv').config();

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyAA6YQ-L_VgJApFwVOvBUQWqNhco8qQgC0';

async function fixAdminAccount() {
  try {
    const { default: fetch } = await import('node-fetch');
    
    console.log('🔧 Fixing admin account in Firebase...\n');
    
    // Step 1: Try to sign in to verify if user exists and password works
    console.log('Step 1: Checking if admin@safedesk.com exists...');
    const testSignIn = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@safedesk.com',
          password: 'Admin1234@',
          returnSecureToken: true,
        }),
      }
    );

    const signInData = await testSignIn.json();

    if (testSignIn.ok) {
      console.log('✅ Admin account already works!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email: admin@safedesk.com');
      console.log('🔑 Password: Admin1234@');
      console.log('👤 UID:', signInData.localId);
      console.log('🔐 Token:', signInData.idToken?.substring(0, 20) + '...');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      // Update MongoDB
      await updateMongoDB(signInData.localId, signInData.email);
      
      console.log('✅ Everything is set up correctly!');
      console.log('👉 You can now login at: http://localhost:5174/signin');
      process.exit(0);
    }

    // Step 2: If sign-in failed, get user by email to get the UID
    console.log('⚠️  Password incorrect or user not found');
    console.log('\nStep 2: Looking up user by email...');
    
    const lookupResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: ['admin@safedesk.com'],
        }),
      }
    );

    const lookupData = await lookupResponse.json();

    if (lookupData.users && lookupData.users.length > 0) {
      const adminUser = lookupData.users[0];
      console.log('✅ Found user:', adminUser.email);
      console.log('👤 UID:', adminUser.localId);
      
      // Step 3: Delete the user with wrong password
      console.log('\nStep 3: User exists with wrong password. Need to delete and recreate...');
      console.log('❌ Cannot delete user via REST API (requires ID token)');
      console.log('\n📋 MANUAL STEPS REQUIRED:');
      console.log('1. Go to: https://console.firebase.google.com/project/safedesk-94b9b/authentication/users');
      console.log('2. Find: admin@safedesk.com');
      console.log('3. Click the 3-dot menu → "Delete account"');
      console.log('4. Run this script again');
      console.log('\n🔄 OR you can reset the password manually to: Admin1234@');
      process.exit(1);
    } else {
      // User doesn't exist, create it
      console.log('📝 User does not exist. Creating...\n');
      
      const createResponse = await fetch(
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

      const createData = await createResponse.json();

      if (createResponse.ok) {
        console.log('✅ Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email: admin@safedesk.com');
        console.log('🔑 Password: Admin1234@');
        console.log('👤 UID:', createData.localId);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        // Update MongoDB
        await updateMongoDB(createData.localId, createData.email);
        
        console.log('✅ Setup complete!');
        console.log('👉 You can now login at: http://localhost:5174/signin');
        process.exit(0);
      } else {
        console.error('❌ Error creating user:', createData.error?.message);
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

async function updateMongoDB(uid, email) {
  try {
    console.log('📦 Updating MongoDB...');
    const User = require('../models/User');
    const { connectDB } = require('../config/database');
    
    await connectDB();
    
    let admin = await User.findByEmail(email);
    
    if (admin) {
      await User.update(admin._id, {
        uid: uid,
        role: 'admin',
        isActive: true,
        displayName: 'SafeDesk Admin',
      });
      console.log('✅ MongoDB updated - user exists');
    } else {
      // Create admin in MongoDB
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin1234@', salt);
      
      await User.create({
        email: email,
        password: hashedPassword,
        displayName: 'SafeDesk Admin',
        uid: uid,
        role: 'admin',
        isActive: true,
        photoURL: '',
      });
      console.log('✅ MongoDB updated - user created');
    }
  } catch (error) {
    console.error('⚠️  MongoDB update failed:', error.message);
  }
}

fixAdminAccount();
