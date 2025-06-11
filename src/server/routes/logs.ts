
import express from 'express';
import { query, queryOne, insert } from '../../utils/db-connection';
import { authenticateToken, isAdmin } from '../middleware/auth';
import { DbActivityLog } from '../../types/database';

const router = express.Router();

// Get all logs (with optional filtering)
router.get('/', authenticateToken, isAdmin, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { 
      userId, taskId, actionType, 
      category, level, startDate, endDate,
      limit = 100, offset = 0 
    } = req.query;

    // Build query dynamically
    let queryStr = 'SELECT * FROM activity_logs';
    const queryParams: any[] = [];
    let whereClauseAdded = false;

    // Add filters if provided
    if (userId || taskId || actionType || category || level || startDate || endDate) {
      queryStr += ' WHERE';
      
      if (userId) {
        queryStr += ' user_id = ?';
        queryParams.push(userId);
        whereClauseAdded = true;
      }

      if (taskId) {
        if (whereClauseAdded) queryStr += ' AND';
        queryStr += ' task_id = ?';
        queryParams.push(taskId);
        whereClauseAdded = true;
      }

      if (actionType) {
        if (whereClauseAdded) queryStr += ' AND';
        queryStr += ' action_type = ?';
        queryParams.push(actionType);
        whereClauseAdded = true;
      }

      if (category) {
        if (whereClauseAdded) queryStr += ' AND';
        queryStr += ' category = ?';
        queryParams.push(category);
        whereClauseAdded = true;
      }

      if (level) {
        if (whereClauseAdded) queryStr += ' AND';
        queryStr += ' level = ?';
        queryParams.push(level);
        whereClauseAdded = true;
      }

      if (startDate) {
        if (whereClauseAdded) queryStr += ' AND';
        queryStr += ' timestamp >= ?';
        queryParams.push(startDate);
        whereClauseAdded = true;
      }

      if (endDate) {
        if (whereClauseAdded) queryStr += ' AND';
        queryStr += ' timestamp <= ?';
        queryParams.push(endDate);
      }
    }

    // Add sorting and pagination
    queryStr += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    queryParams.push(Number(limit), Number(offset));

    const logs = await query<DbActivityLog>(queryStr, queryParams);

    // Format the logs to parse the details JSON
    const formattedLogs = logs.map(log => ({
      ...log,
      details: JSON.parse(log.details)
    }));

    res.status(200).json(formattedLogs);
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new log entry
router.post('/', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const {
      actionType,
      taskId,
      instanceId,
      category,
      level = 'info',
      details
    } = req.body;

    if (!actionType || !taskId || !category) {
      res.status(400).json({ error: 'Required fields missing' });
      return;
    }

    // Generate a unique ID
    const id = `log_${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Insert new log
    await query(
      `INSERT INTO activity_logs (
        id, timestamp, action_type, user_id, user_role, task_id, 
        instance_id, category, level, details
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, timestamp, actionType, req.user?.id, 
        req.user?.role, taskId, instanceId || null, 
        category, level, JSON.stringify(details || {})
      ]
    );

    const createdLog = await queryOne<DbActivityLog>(
      'SELECT * FROM activity_logs WHERE id = ?',
      [id]
    );

    if (!createdLog) {
      res.status(500).json({ error: 'Failed to create log' });
      return;
    }

    // Parse details from JSON string
    const formattedLog = {
      ...createdLog,
      details: JSON.parse(createdLog.details)
    };

    res.status(201).json(formattedLog);
  } catch (error) {
    console.error('Create log error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get log metrics
router.get('/metrics', authenticateToken, isAdmin, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    // Get counts by level
    const levelCountsQuery = 'SELECT level, COUNT(*) as count FROM activity_logs GROUP BY level';
    const levelCounts = await query<{level: string, count: number}>(levelCountsQuery);

    // Get counts by category
    const categoryCountsQuery = 'SELECT category, COUNT(*) as count FROM activity_logs GROUP BY category';
    const categoryCounts = await query<{category: string, count: number}>(categoryCountsQuery);

    // Get counts by action type
    const actionTypeCountsQuery = 'SELECT action_type, COUNT(*) as count FROM activity_logs GROUP BY action_type';
    const actionTypeCounts = await query<{action_type: string, count: number}>(actionTypeCountsQuery);

    // Get logs count by day for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyCountsQuery = `
      SELECT 
        DATE(timestamp) as date, 
        COUNT(*) as count 
      FROM activity_logs 
      WHERE timestamp >= ? 
      GROUP BY DATE(timestamp) 
      ORDER BY date
    `;
    const dailyCounts = await query<{date: string, count: number}>(dailyCountsQuery, [thirtyDaysAgo.toISOString()]);

    res.status(200).json({
      levelCounts,
      categoryCounts,
      actionTypeCounts,
      dailyCounts
    });
  } catch (error) {
    console.error('Get log metrics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
