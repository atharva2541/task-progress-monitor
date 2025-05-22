
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

// Get unread notification count
router.get('/unread-count', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const result = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false',
      [userId]
    );

    res.status(200).json({ count: result?.count || 0 });
  } catch (error) {
    console.error('Get unread count error:', error);
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

// Mark all notifications as read for a user
router.put('/mark-all-read', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    await query(
      'UPDATE notifications SET is_read = true WHERE user_id = ? AND is_read = false',
      [userId]
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
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

// Get user notification preferences
router.get('/preferences', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const preferences = await queryOne<DbNotificationPreferences>(
      'SELECT * FROM user_notification_preferences WHERE user_id = ?',
      [userId]
    );

    if (!preferences) {
      // Return default preferences if none exist
      res.status(200).json({
        user_id: userId,
        email_enabled: true,
        in_app_enabled: true,
        task_assignment: true,
        task_updates: true,
        due_date_reminders: true,
        system_notifications: true,
        digest_frequency: 'immediate',
        quiet_hours_start: null,
        quiet_hours_end: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      return;
    }

    res.status(200).json(preferences);
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user notification preferences
router.put('/preferences', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const {
      email_enabled,
      in_app_enabled,
      task_assignment,
      task_updates,
      due_date_reminders,
      system_notifications,
      digest_frequency,
      quiet_hours_start,
      quiet_hours_end
    } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Check if preferences exist
    const existingPreferences = await queryOne<DbNotificationPreferences>(
      'SELECT * FROM user_notification_preferences WHERE user_id = ?',
      [userId]
    );

    const now = new Date().toISOString();

    if (existingPreferences) {
      // Update existing preferences
      await query(
        `UPDATE user_notification_preferences SET 
        email_enabled = ?, in_app_enabled = ?, task_assignment = ?, 
        task_updates = ?, due_date_reminders = ?, system_notifications = ?,
        digest_frequency = ?, quiet_hours_start = ?, quiet_hours_end = ?,
        updated_at = ? WHERE user_id = ?`,
        [
          email_enabled, in_app_enabled, task_assignment,
          task_updates, due_date_reminders, system_notifications,
          digest_frequency, quiet_hours_start, quiet_hours_end,
          now, userId
        ]
      );
    } else {
      // Create new preferences
      await query(
        `INSERT INTO user_notification_preferences 
        (user_id, email_enabled, in_app_enabled, task_assignment, task_updates, 
        due_date_reminders, system_notifications, digest_frequency, quiet_hours_start, 
        quiet_hours_end, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, email_enabled, in_app_enabled, task_assignment,
          task_updates, due_date_reminders, system_notifications,
          digest_frequency, quiet_hours_start, quiet_hours_end,
          now, now
        ]
      );
    }

    res.status(200).json({ message: 'Notification preferences updated successfully' });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
