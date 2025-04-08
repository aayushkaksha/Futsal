import express from 'express';
import {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  deleteBooking,
  cancelBooking
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateCreateBooking, validateUpdateBooking } from '../validations/bookingValidation.js';
import Booking from '../models/Booking.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// All booking routes require authentication
router.use(protect);

// Admin dashboard routes first to prevent conflicts with :id route
router.get('/admin/stats', authorize('admin'), asyncHandler(async (req, res) => {
  const statsData = await Booking.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$price' }
      }
    }
  ]);
  
  // Transform data for easy consumption by the frontend
  const stats = {
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    completedBookings: 0
  };
  
  statsData.forEach(item => {
    stats.totalBookings += item.count;
    stats.totalRevenue += item.totalRevenue;
    
    if (item._id === 'pending') {
      stats.pendingBookings = item.count;
    } else if (item._id === 'confirmed') {
      stats.confirmedBookings = item.count;
    } else if (item._id === 'cancelled') {
      stats.cancelledBookings = item.count;
    } else if (item._id === 'completed') {
      stats.completedBookings = item.count;
    }
  });
  
  res.status(200).json({
    success: true,
    data: stats
  });
}));

// Get bookings by date range (admin only)
router.get('/admin/date-range', authorize('admin'), asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const bookings = await Booking.find({
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  })
  .populate('user', 'name email')
  .populate('court', 'name')
  .sort({ date: 1 });
  
  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
}));

// Routes accessible by both users and admins
router.route('/')
  .post(validateCreateBooking, createBooking)
  .get(getBookings);

// Routes with specific access controls
router.route('/:id')
  .get(getBooking)
  .put(validateUpdateBooking, updateBooking)
  .delete(authorize('admin'), deleteBooking);

// Cancel booking route
router.put('/:id/cancel', cancelBooking);

export default router; 