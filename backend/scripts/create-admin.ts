import * as admin from 'firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

const auth = admin.auth();
const db = getFirestore();

async function createAdminUser() {
  const email = process.argv[2] || 'admin@digitaliskole.lk';
  const password = process.argv[3] || 'Admin@123456';
  const displayName = process.argv[4] || 'System Administrator';

  try {
    console.log(`Creating admin user: ${email}`);

    // Create user in Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: true,
    });

    console.log(`✅ User created in Firebase Auth: ${userRecord.uid}`);

    // Create user document in Firestore
    const userData = {
      uid: userRecord.uid,
      email: userRecord.email,
      role: 'admin',
      profileId: `admin_${userRecord.uid}`,
      displayName,
      language: 'en',
      theme: 'light',
      fcmTokens: [],
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await db.collection('users').doc(userRecord.uid).set(userData);

    console.log(`✅ User document created in Firestore`);
    console.log(`\n📋 Admin User Details:`);
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: admin`);
    console.log(`\n⚠️  Save these credentials securely!`);
    console.log(`\nYou can now login at: POST /api/auth/login`);
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      console.error(`❌ Error: User with email ${email} already exists`);
      console.log(`\nTo update existing user, use Firebase Console or update the user document manually.`);
    } else {
      console.error('❌ Error creating admin user:', error.message);
    }
    process.exit(1);
  }
}

createAdminUser()
  .then(() => {
    console.log('\n✅ Admin user creation completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });


