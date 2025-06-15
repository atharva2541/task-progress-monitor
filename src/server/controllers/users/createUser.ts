
import { Request, Response } from 'express';
import { query, queryOne } from '../../../utils/db-connection';
import { DbUser } from '../../../types/database';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '../../../utils/auth-helpers';
import crypto from 'crypto';

// Generate secure temporary password
const generateTemporaryPassword = (): string => {
  const uppercaseChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijkmnopqrstuvwxyz';
  const numberChars = '23456789';
  const specialChars = '!@#$%^&*';

  // Generate at least one of each type of character
  const getRandomChar = (charset: string) => charset.charAt(Math.floor(Math.random() * charset.length));
  
  const password = [
    getRandomChar(uppercaseChars),
    getRandomChar(lowercaseChars),
    getRandomChar(numberChars),
    getRandomChar(specialChars),
  ];

  // Add 8 more random characters for a total length of 12
  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
  for (let i = 0; i < 8; i++) {
    password.push(getRandomChar(allChars));
  }

  // Shuffle the array
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join('');
};

// Create a new user (admin only)
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, role, roles } = req.body;

    if (!name || !email || !role) {
      res.status(400).json({ error: 'Name, email, and role are required' });
      return;
    }

    // Check if email is already in use
    const existingUser = await queryOne<DbUser>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }

    // Generate a unique ID
    const id = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword();
    const hashedTempPassword = await bcrypt.hash(temporaryPassword, 12);
    
    // Set temporary password expiry (7 days)
    const tempPasswordExpiry = new Date();
    tempPasswordExpiry.setDate(tempPasswordExpiry.getDate() + 7);
    
    // Convert roles array to JSON string
    const rolesJson = JSON.stringify(roles || []);
    
    // Generate avatar URL
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff`;

    // Insert new user with temporary password
    await query(
      'INSERT INTO users (id, name, email, temporary_password, temp_password_expiry, role, roles, avatar, is_first_login, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, email, hashedTempPassword, tempPasswordExpiry.toISOString(), role, rolesJson, avatar, true, new Date().toISOString(), new Date().toISOString()]
    );

    // Send welcome email with temporary password
    try {
      await sendWelcomeEmail(email, name, temporaryPassword);
      console.log(`Welcome email sent successfully to ${email}`);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail user creation if email fails
    }

    res.status(201).json({
      id,
      name,
      email,
      role,
      roles: roles || [],
      isFirstLogin: true,
      temporaryPasswordExpiry: tempPasswordExpiry.toISOString(),
      emailSent: true
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
