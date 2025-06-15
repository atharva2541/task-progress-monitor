
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function runMigrations() {
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
  const migrationPath = path.join(__dirname, '../../src/server/migrations/add-aws-tables.sql');
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
    const tempPasswordMigrationPath = path.join(__dirname, '../../src/server/migrations/add-temporary-password-fields.sql');
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
