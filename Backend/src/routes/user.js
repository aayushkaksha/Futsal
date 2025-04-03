import express from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  changeUserRole
} from '../controllers/userController.js';
import { protect, adminOnly, ownerOrAdmin } from '../middleware/index.js';

const router = express.Router();

// Helper function for ownerOrAdmin middleware
const getUserId = (req) => req.params.id;

// All routes require authentication
router.use(protect);

// Admin-only routes
router.get('/', adminOnly, getUsers);
router.delete('/:id', adminOnly, deleteUser);
router.put('/:id/role', adminOnly, changeUserRole);

// Routes accessible by admin or the user themselves
router.route('/:id')
  .get(ownerOrAdmin(getUserId), getUser)
  .put(ownerOrAdmin(getUserId), updateUser);

export default router; 