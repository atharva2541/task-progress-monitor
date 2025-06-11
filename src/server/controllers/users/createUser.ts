
import { Request, Response } from 'express';
import { query, queryOne } from '../../../utils/db-connection';
import { DbUser } from '../../../types/database';

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
    const id = `user_${Date.now()}`;

    // Set default values
    const passwordExpiryDate = new Date();
    passwordExpiryDate.setDate(passwordExpiryDate.getDate() + 90);
    
    // Convert roles array to JSON string
    const rolesJson = JSON.stringify(roles || []);

    // Insert new user
    await query(
      'INSERT INTO users (id, name, email, role, roles, password_expiry_date, is_first_login, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, email, role, rolesJson, passwordExpiryDate.toISOString(), true, new Date().toISOString(), new Date().toISOString()]
    );

    res.status(201).json({
      id,
      name,
      email,
      role,
      roles: roles || [],
      isFirstLogin: true,
      passwordExpiryDate: passwordExpiryDate.toISOString()
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
