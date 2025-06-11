
import { Request, Response } from 'express';
import { query } from '../../../utils/db-connection';
import { DbUser } from '../../../types/database';

// Get all users (admin only)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await query<DbUser>(
      'SELECT id, name, email, role, roles, avatar, password_expiry_date, is_first_login, created_at, updated_at FROM users'
    );

    // Parse roles for each user
    const formattedUsers = users.map(user => ({
      ...user,
      roles: JSON.parse(user.roles)
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
