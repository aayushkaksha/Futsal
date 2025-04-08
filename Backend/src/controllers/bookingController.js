import Booking from '../models/Booking.js';
import Court from '../models/court.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = asyncHandler(async (req, res) => {
  const { court, date, startTime, endTime, duration, numberOfPlayers, equipment } = req.body;

  // Validate court exists and is available
  const courtDoc = await Court.findById(court);
  if (!courtDoc) {
    throw new ErrorResponse('Court not found', 404);
  }

  if (!courtDoc.isAvailableForBooking(date, startTime, endTime)) {
    throw new ErrorResponse('Court is not available for the selected time', 400);
  }

  // Validate number of players
  if (numberOfPlayers > courtDoc.capacity) {
    throw new ErrorResponse(`Maximum capacity for this court is ${courtDoc.capacity} players`, 400);
  }

  // Check for existing bookings
  const existingBooking = await Booking.findOne({
    court,
    date: new Date(date),
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
    ],
    status: { $ne: 'cancelled' }
  });

  if (existingBooking) {
    throw new ErrorResponse('This time slot is already booked', 400);
  }

  // Calculate price
  const price = courtDoc.pricePerHour * duration;
  let finalPrice = price;
  if (equipment) {
    finalPrice += 50; // Additional charge for equipment
  }

  // Create booking
  const booking = await Booking.create({
    user: req.user.id,
    court,
    date: new Date(date),
    startTime,
    endTime,
    duration,
    price: finalPrice,
    numberOfPlayers,
    equipment,
    status: 'pending'
  });

  res.status(201).json({
    success: true,
    data: booking
  });
});

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
export const getBookings = asyncHandler(async (req, res) => {
  let query = {};
  
  // Filter by user if not admin
  if (req.user.role !== 'admin') {
    query.user = req.user.id;
  }
  
  // Apply filters
  if (req.query.court) query.court = req.query.court;
  if (req.query.status) query.status = req.query.status;
  if (req.query.paymentStatus) query.paymentStatus = req.query.paymentStatus;
  
  // Date range filter
  if (req.query.startDate && req.query.endDate) {
    query.date = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate)
    };
  }
  
  const bookings = await Booking.find(query)
    .populate('user', 'name email phone')
    .populate('court', 'name capacity pricePerHour')
    .sort({ date: 1, startTime: 1 });
  
  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('court', 'name capacity pricePerHour features');
  
  if (!booking) {
    throw new ErrorResponse('Booking not found', 404);
  }
  
  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
export const updateBooking = asyncHandler(async (req, res) => {
  let booking = await Booking.findById(req.params.id);
  
  if (!booking) {
    throw new ErrorResponse('Booking not found', 404);
  }
  
  // Check if booking can be updated
  if (booking.status === 'completed' || booking.status === 'cancelled') {
    throw new ErrorResponse('Cannot update completed or cancelled bookings', 400);
  }
  
  // Update booking
  booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  
  if (!booking) {
    throw new ErrorResponse('Booking not found', 404);
  }
  
  if (!booking.canBeCancelled()) {
    throw new ErrorResponse('Booking cannot be cancelled less than 24 hours before start time', 400);
  }
  
  booking.status = 'cancelled';
  booking.cancellationReason = req.body.reason;
  
  if (booking.paymentStatus === 'paid') {
    booking.paymentStatus = 'refunded';
  }
  
  await booking.save();
  
  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private/Admin
export const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  
  if (!booking) {
    throw new ErrorResponse('Booking not found', 404);
  }
  
  await booking.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
}); 