import asyncHandler from 'express-async-handler';
import Booking from '../src/models/Booking.js';
import { subDays, startOfDay, endOfDay } from 'date-fns';

// @desc    Get booking statistics
// @route   GET /api/admin/bookings/stats
// @access  Private/Admin
const getBookingStats = asyncHandler(async (req, res) => {
  const today = new Date();
  const last7Days = subDays(today, 7);
  const last30Days = subDays(today, 30);

  // Get total bookings
  const totalBookings = await Booking.countDocuments();

  // Get today's bookings
  const todayBookings = await Booking.countDocuments({
    date: {
      $gte: startOfDay(today),
      $lte: endOfDay(today)
    }
  });

  // Get last 7 days bookings
  const last7DaysBookings = await Booking.countDocuments({
    date: {
      $gte: startOfDay(last7Days),
      $lte: endOfDay(today)
    }
  });

  // Get last 30 days bookings
  const last30DaysBookings = await Booking.countDocuments({
    date: {
      $gte: startOfDay(last30Days),
      $lte: endOfDay(today)
    }
  });

  // Get bookings by status
  const statusStats = await Booking.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get bookings by time slot
  const timeSlotStats = await Booking.aggregate([
    {
      $group: {
        _id: '$timeSlot',
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    totalBookings,
    todayBookings,
    last7DaysBookings,
    last30DaysBookings,
    statusStats,
    timeSlotStats
  });
});

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({})
    .populate('user', 'name email')
    .sort({ date: -1, timeSlot: 1 });
  res.json(bookings);
});

// @desc    Update booking status
// @route   PUT /api/admin/bookings/:id/status
// @access  Private/Admin
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (booking) {
    booking.status = status;
    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } else {
    res.status(404);
    throw new Error('Booking not found');
  }
});

// @desc    Delete a booking
// @route   DELETE /api/admin/bookings/:id
// @access  Private/Admin
const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (booking) {
    await booking.remove();
    res.json({ message: 'Booking removed' });
  } else {
    res.status(404);
    throw new Error('Booking not found');
  }
});

export {
  getBookingStats,
  getAllBookings,
  updateBookingStatus,
  deleteBooking
}; 