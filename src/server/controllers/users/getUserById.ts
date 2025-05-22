
import { Request, Response } from 'express';
import { queryOne } from '../../../utils/db-connection';
import { DbUser } from '../../../types/database';

// Get user by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Check if user is admin or requesting their own data
    if (req.user?.role !== 'admin' && req.user?.id !== id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const user = await queryOne<DbUser>(
      'SELECT id, name, email, role, roles, avatar, password_expiry_date, is_first_login, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Parse roles from JSON string
    const formattedUser = {
      ...user,
      roles: JSON.parse(user.roles)
    };

    res.status(200).json(formattedUser);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
