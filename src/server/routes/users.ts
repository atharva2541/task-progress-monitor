
import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/users';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, isAdmin, getAllUsers);

// Get user by ID
router.get('/:id', authenticateToken, getUserById);

// Create a new user (admin only)
router.post('/', authenticateToken, isAdmin, createUser);

// Update a user
router.put('/:id', authenticateToken, updateUser);

// Delete a user (admin only)
router.delete('/:id', authenticateToken, isAdmin, deleteUser);

export default router;
