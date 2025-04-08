import Court from '../models/court.js';
import Booking from '../models/Booking.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all courts
// @route   GET /api/courts
// @access  Public
export const getCourts = asyncHandler(async (req, res) => {
  const courts = await Court.find().sort('name');
  
  res.status(200).json({
    success: true,
    count: courts.length,
    data: courts
  });
});

// @desc    Get court by ID
// @route   GET /api/courts/:id
// @access  Public
export const getCourt = asyncHandler(async (req, res) => {
  const court = await Court.findById(req.params.id);
  
  if (!court) {
    throw new ErrorResponse(`Court not found with id of ${req.params.id}`, 404);
  }
  
  res.status(200).json({
    success: true,
    data: court
  });
});

// @desc    Get court availability
// @route   GET /api/courts/:id/availability
// @access  Public
export const getCourtAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;
  
  if (!date) {
    throw new ErrorResponse('Please provide a date', 400);
  }
  
  const court = await Court.findById(id);
  
  if (!court) {
    throw new ErrorResponse(`Court not found with id of ${id}`, 404);
  }
  
  // Check if court is available on requested date
  if (!court.isAvailableForBooking(date)) {
    return res.status(200).json({
      success: true,
      data: {
        available: false,
        availableTimes: []
      }
    });
  }
  
  // Get all bookings for this court on the requested date
  const bookingDate = new Date(date);
  const nextDay = new Date(bookingDate);
  nextDay.setDate(nextDay.getDate() + 1);
  
  const bookings = await Booking.find({
    court: id,
    date: {
      $gte: bookingDate,
      $lt: nextDay
    },
    status: { $ne: 'cancelled' }
  });
  
  // Generate all possible time slots (24-hour format)
  const timeSlots = [];
  
  // Business hours: 6:00 AM to 10:00 PM
  for (let hour = 6; hour < 22; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  
  // Filter out booked time slots
  const bookedSlots = new Set();
  
  bookings.forEach(booking => {
    const startHour = parseInt(booking.startTime.split(':')[0]);
    const endHour = parseInt(booking.endTime.split(':')[0]);
    
    for (let hour = startHour; hour < endHour; hour++) {
      bookedSlots.add(`${hour.toString().padStart(2, '0')}:00`);
    }
  });
  
  const availableTimes = timeSlots.filter(time => !bookedSlots.has(time));
  
  res.status(200).json({
    success: true,
    data: {
      available: availableTimes.length > 0,
      availableTimes
    }
  });
});

// @desc    Create court
// @route   POST /api/courts
// @access  Private/Admin
export const createCourt = asyncHandler(async (req, res) => {
  const court = await Court.create(req.body);
  
  res.status(201).json({
    success: true,
    data: court
  });
});

// @desc    Update court
// @route   PUT /api/courts/:id
// @access  Private/Admin
export const updateCourt = asyncHandler(async (req, res) => {
  let court = await Court.findById(req.params.id);
  
  if (!court) {
    throw new ErrorResponse(`Court not found with id of ${req.params.id}`, 404);
  }
  
  court = await Court.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: court
  });
}); 