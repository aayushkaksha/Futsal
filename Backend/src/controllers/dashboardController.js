import Booking from '../models/Booking.js';
import User from '../models/User.js';
import TimeSlot from '../models/TimeSlot.js';

export const getDashboardData = async (req, res) => {
  try {
    // Get total bookings
    const totalBookings = await Booking.countDocuments();
    
    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Get total time slots
    const totalTimeSlots = await TimeSlot.countDocuments();
    
    // Get recent bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');
    
    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        totalUsers,
        totalTimeSlots,
        recentBookings
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 