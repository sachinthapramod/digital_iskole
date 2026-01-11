/**
 * Verify FIREBASE_WEB_API_KEY is correctly set
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const apiKey = process.env.FIREBASE_WEB_API_KEY;

console.log('🔍 Checking FIREBASE_WEB_API_KEY...\n');

if (!apiKey) {
  console.error('❌ FIREBASE_WEB_API_KEY is not set in .env file');
  console.log('\n📝 To fix:');
  console.log('   1. Open backend/.env');
  console.log('   2. Add: FIREBASE_WEB_API_KEY=your-api-key');
  console.log('   3. Make sure there are NO quotes around the value');
  console.log('   4. Make sure there are NO spaces around the = sign');
  process.exit(1);
}

if (apiKey.trim() !== apiKey) {
  console.warn('⚠️  FIREBASE_WEB_API_KEY has leading/trailing spaces');
  console.log(`   Value: "${apiKey}"`);
  console.log('   Fixed: ', apiKey.trim());
}

if (apiKey.startsWith('"') || apiKey.startsWith("'")) {
  console.warn('⚠️  FIREBASE_WEB_API_KEY appears to have quotes');
  console.log(`   Value: ${apiKey}`);
  console.log('   Make sure to remove quotes from .env file');
}

console.log(`✅ FIREBASE_WEB_API_KEY is set: ${apiKey.substring(0, 20)}...`);
console.log(`   Length: ${apiKey.length} characters`);
console.log(`   Starts with: ${apiKey.substring(0, 7)}`);
console.log('\n✅ Environment variable is correctly configured!');
