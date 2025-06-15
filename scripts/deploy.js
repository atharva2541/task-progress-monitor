
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

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
    console.log('   4. Login with: atharva.kale@sbfc.com / Admin123!');
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
    multipleStatements: true
  };

  const connection = await mysql.createConnection(dbConfig);

  // Create database if it doesn't exist
  const dbName = process.env.DB_NAME || 'audit_tracker';
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await connection.query(`USE \`${dbName}\``);

  // Run schema
  console.log('Creating database tables...');
  const schemaPath = path.join(__dirname, '../src/server/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Clean and parse statements
  const statements = schema
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt && !stmt.startsWith('--') && !stmt.startsWith('/*'));
  
  for (const statement of statements) {
    if (statement.trim()) {
      try {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await connection.query(statement);
      } catch (error) {
        // Ignore "already exists" errors but log others
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`ℹ️ Skipping: ${error.message}`);
        } else {
          console.error(`⚠️ Error executing statement: ${error.message}`);
          throw error;
        }
      }
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
    multipleStatements: true
  };

  const connection = await mysql.createConnection(dbConfig);

  // Run AWS tables migration
  console.log('Adding AWS tables...');
  const migrationPath = path.join(__dirname, '../src/server/migrations/add-aws-tables.sql');
  const migration = fs.readFileSync(migrationPath, 'utf8');
  
  // Clean and parse statements
  const statements = migration
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt && !stmt.startsWith('--') && !stmt.startsWith('/*'));
  
  for (const statement of statements) {
    if (statement.trim()) {
      try {
        console.log(`Executing migration: ${statement.substring(0, 50)}...`);
        await connection.query(statement);
      } catch (error) {
        // Ignore "already exists" errors but log others
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`ℹ️ Migration already applied: ${error.message}`);
        } else {
          console.error(`⚠️ Migration error: ${error.message}`);
          // Don't throw here - migrations might partially exist
        }
      }
    }
  }

  // Run temporary password migration if exists
  try {
    const tempPasswordMigrationPath = path.join(__dirname, '../src/server/migrations/add-temporary-password-fields.sql');
    if (fs.existsSync(tempPasswordMigrationPath)) {
      console.log('Adding temporary password fields...');
      const tempPasswordMigration = fs.readFileSync(tempPasswordMigrationPath, 'utf8');
      const tempStatements = tempPasswordMigration
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt && !stmt.startsWith('--') && !stmt.startsWith('/*'));
      
      for (const statement of tempStatements) {
        if (statement.trim()) {
          try {
            await connection.query(statement);
          } catch (error) {
            if (error.message.includes('already exists') || error.message.includes('duplicate')) {
              console.log(`ℹ️ Temporary password fields already exist`);
            } else {
              console.error(`⚠️ Temporary password migration error: ${error.message}`);
            }
          }
        }
      }
    }
  } catch (error) {
    console.log('ℹ️ Temporary password migration file not found, skipping...');
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
    ['atharva.kale@sbfc.com']
  );

  if (existing.length === 0) {
    // Dynamic imports for modules that might not be available
    const bcrypt = await import('bcryptjs');
    const crypto = await import('crypto');

    const hashedPassword = await bcrypt.default.hash('Admin123!', 12);
    const userId = `user_${Date.now()}_${crypto.default.randomBytes(4).toString('hex')}`;
    const now = new Date().toISOString();
    const avatar = `https://ui-avatars.com/api/?name=Admin&background=8b5cf6&color=fff`;

    await connection.execute(
      `INSERT INTO users (id, name, email, password_hash, role, roles, avatar, password_expiry_date, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 90 DAY), ?, ?)`,
      [userId, 'Admin User', 'atharva.kale@sbfc.com', hashedPassword, 'admin', JSON.stringify(['admin']), avatar, now, now]
    );

    console.log('✅ Admin user created successfully');
  } else {
    console.log('ℹ️ Admin user already exists');
  }

  await connection.end();
}

deploy();
