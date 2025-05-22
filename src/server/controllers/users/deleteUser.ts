
import { Request, Response } from 'express';
import { query, queryOne } from '../../../utils/db-connection';
import { DbUser } from '../../../types/database';

// Delete a user (admin only)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await queryOne<DbUser>(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Delete user
    await query(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
