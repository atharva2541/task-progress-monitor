
// MySQL database connection utility
import mysql from 'mysql2/promise';

// Connection pool for MySQL database
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'audit_tracker',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;

// Helper for executing queries with error handling
export const query = async <T>(sql: string, params?: any[]): Promise<T[]> => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Helper for single item operations
export const queryOne = async <T>(sql: string, params?: any[]): Promise<T | null> => {
  const results = await query<T>(sql, params);
  return results.length > 0 ? results[0] : null;
};

// Helper for insert operations that returns the inserted ID
export const insert = async (sql: string, params?: any[]): Promise<string | number> => {
  try {
    const [result] = await pool.execute(sql, params);
    return (result as mysql.ResultSetHeader).insertId || '';
  } catch (error) {
    console.error('Database insert error:', error);
    throw error;
  }
};

// Helper for update operations that returns the number of affected rows
export const update = async (sql: string, params?: any[]): Promise<number> => {
  try {
    const [result] = await pool.execute(sql, params);
    return (result as mysql.ResultSetHeader).affectedRows;
  } catch (error) {
    console.error('Database update error:', error);
    throw error;
  }
};

// Helper to begin a transaction
export const beginTransaction = async () => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  return connection;
};

// Helper to commit a transaction
export const commitTransaction = async (connection: mysql.PoolConnection) => {
  await connection.commit();
  connection.release();
};

// Helper to rollback a transaction
export const rollbackTransaction = async (connection: mysql.PoolConnection) => {
  await connection.rollback();
  connection.release();
};

// Function to test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};
