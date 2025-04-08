import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import {
  getBookingStats,
  getAllBookings,
  updateBookingStatus,
  deleteBooking
} from '../controllers/adminBookingController.js';

const router = express.Router();

// Admin routes for booking management
router.get('/stats', protect, admin, getBookingStats);
router.get('/', protect, admin, getAllBookings);
router.put('/:id/status', protect, admin, updateBookingStatus);
router.delete('/:id', protect, admin, deleteBooking);

export default router; 