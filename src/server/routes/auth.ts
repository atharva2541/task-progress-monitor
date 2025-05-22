
import express from 'express';
import bcrypt from 'bcryptjs';
import { query, queryOne } from '../../utils/db-connection';
import { generateToken, authenticateToken } from '../middleware/auth';
import { DbUser } from '../../types/database';
import crypto from 'crypto';

const router = express.Router();

// Request OTP endpoint
router.post('/request-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = await queryOne<DbUser>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In a real app, we would hash the OTP before storing it
    const hashedOtp = otp; // In production, this would be hashed

    // Update the user's last OTP in the database
    await query(
      'UPDATE users SET last_otp = ? WHERE id = ?',
      [hashedOtp, user.id]
    );

    // In a real app, we would send an email with the OTP
    console.log(`OTP for ${email}: ${otp}`);

    return res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('OTP request error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify OTP endpoint
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Find user by email
    const user = await queryOne<DbUser>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify OTP
    if (user.last_otp !== otp) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    // Check if password has expired or if it's first login
    const passwordExpired = new Date(user.password_expiry_date) < new Date();
    const isFirstLogin = user.is_first_login;

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

    return res.status(200).json({
      token,
      passwordExpired,
      isFirstLogin,
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password endpoint
router.post('/reset-password', authenticateToken, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'User ID and new password are required' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Set new password expiry date to 90 days from now
    const newExpiryDate = new Date();
    newExpiryDate.setDate(newExpiryDate.getDate() + 90);

    // Update the user's password in the database
    await query(
      'UPDATE users SET password_hash = ?, password_expiry_date = ?, is_first_login = ? WHERE id = ?',
      [hashedPassword, newExpiryDate.toISOString(), false, userId]
    );

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile endpoint
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await queryOne<DbUser>(
      'SELECT id, name, email, role, roles, avatar, password_expiry_date, is_first_login FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Parse the roles from the JSON string
    const roles = JSON.parse(user.roles);

    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roles: roles,
      avatar: user.avatar,
      passwordExpiryDate: user.password_expiry_date,
      isFirstLogin: user.is_first_login
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
