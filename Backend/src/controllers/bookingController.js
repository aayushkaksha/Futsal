import Booking from '../models/Booking.js';
import TimeSlot from '../models/TimeSlot.js';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createBooking = asyncHandler(async (req, res) => {
  const { date, startTime, endTime, duration, price } = req.body;

  // Check if the time slot is available
  const bookingDate = new Date(date);
  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][bookingDate.getDay()];
  
  // Find if there's a time slot available for this day and time
  const timeSlot = await TimeSlot.findOne({
    day: dayOfWeek,
    startTime: { $lte: startTime },
    endTime: { $gte: endTime },
    isAvailable: true
  });

  if (!timeSlot) {
    return res.status(400).json({
      success: false,
      message: 'No available time slot for the selected date and time'
    });
  }

  // Check if there's already a booking for this time
  const existingBooking = await Booking.findOne({
    date: bookingDate,
    $or: [
      // Booking starts during another booking
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      // Booking contains another booking
      { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
    ],
    status: { $ne: 'cancelled' }
  });

  if (existingBooking) {
    return res.status(400).json({
      success: false,
      message: 'This time slot is already booked'
    });
  }

  // Create the booking
  const booking = await Booking.create({
    user: req.user.id,
    date: bookingDate,
    startTime,
    endTime,
    duration,
    price: price || timeSlot.price,
    status: 'pending'
  });

  res.status(201).json({
    success: true,
    data: booking
  });
});

export const getBookings = async (req, res) => {
  try {
    let query = {};
    
    // If user is not admin, only show their bookings
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }
    
    // Add date filter if provided
    if (req.query.date) {
      const date = new Date(req.query.date);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      
      query.date = {
        $gte: date,
        $lt: nextDay
      };
    }
    
    // Add status filter if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .sort({ date: 1, startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('user', 'name email phone');
  
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }
  
  res.status(200).json({
    success: true,
    count: 1,
    data: booking
  });
};

export const updateBooking = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user is authorized to update this booking
    if (req.user.role !== 'admin') {
      // Regular users can only cancel their own bookings
      if (booking.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this booking'
        });
      }
      
      // Regular users can only cancel bookings, not change other statuses
      if (req.body.status && req.body.status !== 'cancelled') {
        return res.status(403).json({
          success: false,
          message: 'Users can only cancel bookings, not change to other statuses'
        });
      }
    }
    
    // Update the booking
    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Only admin can delete bookings
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete bookings'
      });
    }
    
    await booking.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getUserBookings = asyncHandler(async (req, res) => {
  // Validate req.user.id
  if (!req.user?.id || !mongoose.Types.ObjectId.isValid(req.user.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID'
    });
  }

  const bookings = await Booking.find({ user: req.user.id })
    .sort({ date: -1 })
    .populate('user', 'name email');
  
  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
}); 