
import express from 'express';
import { query, queryOne } from '../../utils/db-connection';
import { authenticateToken } from '../middleware/auth';
import { DbNotification } from '../../types/database';

const router = express.Router();

// Get all notifications for the current user
router.get('/', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const notifications = await query<DbNotification>(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark a notification as read
router.put('/:id/read', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Check if notification exists and belongs to the user
    const notification = await queryOne<DbNotification>(
      'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    // Update notification
    await query(
      'UPDATE notifications SET is_read = ? WHERE id = ?',
      [true, id]
    );

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a notification
router.delete('/:id', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Check if notification exists and belongs to the user
    const notification = await queryOne<DbNotification>(
      'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    // Delete notification
    await query(
      'DELETE FROM notifications WHERE id = ?',
      [id]
    );

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
