
import dotenv from 'dotenv';
import { buildFrontend } from './utils/build-utils.js';
import { setupDatabase } from './utils/database-setup.js';
import { runMigrations } from './utils/migration-runner.js';
import { setupAdminUser } from './utils/admin-user-setup.js';

// Load environment variables
dotenv.config();

async function deploy() {
  console.log('🚀 Starting deployment process...');

  try {
    // Step 1: Build the frontend
    buildFrontend();

    // Step 2: Setup database
    console.log('🗄️ Setting up database...');
    await setupDatabase();

    // Step 3: Run migrations
    console.log('🔄 Running database migrations...');
    await runMigrations();

    // Step 4: Initialize admin user if needed
    console.log('👤 Setting up admin user...');
    await setupAdminUser();

    console.log('✅ Deployment completed successfully!');
    console.log('');
    console.log('🎉 Your application is ready!');
    console.log('📋 Next steps:');
    console.log('   1. Update your .env file with actual values');
    console.log('   2. Run: npm run start:production');
    console.log('   3. Visit: http://localhost:5000');
    console.log('   4. Login with: atharva.kale@sbfc.com / Admin123!');
    console.log('   5. Configure AWS settings in admin panel');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deploy();
