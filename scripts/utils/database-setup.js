
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function setupDatabase() {
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
  const schemaPath = path.join(__dirname, '../../src/server/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Split by semicolon and clean up statements
  const statements = schema
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt && !stmt.startsWith('--') && !stmt.startsWith('/*'));
  
  // Separate CREATE TABLE statements from other statements
  const createTableStatements = [];
  const otherStatements = [];
  
  for (const statement of statements) {
    if (statement.trim()) {
      // Normalize whitespace and check for CREATE TABLE
      const normalizedStatement = statement.replace(/\s+/g, ' ').toUpperCase();
      if (normalizedStatement.includes('CREATE TABLE')) {
        createTableStatements.push(statement);
        console.log(`Found CREATE TABLE statement: ${statement.substring(0, 50)}...`);
      } else if (normalizedStatement.includes('CREATE INDEX') || 
                 normalizedStatement.includes('ALTER TABLE') ||
                 normalizedStatement.includes('INSERT INTO')) {
        otherStatements.push(statement);
      }
    }
  }
  
  console.log(`Found ${createTableStatements.length} CREATE TABLE statements`);
  console.log(`Found ${otherStatements.length} other statements`);
  
  // Execute CREATE TABLE statements first
  console.log('Creating tables...');
  for (let i = 0; i < createTableStatements.length; i++) {
    const statement = createTableStatements[i];
    try {
      console.log(`Creating table ${i + 1}/${createTableStatements.length}: ${statement.substring(0, 50)}...`);
      await connection.query(statement);
      console.log(`✅ Table created successfully`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`ℹ️ Table already exists, skipping...`);
      } else {
        console.error(`❌ Error creating table: ${error.message}`);
        throw error;
      }
    }
  }
  
  // Execute other statements (indexes, etc.) after tables are created
  console.log('Creating indexes and constraints...');
  for (let i = 0; i < otherStatements.length; i++) {
    const statement = otherStatements[i];
    try {
      console.log(`Executing ${i + 1}/${otherStatements.length}: ${statement.substring(0, 50)}...`);
      await connection.query(statement);
      console.log(`✅ Statement executed successfully`);
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log(`ℹ️ Already exists, skipping: ${error.message}`);
      } else {
        console.error(`⚠️ Error executing statement: ${error.message}`);
        // Don't throw here for indexes - they might already exist
      }
    }
  }

  await connection.end();
}
