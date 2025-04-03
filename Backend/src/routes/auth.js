import express from 'express';
import { register, login, getMe, updateProfile, changePassword } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../validations/index.js';
import { protect, authorize } from '../middleware/index.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes - accessible by any authenticated user
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Admin routes - will add more as needed
router.get('/admin/dashboard', protect, authorize(['admin']), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin dashboard access granted'
  });
});

export default router; 