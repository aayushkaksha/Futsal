import TimeSlot from '../models/TimeSlot.js';


export const createTimeSlot = async (req, res) => {
  try {
    const { day, startTime, endTime, price, isAvailable, isSpecialPrice } = req.body;

    // Check if time slot already exists
    const existingTimeSlot = await TimeSlot.findOne({
      day,
      startTime,
      endTime
    });

    if (existingTimeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Time slot already exists'
      });
    }

    // Create time slot
    const timeSlot = await TimeSlot.create({
      day,
      startTime,
      endTime,
      price,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      isSpecialPrice: isSpecialPrice !== undefined ? isSpecialPrice : false
    });

    res.status(201).json({
      success: true,
      data: timeSlot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getTimeSlots = async (req, res) => {
  try {
    let query = {};
    
    // Filter by day if provided
    if (req.query.day) {
      query.day = req.query.day;
    }
    
    // Filter by availability if provided
    if (req.query.isAvailable !== undefined) {
      query.isAvailable = req.query.isAvailable === 'true';
    }
    
    const timeSlots = await TimeSlot.find(query).sort({ day: 1, startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: timeSlots.length,
      data: timeSlots  // Ensure this is an array
    });
  } catch (error) {
    console.error('Error in getTimeSlots controller:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getTimeSlotsByDay = async (req, res) => {
  try {
    const { day } = req.params;
    
    // Validate day
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (!validDays.includes(day)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid day'
      });
    }
    
    const timeSlots = await TimeSlot.find({ day }).sort({ startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: timeSlots.length,
      data: timeSlots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getTimeSlot = async (req, res) => {
  try {
    const timeSlot = await TimeSlot.findById(req.params.id);
    
    if (!timeSlot) {
      return res.status(404).json({
        success: false,
        message: 'Time slot not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: timeSlot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateTimeSlot = async (req, res) => {
  try {
    let timeSlot = await TimeSlot.findById(req.params.id);
    
    if (!timeSlot) {
      return res.status(404).json({
        success: false,
        message: 'Time slot not found'
      });
    }
    
    // Update time slot
    timeSlot = await TimeSlot.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: timeSlot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteTimeSlot = async (req, res) => {
  try {
    const timeSlot = await TimeSlot.findById(req.params.id);
    
    if (!timeSlot) {
      return res.status(404).json({
        success: false,
        message: 'Time slot not found'
      });
    }
    
    await timeSlot.deleteOne();
    
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