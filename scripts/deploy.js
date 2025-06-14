
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const mysql = require('mysql2/promise');

// Load environment variables
require('dotenv').config();

async function deploy() {
  console.log('🚀 Starting deployment process...');

  try {
    // Step 1: Build the frontend
    console.log('📦 Building frontend...');
    execSync('npm run build', { stdio: 'inherit' });

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
    console.log('   4. Login with: admin@yourdomain.com / Admin123!');
    console.log('   5. Configure AWS settings in admin panel');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

async function setupDatabase() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '3306'),
  };

  const connection = await mysql.createConnection(dbConfig);

  // Create database if it doesn't exist
  const dbName = process.env.DB_NAME || 'audit_tracker';
  await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await connection.execute(`USE \`${dbName}\``);

  // Run schema
  console.log('Creating database tables...');
  const schemaPath = path.join(__dirname, '../src/server/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const statements = schema.split(';').filter(stmt => stmt.trim());
  
  for (const statement of statements) {
    if (statement.trim()) {
      await connection.execute(statement);
    }
  }

  await connection.end();
}

async function runMigrations() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME || 'audit_tracker',
  };

  const connection = await mysql.createConnection(dbConfig);

  // Run AWS tables migration
  console.log('Adding AWS tables...');
  const migrationPath = path.join(__dirname, '../src/server/migrations/add-aws-tables.sql');
  const migration = fs.readFileSync(migrationPath, 'utf8');
  const statements = migration.split(';').filter(stmt => stmt.trim());
  
  for (const statement of statements) {
    if (statement.trim()) {
      try {
        await connection.execute(statement);
      } catch (error) {
        // Ignore "already exists" errors
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }
    }
  }

  await connection.end();
}

async function setupAdminUser() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME || 'audit_tracker',
  };

  const connection = await mysql.createConnection(dbConfig);

  // Check if admin user exists
  const [existing] = await connection.execute(
    'SELECT id FROM users WHERE email = ?',
    ['admin@yourdomain.com']
  );

  if (existing.length === 0) {
    const bcrypt = require('bcryptjs');
    const crypto = require('crypto');

    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    const userId = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const now = new Date().toISOString();
    const avatar = `https://ui-avatars.com/api/?name=Admin&background=8b5cf6&color=fff`;

    await connection.execute(
      `INSERT INTO users (id, name, email, password_hash, role, roles, avatar, password_expiry_date, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 90 DAY), ?, ?)`,
      [userId, 'Admin User', 'admin@yourdomain.com', hashedPassword, 'admin', JSON.stringify(['admin']), avatar, now, now]
    );

    console.log('✅ Admin user created successfully');
  } else {
    console.log('ℹ️ Admin user already exists');
  }

  await connection.end();
}

deploy();
