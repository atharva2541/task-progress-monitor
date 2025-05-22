
import { Request, Response } from 'express';
import { query, queryOne } from '../../../utils/db-connection';
import { DbUser } from '../../../types/database';

// Update a user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, role, roles, avatar } = req.body;

    // Check if user is admin or updating their own data
    if (req.user?.role !== 'admin' && req.user?.id !== id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Check if user exists
    const user = await queryOne<DbUser>(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
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

    res.status(200).json({
      id,
      name,
      email,
      role: updatedRole,
      roles: updatedRoles,
      avatar
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
