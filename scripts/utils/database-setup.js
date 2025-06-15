
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
  
  // Parse SQL statements and separate table creation from indexes
  const allStatements = schema
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt && !stmt.startsWith('--') && !stmt.startsWith('/*'));
  
  // Separate CREATE TABLE statements from other statements
  const createTableStatements = [];
  const otherStatements = [];
  
  for (const statement of allStatements) {
    if (statement.trim()) {
      const upperStatement = statement.toUpperCase();
      if (upperStatement.includes('CREATE TABLE')) {
        createTableStatements.push(statement);
      } else if (upperStatement.includes('CREATE INDEX') || 
                 upperStatement.includes('ALTER TABLE') ||
                 upperStatement.includes('INSERT INTO')) {
        otherStatements.push(statement);
      }
    }
  }
  
  // Execute CREATE TABLE statements first
  console.log('Creating tables...');
  for (const statement of createTableStatements) {
    try {
      console.log(`Creating table: ${statement.substring(0, 50)}...`);
      await connection.query(statement);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`ℹ️ Table already exists, skipping...`);
      } else {
        console.error(`⚠️ Error creating table: ${error.message}`);
        throw error;
      }
    }
  }
  
  // Execute other statements (indexes, etc.) after tables are created
  console.log('Creating indexes and constraints...');
  for (const statement of otherStatements) {
    try {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await connection.query(statement);
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
