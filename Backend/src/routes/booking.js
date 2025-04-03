import express from 'express';
import {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  deleteBooking,
  getUserBookings
} from '../controllers/bookingController.js';
import { validateUpdateBooking } from '../validations/index.js';
import { protect, authorize, adminOnly, ownerOrAdmin } from '../middleware/index.js';
import { validateCreateBooking as bookingValidation } from '../validations/bookingValidation.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get booking user ID helper function for ownerOrAdmin middleware
const getBookingUserId = async (req) => {
  try {
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return null;
    }
    const foundBooking = await Booking.findById(req.params.id);
    return foundBooking ? foundBooking.user : null;
  } catch (error) {
    console.error('Error fetching booking:', error);
    return null;
  }
};

// All booking routes require authentication
router.use(protect);

// Routes accessible by both users and admins
router.route('/')
  .post(bookingValidation, createBooking)
  .get(getBookings);

// Routes with specific access controls
router.route('/:id')
  .get(ownerOrAdmin(getBookingUserId), getBooking)
  .put(validateUpdateBooking, ownerOrAdmin(getBookingUserId), updateBooking)
  .delete(adminOnly, deleteBooking);

// Admin-only routes
router.get('/admin/stats', authorize(['admin']), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Booking statistics - Admin only'
  });
});

export default router; 