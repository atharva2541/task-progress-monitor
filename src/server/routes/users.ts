
import express from 'express';
import { query, queryOne } from '../../utils/db-connection';
import { authenticateToken, isAdmin } from '../middleware/auth';
import { DbUser } from '../../types/database';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await query<DbUser>(
      'SELECT id, name, email, role, roles, avatar, password_expiry_date, is_first_login, created_at, updated_at FROM users'
    );

    // Parse roles for each user
    const formattedUsers = users.map(user => ({
      ...user,
      roles: JSON.parse(user.roles)
    }));

    return res.status(200).json(formattedUsers);
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is admin or requesting their own data
    if (req.user?.role !== 'admin' && req.user?.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await queryOne<DbUser>(
      'SELECT id, name, email, role, roles, avatar, password_expiry_date, is_first_login, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Parse roles from JSON string
    const formattedUser = {
      ...user,
      roles: JSON.parse(user.roles)
    };

    return res.status(200).json(formattedUser);
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new user (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, email, role, roles } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }

    // Check if email is already in use
    const existingUser = await queryOne<DbUser>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
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

    return res.status(201).json({
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
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a user
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, roles, avatar } = req.body;

    // Check if user is admin or updating their own data
    if (req.user?.role !== 'admin' && req.user?.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if user exists
    const user = await queryOne<DbUser>(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only allow role changes if admin
    let updatedRole = role;
    let updatedRoles = roles;
    
    if (req.user?.role !== 'admin') {
      // Get current user role and roles
      const currentUser = await queryOne<DbUser>(
        'SELECT role, roles FROM users WHERE id = ?',
        [id]
      );
      
      if (currentUser) {
        updatedRole = currentUser.role;
        updatedRoles = JSON.parse(currentUser.roles);
      }
    }

    // Convert roles array to JSON string if provided
    const rolesJson = updatedRoles ? JSON.stringify(updatedRoles) : undefined;

    // Build update query dynamically
    let updateQuery = 'UPDATE users SET updated_at = ? ';
    const queryParams: any[] = [new Date().toISOString()];

    if (name) {
      updateQuery += ', name = ?';
      queryParams.push(name);
    }

    if (email) {
      updateQuery += ', email = ?';
      queryParams.push(email);
    }

    if (updatedRole) {
      updateQuery += ', role = ?';
      queryParams.push(updatedRole);
    }

    if (rolesJson) {
      updateQuery += ', roles = ?';
      queryParams.push(rolesJson);
    }

    if (avatar) {
      updateQuery += ', avatar = ?';
      queryParams.push(avatar);
    }

    updateQuery += ' WHERE id = ?';
    queryParams.push(id);

    // Update user
    await query(updateQuery, queryParams);

    return res.status(200).json({
      id,
      name,
      email,
      role: updatedRole,
      roles: updatedRoles,
      avatar
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a user (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await queryOne<DbUser>(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user
    await query(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
