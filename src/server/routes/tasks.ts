import express from 'express';
import { query, queryOne, insert } from '../../utils/db-connection';
import { authenticateToken } from '../middleware/auth';
import type { DbTask, DbTaskInstance } from '../../types/database';
import { addDays, addWeeks, addMonths, format } from 'date-fns';

const router = express.Router();

// Get all tasks
router.get('/', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const tasks = await query<DbTask>('SELECT * FROM tasks');
    res.status(200).json(tasks);
    return;
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

// New endpoint: Get tasks and instances for calendar
router.get('/calendar', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    // Get all base tasks
    const tasks = await query<DbTask>('SELECT * FROM tasks');
    
    // Get all active task instances
    const instances = await query<DbTaskInstance>(
      'SELECT ti.*, t.name, t.description, t.category FROM task_instances ti ' +
      'JOIN tasks t ON ti.base_task_id = t.id ' +
      'WHERE ti.completed_at IS NULL'
    );
    
    // Format instances as task-like objects for the frontend
    const formattedInstances = instances.map(instance => ({
      id: instance.id,
      name: instance.name,
      description: instance.description,
      category: instance.category,
      status: instance.status,
      dueDate: instance.due_date,
      assignedTo: instance.assigned_to,
      checker1: instance.checker1,
      checker2: instance.checker2,
      isInstance: true,
      baseTaskId: instance.base_task_id,
      instanceReference: instance.instance_reference,
      periodStart: instance.period_start,
      periodEnd: instance.period_end,
      createdAt: instance.created_at,
      updatedAt: instance.updated_at
    }));

    // Combine base tasks and instances
    const combinedTasks = [...tasks.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
      status: t.status,
      priority: t.priority,
      dueDate: t.due_date,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      submittedAt: t.submitted_at,
      frequency: t.frequency,
      isRecurring: t.is_recurring,
      assignedTo: t.assigned_to,
      checker1: t.checker1,
      checker2: t.checker2,
      observationStatus: t.observation_status,
      isEscalated: t.is_escalated,
      escalationPriority: t.escalation_priority,
      escalationReason: t.escalation_reason,
      escalatedAt: t.escalated_at,
      escalatedBy: t.escalated_by,
      isTemplate: t.is_template,
      currentInstanceId: t.current_instance_id,
      nextInstanceDate: t.next_instance_date,
      isInstance: false
    })), ...formattedInstances];
    
    res.status(200).json(combinedTasks);
    return;
  } catch (error) {
    console.error('Get calendar tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

// Get task by ID
router.get('/:id', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
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
    return;
  }
});

// Create a new task
router.post('/', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
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
      const instanceId = await createTaskInstance(id, dueDate, assignedTo, checker1, checker2, status);
      
      // Update task with current instance ID
      await query(
        'UPDATE tasks SET current_instance_id = ? WHERE id = ?',
        [instanceId, id]
      );

      // Calculate and set next instance date
      const nextDate = calculateNextInstanceDate(new Date(dueDate), frequency);
      if (nextDate) {
        await query(
          'UPDATE tasks SET next_instance_date = ? WHERE id = ?',
          [nextDate.toISOString(), id]
        );
      }
    }

    const createdTask = await queryOne<DbTask>(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );

    res.status(201).json(createdTask);
    return;
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

// Update a task
router.put('/:id', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
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
router.delete('/:id', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
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
router.get('/:id/instances', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const instances = await query<DbTaskInstance>(
      'SELECT * FROM task_instances WHERE base_task_id = ? ORDER BY created_at DESC',
      [id]
    );

    res.status(200).json(instances);
    return;
  } catch (error) {
    console.error('Get task instances error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

// Generate next task instance (for recurring tasks)
router.post('/:id/generate-next-instance', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Get the task
    const task = await queryOne<DbTask>(
      'SELECT * FROM tasks WHERE id = ? AND is_recurring = true',
      [id]
    );

    if (!task) {
      res.status(404).json({ error: 'Recurring task not found' });
      return;
    }

    // Calculate next instance date
    const nextDate = task.next_instance_date ? 
      new Date(task.next_instance_date) : 
      calculateNextInstanceDate(new Date(task.due_date), task.frequency);

    if (!nextDate) {
      res.status(400).json({ error: 'Unable to calculate next instance date' });
      return;
    }

    // Create new instance
    const instanceId = await createTaskInstance(
      id, 
      nextDate.toISOString(), 
      task.assigned_to, 
      task.checker1, 
      task.checker2, 
      'pending'
    );

    // Update task with new instance ID and next instance date
    const followingDate = calculateNextInstanceDate(nextDate, task.frequency);
    
    await query(
      'UPDATE tasks SET current_instance_id = ?, next_instance_date = ? WHERE id = ?',
      [instanceId, followingDate?.toISOString(), id]
    );

    const updatedTask = await queryOne<DbTask>(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );

    res.status(201).json({ 
      task: updatedTask,
      newInstanceId: instanceId
    });
    return;
  } catch (error) {
    console.error('Generate next instance error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

// Helper function to create a task instance
async function createTaskInstance(
  baseTaskId: string, 
  dueDate: string, 
  assignedTo: string, 
  checker1: string | null, 
  checker2: string | null, 
  status: string
): Promise<string> {
  const instanceId = `instance_${Date.now()}`;
  const now = new Date().toISOString();
  
  // Create reference based on date
  const instanceReference = `${format(new Date(dueDate), 'MMM yyyy')}`;
  
  await query(
    `INSERT INTO task_instances (
      id, base_task_id, status, due_date, assigned_to, 
      checker1, checker2, instance_reference, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      instanceId, baseTaskId, status, dueDate, assignedTo,
      checker1, checker2, instanceReference, now, now
    ]
  );
  
  return instanceId;
}

// Helper function to calculate next instance date based on frequency
function calculateNextInstanceDate(currentDate: Date, frequency: string): Date | null {
  switch (frequency) {
    case 'daily':
      return addDays(currentDate, 1);
    case 'weekly':
      return addDays(currentDate, 7);
    case 'bi-weekly':
      return addDays(currentDate, 14);
    case 'monthly':
      return addMonths(currentDate, 1);
    case 'quarterly':
      return addMonths(currentDate, 3);
    case 'yearly':
      return addMonths(currentDate, 12);
    default:
      return null; // Not recurring or unsupported frequency
  }
}

export default router;
