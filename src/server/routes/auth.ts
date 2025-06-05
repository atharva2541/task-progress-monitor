
import express from 'express';
import bcrypt from 'bcryptjs';
import { query, queryOne } from '../../utils/db-connection';
import { generateToken, authenticateToken, isAdmin } from '../middleware/auth';
import type { DbUser } from '../../types/database';
import crypto from 'crypto';
import { sendOtpEmail } from '../../utils/aws-ses';

const router = express.Router();

// Login with email and password
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

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    // Generate a 6-digit OTP
    const otp = '123456'; // Fixed OTP for testing
    
    // Update the user's last OTP in the database
    await query(
      'UPDATE users SET last_otp = ? WHERE id = ?',
      [otp, user.id]
    );

    // Send OTP email (for real deployment, remove the console.log)
    try {
      await sendOtpEmail(email, otp, user.name);
      console.log(`OTP for ${email}: ${otp}`); // For testing purposes
    } catch (emailError) {
      console.error('Email Error:', emailError);
      // For testing, we'll continue even if email fails
      console.log(`OTP for ${email}: ${otp}`);
    }

    res.status(200).json({ 
      success: true, 
      message: 'OTP sent to your email address' 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Verify OTP endpoint
router.post('/verify-otp', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ success: false, message: 'Email and OTP are required' });
      return;
    }

    // Find user by email
    const user = await queryOne<DbUser>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Verify OTP
    if (user.last_otp !== otp) {
      res.status(401).json({ success: false, message: 'Invalid OTP' });
      return;
    }

    // Parse the roles from the JSON string
    const roles = JSON.parse(user.roles);

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      role: user.role,
      roles: roles,
    });

    // Clear the OTP from the database
    await query(
      'UPDATE users SET last_otp = NULL WHERE id = ?',
      [user.id]
    );

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

// Get current user profile endpoint
router.get('/me', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const user = await queryOne<DbUser>(
      'SELECT id, name, email, role, roles, avatar FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Parse the roles from the JSON string
    const roles = JSON.parse(user.roles);

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roles: roles,
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get all users (admin only)
router.get('/users', authenticateToken, isAdmin, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const users = await query<DbUser>(
      'SELECT id, name, email, role, roles, avatar, created_at FROM users'
    );

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roles: JSON.parse(user.roles),
      avatar: user.avatar,
      createdAt: user.created_at
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Create user (admin only)
router.post('/create-user', authenticateToken, isAdmin, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { name, email, password, role, roles } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ success: false, message: 'Name, email, password, and role are required' });
      return;
    }

    // Check if email already exists
    const existingUser = await queryOne<DbUser>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      res.status(409).json({ success: false, message: 'Email already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate user ID
    const userId = `user_${Date.now()}`;

    // Insert user
    await query(
      'INSERT INTO users (id, name, email, password_hash, role, roles, avatar, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
        name,
        email,
        hashedPassword,
        role,
        JSON.stringify(roles || [role]),
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff`,
        new Date().toISOString()
      ]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: userId,
        name,
        email,
        role,
        roles: roles || [role]
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update user (admin only)
router.put('/update-user/:id', authenticateToken, isAdmin, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, role, roles } = req.body;

    // Check if user exists
    const user = await queryOne<DbUser>(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Update user
    await query(
      'UPDATE users SET name = ?, email = ?, role = ?, roles = ? WHERE id = ?',
      [name, email, role, JSON.stringify(roles || [role]), id]
    );

    res.status(200).json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete user (admin only)
router.delete('/delete-user/:id', authenticateToken, isAdmin, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await queryOne<DbUser>(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Delete user
    await query(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
