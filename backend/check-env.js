/**
 * Quick script to check if .env file exists and has required variables
 * Run: node check-env.js
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const requiredVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_WEB_API_KEY',
  'JWT_SECRET',
];

console.log('🔍 Checking backend/.env file...\n');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found at:', envPath);
  console.log('\n📝 To fix this:');
  console.log('   1. Copy backend/.env.example to backend/.env');
  console.log('   2. Fill in your Firebase credentials');
  console.log('   3. Get credentials from: Firebase Console > Project Settings > Service Accounts');
  console.log('\n   Example:');
  console.log('   cp backend/.env.example backend/.env');
  process.exit(1);
}

console.log('✅ .env file exists');

// Try to load and check variables
require('dotenv').config({ path: envPath });

const missing = [];
const empty = [];

requiredVars.forEach((varName) => {
  const value = process.env[varName];
  if (!value) {
    missing.push(varName);
  } else if (value.trim() === '' || value === 'your-project-id' || value.includes('YOUR_')) {
    empty.push(varName);
  }
});

if (missing.length > 0 || empty.length > 0) {
  console.log('\n⚠️  Issues found:');
  
  if (missing.length > 0) {
    console.log('\n❌ Missing variables:');
    missing.forEach((v) => console.log(`   - ${v}`));
  }
  
  if (empty.length > 0) {
    console.log('\n⚠️  Variables with placeholder values:');
    empty.forEach((v) => console.log(`   - ${v}`));
  }
  
  console.log('\n📝 Please update backend/.env with your actual values');
  process.exit(1);
}

console.log('\n✅ All required environment variables are set!');
console.log('\n📋 Found variables:');
requiredVars.forEach((varName) => {
  const value = process.env[varName];
  if (varName === 'FIREBASE_PRIVATE_KEY') {
    console.log(`   ${varName}: ${value ? `✅ Set (${value.length} chars)` : '❌ Missing'}`);
  } else {
    console.log(`   ${varName}: ${value ? `✅ ${value.substring(0, 30)}...` : '❌ Missing'}`);
  }
});

console.log('\n✅ You can now run: npm run create-admin');
