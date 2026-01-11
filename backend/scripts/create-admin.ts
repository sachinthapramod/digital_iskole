import * as admin from 'firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Validate environment variables before initializing Firebase
const requiredEnvVars = {
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Error: Missing required environment variables:');
  missingVars.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.error('\n📝 Please create a .env file in the backend/ directory with the following variables:');
  console.error('   FIREBASE_PROJECT_ID=your-project-id');
  console.error('   FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com');
  console.error('   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"');
  console.error('\nSee SETUP-AND-DEPLOYMENT.md for detailed instructions.');
  process.exit(1);
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  };

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error: any) {
    console.error('❌ Error initializing Firebase Admin SDK:');
    console.error(`   ${error.message}`);
    console.error('\n💡 Tips:');
    console.error('   1. Check that your .env file is in the backend/ directory');
    console.error('   2. Verify FIREBASE_PRIVATE_KEY includes the full key with \\n newlines');
    console.error('   3. Ensure FIREBASE_PROJECT_ID matches your Firebase project');
    process.exit(1);
  }
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


