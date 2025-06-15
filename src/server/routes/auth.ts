import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, queryOne } from '../../utils/db-connection';
import { generateToken, authenticateToken } from '../middleware/auth';
import { sendPasswordResetEmail } from '../../utils/auth-helpers';
import type { DbUser } from '../../types/database';
import crypto from 'crypto';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET === 'your-secret-key-change-in-production') {
  throw new Error('JWT_SECRET environment variable must be set to a secure random string');
}

// Generate secure 6-digit OTP
const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

// Login endpoint
router.post('/login', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({ success: false, message: 'Invalid input format' });
      return;
    }

    // Find user by email
    const user = await queryOne<DbUser>(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase()]
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

    // Generate secure OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP with expiry
    await query(
      'UPDATE users SET last_otp = ?, otp_expiry = ? WHERE id = ?',
      [otp, otpExpiry.toISOString(), user.id]
    );

    // Send OTP via email
    try {
      await sendPasswordResetEmail(user.email, user.name, otp);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      res.status(500).json({ success: false, message: 'Failed to send verification code' });
      return;
    }

    res.status(200).json({ 
      success: true, 
      message: 'Verification code sent to your email'
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

    // Input validation
    if (!email || !otp) {
      res.status(400).json({ success: false, message: 'Email and OTP are required' });
      return;
    }

    if (typeof email !== 'string' || typeof otp !== 'string') {
      res.status(400).json({ success: false, message: 'Invalid input format' });
      return;
    }

    // Find user and verify OTP with expiry check
    const user = await queryOne<DbUser>(
      'SELECT * FROM users WHERE email = ? AND last_otp = ? AND otp_expiry > NOW()',
      [email.toLowerCase(), otp]
    );

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
      return;
    }

    // Clear the OTP after successful verification
    await query(
      'UPDATE users SET last_otp = NULL, otp_expiry = NULL WHERE id = ?',
      [user.id]
    );

    // Check if this is first login
    const requiresPasswordChange = user.is_first_login;

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      role: user.role,
      roles: JSON.parse(user.roles)
    });

    res.status(200).json({ 
      success: true, 
      token,
      requiresPasswordChange,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Change password endpoint (for first-time users)
router.post('/change-password', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { newPassword } = req.body;
    const userId = req.user!.id;

    // Input validation
    if (!newPassword) {
      res.status(400).json({ success: false, message: 'New password is required' });
      return;
    }

    // Password complexity validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' 
      });
      return;
    }

    // Get user to check if first login
    const user = await queryOne<DbUser>(
      'SELECT is_first_login FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const now = new Date().toISOString();

    // Update password and mark first login as complete
    await query(
      'UPDATE users SET password_hash = ?, is_first_login = FALSE, updated_at = ? WHERE id = ?',
      [hashedPassword, now, userId]
    );

    res.status(200).json({ 
      success: true, 
      message: 'Password changed successfully' 
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get user profile endpoint
router.get('/me', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const user = await queryOne<DbUser>(
      'SELECT id, name, email, role, roles, avatar FROM users WHERE id = ?',
      [req.user!.id]
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
router.post('/create-user', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    // Check admin privileges
    if (req.user!.role !== 'admin' && !req.user!.roles.includes('admin')) {
      res.status(403).json({ success: false, message: 'Admin privileges required' });
      return;
    }

    const { name, email, password, role, roles } = req.body;

    // Input validation
    if (!name || !email || !password || !role) {
      res.status(400).json({ success: false, message: 'Name, email, password, and role are required' });
      return;
    }

    // Password complexity validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' 
      });
      return;
    }

    // Check if user already exists
    const existingUser = await queryOne<DbUser>(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (existingUser) {
      res.status(400).json({ success: false, message: 'User with this email already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Generate user ID
    const userId = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const now = new Date().toISOString();
    
    // Generate avatar URL
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff`;

    // Insert user with is_first_login = TRUE
    await query(
      `INSERT INTO users (id, name, email, password_hash, role, roles, avatar, is_first_login, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?)`,
      [userId, name, email.toLowerCase(), hashedPassword, role, JSON.stringify(roles || [role]), avatar, now, now]
    );

    res.status(201).json({ success: true, message: 'User created successfully' });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update user endpoint (admin only for role changes)
router.put('/update-user/:id', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, role, roles } = req.body;

    // Check if user is admin or updating their own non-role data
    const isAdmin = req.user!.role === 'admin' || req.user!.roles.includes('admin');
    const isSelfUpdate = req.user!.id === id;

    if (!isAdmin && !isSelfUpdate) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    // Only admins can change roles
    if ((role || roles) && !isAdmin) {
      res.status(403).json({ success: false, message: 'Only administrators can change user roles' });
      return;
    }

    const user = await queryOne<DbUser>('SELECT id FROM users WHERE id = ?', [id]);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const now = new Date().toISOString();
    
    await query(
      'UPDATE users SET name = ?, email = ?, role = ?, roles = ?, updated_at = ? WHERE id = ?',
      [name, email?.toLowerCase(), role, JSON.stringify(roles || [role]), now, id]
    );

    res.status(200).json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete user endpoint (admin only)
router.delete('/delete-user/:id', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    // Check admin privileges
    if (req.user!.role !== 'admin' && !req.user!.roles.includes('admin')) {
      res.status(403).json({ success: false, message: 'Admin privileges required' });
      return;
    }

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
router.get('/users', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    // Check admin privileges
    if (req.user!.role !== 'admin' && !req.user!.roles.includes('admin')) {
      res.status(403).json({ error: 'Admin privileges required' });
      return;
    }

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
