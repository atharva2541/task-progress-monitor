
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

  // List of migration files to run
  const migrations = [
    'add-aws-tables.sql',
    'add-temporary-password-fields.sql',
    'add-system-settings.sql'
  ];

  for (const migrationFile of migrations) {
    try {
      const migrationPath = path.join(__dirname, `../../src/server/migrations/${migrationFile}`);
      
      if (fs.existsSync(migrationPath)) {
        console.log(`Running migration: ${migrationFile}...`);
        const migration = fs.readFileSync(migrationPath, 'utf8');
        
        // Clean and parse statements
        const statements = migration
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt && !stmt.startsWith('--') && !stmt.startsWith('/*'));
        
        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await connection.query(statement);
            } catch (error) {
              // Ignore "already exists" errors but log others
              if (error.message.includes('already exists') || error.message.includes('duplicate')) {
                console.log(`ℹ️ ${migrationFile}: Already applied`);
              } else {
                console.error(`⚠️ ${migrationFile} error: ${error.message}`);
              }
            }
          }
        }
        console.log(`✅ ${migrationFile}: Completed`);
      } else {
        console.log(`ℹ️ ${migrationFile}: File not found, skipping...`);
      }
    } catch (error) {
      console.error(`❌ Error running migration ${migrationFile}:`, error);
    }
  }

  await connection.end();
}
