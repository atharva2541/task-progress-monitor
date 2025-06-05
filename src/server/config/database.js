
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'audit_tracker',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Function to initialize database and create test users
async function initializeDatabase() {
  try {
    console.log('Connecting to MySQL database...');
    
    // Create connection pool
    const pool = mysql.createPool(dbConfig);
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('Successfully connected to MySQL database');
    connection.release();
    
    // Create users table if it doesn't exist
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'maker', 'checker1', 'checker2') NOT NULL,
        roles JSON NOT NULL,
        avatar VARCHAR(255),
        last_otp VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Users table created or already exists');
    
    // Check if test users exist
    const [existingUsers] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE email IN (?, ?, ?, ?)',
      ['admin@test.com', 'maker@test.com', 'checker1@test.com', 'checker2@test.com']
    );
    
    if (existingUsers[0].count === 0) {
      console.log('Creating test users...');
      
      // Hash password for test users
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert test users
      const testUsers = [
        ['admin_test', 'Admin User', 'admin@test.com', hashedPassword, 'admin', '["admin"]'],
        ['maker_test', 'Maker User', 'maker@test.com', hashedPassword, 'maker', '["maker"]'],
        ['checker1_test', 'Checker1 User', 'checker1@test.com', hashedPassword, 'checker1', '["checker1"]'],
        ['checker2_test', 'Checker2 User', 'checker2@test.com', hashedPassword, 'checker2', '["checker2"]']
      ];
      
      for (const user of testUsers) {
        const [id, name, email, hash, role, roles] = user;
        const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff`;
        
        await pool.execute(
          'INSERT INTO users (id, name, email, password_hash, role, roles, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [id, name, email, hash, role, roles, avatar]
        );
      }
      
      console.log('Test users created successfully!');
      console.log('Test credentials:');
      console.log('Admin: admin@test.com / password123');
      console.log('Maker: maker@test.com / password123');
      console.log('Checker1: checker1@test.com / password123');
      console.log('Checker2: checker2@test.com / password123');
      console.log('OTP for all users: 123456');
    } else {
      console.log('Test users already exist');
    }
    
    return pool;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

module.exports = {
  dbConfig,
  initializeDatabase
};
