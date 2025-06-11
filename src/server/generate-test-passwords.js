
const bcrypt = require('bcryptjs');

async function generatePasswordHashes() {
  const password = 'password123';
  const saltRounds = 10;
  
  console.log('Generating password hashes for test users...\n');
  console.log('Password for all test users:', password);
  
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('Bcrypt hash:', hash);
  
  console.log('\nTest user credentials:');
  console.log('Admin: admin@test.com / password123');
  console.log('Maker: maker@test.com / password123');
  console.log('Checker1: checker1@test.com / password123');
  console.log('Checker2: checker2@test.com / password123');
  console.log('\nOTP for all users: 123456');
}

generatePasswordHashes().catch(console.error);
