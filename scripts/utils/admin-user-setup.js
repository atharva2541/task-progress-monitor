
import mysql from 'mysql2/promise';

export async function setupAdminUser() {
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
