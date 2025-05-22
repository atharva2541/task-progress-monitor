
import express from 'express';
import { query, queryOne, insert } from '../../utils/db-connection';
import { authenticateToken } from '../middleware/auth';
import { DbTask, DbTaskInstance } from '../../types/database';

const router = express.Router();

// Get all tasks
router.get('/', authenticateToken, async (req, res) => {
  try {
    const tasks = await query<DbTask>('SELECT * FROM tasks');
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get task by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await queryOne<DbTask>(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.status(200).json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new task
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      status,
      priority,
      dueDate,
      frequency,
      isRecurring,
      assignedTo,
      checker1,
      checker2,
      isTemplate
    } = req.body;

    if (!name || !category || !status || !priority || !dueDate || !assignedTo) {
      res.status(400).json({ error: 'Required fields missing' });
      return;
    }

    // Generate a unique ID
    const id = `task_${Date.now()}`;
    const now = new Date().toISOString();

    // Insert new task
    await query(
      `INSERT INTO tasks (
        id, name, description, category, status, priority, due_date, 
        frequency, is_recurring, assigned_to, checker1, checker2, 
        is_template, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, name, description || '', category, status, priority, dueDate,
        frequency || 'once', isRecurring || false, assignedTo, checker1 || null, checker2 || null,
        isTemplate || false, now, now
      ]
    );

    // If it's a recurring task, create the first instance
    if (isRecurring) {
      const instanceId = `instance_${Date.now()}`;
      
      await query(
        `INSERT INTO task_instances (
          id, base_task_id, status, due_date, assigned_to, 
          checker1, checker2, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          instanceId, id, status, dueDate, assignedTo,
          checker1 || null, checker2 || null, now, now
        ]
      );

      // Update task with current instance ID
      await query(
        'UPDATE tasks SET current_instance_id = ? WHERE id = ?',
        [instanceId, id]
      );
    }

    const createdTask = await queryOne<DbTask>(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );

    res.status(201).json(createdTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a task
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFields = req.body;

    // Check if task exists
    const task = await queryOne<DbTask>(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    // Build update query dynamically
    let updateQuery = 'UPDATE tasks SET updated_at = ? ';
    const queryParams: any[] = [new Date().toISOString()];

    // Add fields to update
    const allowedFields = [
      'name', 'description', 'category', 'status', 'priority', 
      'due_date', 'frequency', 'is_recurring', 'assigned_to', 
      'checker1', 'checker2', 'observation_status', 'is_escalated',
      'escalation_priority', 'escalation_reason', 'is_template'
    ];

    for (const field of allowedFields) {
      if (updatedFields[field] !== undefined) {
        const dbField = field.replace(/([A-Z])/g, '_$1').toLowerCase(); // Convert camelCase to snake_case
        updateQuery += `, ${dbField} = ?`;
        queryParams.push(updatedFields[field]);
      }
    }

    // Special case for escalated_at
    if (updatedFields.isEscalated && !task.is_escalated) {
      updateQuery += ', escalated_at = ?';
      queryParams.push(new Date().toISOString());
    }

    // Special case for escalated_by
    if (updatedFields.isEscalated && !task.is_escalated && req.user) {
      updateQuery += ', escalated_by = ?';
      queryParams.push(req.user.id);
    }

    // Special case for submitted_at
    if (updatedFields.status === 'submitted' && task.status !== 'submitted') {
      updateQuery += ', submitted_at = ?';
      queryParams.push(new Date().toISOString());
    }

    updateQuery += ' WHERE id = ?';
    queryParams.push(id);

    // Update task
    await query(updateQuery, queryParams);

    // If it's a recurring task and current instance changed, update the current instance
    if (task.is_recurring && task.current_instance_id && 
        (updatedFields.status || updatedFields.observationStatus)) {
      
      let instanceUpdateQuery = 'UPDATE task_instances SET updated_at = ? ';
      const instanceQueryParams: any[] = [new Date().toISOString()];

      if (updatedFields.status) {
        instanceUpdateQuery += ', status = ?';
        instanceQueryParams.push(updatedFields.status);
      }

      if (updatedFields.observationStatus) {
        instanceUpdateQuery += ', observation_status = ?';
        instanceQueryParams.push(updatedFields.observationStatus);
      }

      instanceUpdateQuery += ' WHERE id = ?';
      instanceQueryParams.push(task.current_instance_id);

      await query(instanceUpdateQuery, instanceQueryParams);
    }

    const updatedTask = await queryOne<DbTask>(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a task
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if task exists
    const task = await queryOne<DbTask>(
      'SELECT id FROM tasks WHERE id = ?',
      [id]
    );

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    // Delete associated task instances
    await query(
      'DELETE FROM task_instances WHERE base_task_id = ?',
      [id]
    );

    // Delete associated approvals
    await query(
      'DELETE FROM task_approvals WHERE task_id = ?',
      [id]
    );

    // Delete associated comments
    await query(
      'DELETE FROM task_comments WHERE task_id = ?',
      [id]
    );

    // Delete associated attachments
    await query(
      'DELETE FROM task_attachments WHERE task_id = ?',
      [id]
    );

    // Delete the task
    await query(
      'DELETE FROM tasks WHERE id = ?',
      [id]
    );

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get task instances for a specific task
router.get('/:id/instances', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const instances = await query<DbTaskInstance>(
      'SELECT * FROM task_instances WHERE base_task_id = ? ORDER BY created_at DESC',
      [id]
    );

    res.status(200).json(instances);
  } catch (error) {
    console.error('Get task instances error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
