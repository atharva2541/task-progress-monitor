
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, queryOne } from '../../utils/db-connection';
import { generateToken } from '../middleware/auth';
import type { DbUser } from '../../types/database';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Login endpoint
router.post('/login', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    // Find user by email
    const user = await queryOne<DbUser>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    // Generate and store OTP (for testing, always use 123456)
    const otp = '123456';
    await query(
      'UPDATE users SET last_otp = ? WHERE id = ?',
      [otp, user.id]
    );

    // In production, you would send an actual email here
    console.log(`OTP for ${email}: ${otp}`);

    res.status(200).json({ 
      success: true, 
      message: 'OTP sent to your email',
      // In production, don't include OTP in response
      otp: otp // Only for testing
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// OTP verification endpoint
router.post('/verify-otp', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ success: false, message: 'Email and OTP are required' });
      return;
    }

    // Find user and verify OTP
    const user = await queryOne<DbUser>(
      'SELECT * FROM users WHERE email = ? AND last_otp = ?',
      [email, otp]
    );

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid OTP' });
      return;
    }

    // Clear the OTP after successful verification
    await query(
      'UPDATE users SET last_otp = NULL WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      role: user.role,
      roles: JSON.parse(user.roles)
    });

    res.status(200).json({ 
      success: true, 
      token,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get user profile endpoint
router.get('/me', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    const user = await queryOne<DbUser>(
      'SELECT id, name, email, role, roles, avatar FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roles: JSON.parse(user.roles),
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(403).json({ error: 'Invalid token' });
  }
});

// Create user endpoint (admin only)
router.post('/create-user', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { name, email, password, role, roles } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ success: false, message: 'All fields are required' });
      return;
    }

    // Check if user already exists
    const existingUser = await queryOne<DbUser>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      res.status(400).json({ success: false, message: 'User with this email already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate user ID
    const userId = `user_${Date.now()}`;
    const now = new Date().toISOString();
    
    // Generate avatar URL
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff`;

    // Insert user
    await query(
      `INSERT INTO users (id, name, email, password_hash, role, roles, avatar, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, email, hashedPassword, role, JSON.stringify(roles || [role]), avatar, now, now]
    );

    res.status(201).json({ success: true, message: 'User created successfully' });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update user endpoint (admin only)
router.put('/update-user/:id', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, role, roles } = req.body;

    const user = await queryOne<DbUser>('SELECT id FROM users WHERE id = ?', [id]);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const now = new Date().toISOString();
    
    await query(
      'UPDATE users SET name = ?, email = ?, role = ?, roles = ?, updated_at = ? WHERE id = ?',
      [name, email, role, JSON.stringify(roles || [role]), now, id]
    );

    res.status(200).json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete user endpoint (admin only)
router.delete('/delete-user/:id', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await queryOne<DbUser>('SELECT id FROM users WHERE id = ?', [id]);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    await query('DELETE FROM users WHERE id = ?', [id]);

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get all users endpoint (admin only)
router.get('/users', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const users = await query<DbUser>(
      'SELECT id, name, email, role, roles, avatar, created_at, updated_at FROM users'
    );

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roles: JSON.parse(user.roles),
      avatar: user.avatar,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
