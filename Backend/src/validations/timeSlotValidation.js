// Validation middleware for time slot routes
export const validateCreateTimeSlot = (req, res, next) => {
  const { day, startTime, endTime, price, isAvailable, isSpecialPrice } = req.body;
  const errors = [];

  // Validate day
  if (!day) {
    errors.push('Day is required');
  } else {
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (!validDays.includes(day)) {
      errors.push('Invalid day value');
    }
  }

  // Validate start time
  if (!startTime) {
    errors.push('Start time is required');
  } else {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(startTime)) {
      errors.push('Start time should be in HH:MM format');
    }
  }

  // Validate end time
  if (!endTime) {
    errors.push('End time is required');
  } else {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(endTime)) {
      errors.push('End time should be in HH:MM format');
    }
  }

  // Validate price
  if (!price && price !== 0) {
    errors.push('Price is required');
  } else if (isNaN(price) || price < 0) {
    errors.push('Price must be a non-negative number');
  }

  // Validate isAvailable if provided
  if (isAvailable !== undefined && typeof isAvailable !== 'boolean') {
    errors.push('isAvailable must be a boolean value');
  }

  // Validate isSpecialPrice if provided
  if (isSpecialPrice !== undefined && typeof isSpecialPrice !== 'boolean') {
    errors.push('isSpecialPrice must be a boolean value');
  }

  // Check if start time is before end time
  if (startTime && endTime) {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    if (startMinutes >= endMinutes) {
      errors.push('End time must be after start time');
    }
  }

  // Return errors if any
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

export const validateUpdateTimeSlot = (req, res, next) => {
  const { price, isAvailable, isSpecialPrice } = req.body;
  const errors = [];

  // Validate price if provided
  if (price !== undefined) {
    if (isNaN(price) || price < 0) {
      errors.push('Price must be a non-negative number');
    }
  }

  // Validate isAvailable if provided
  if (isAvailable !== undefined && typeof isAvailable !== 'boolean') {
    errors.push('isAvailable must be a boolean value');
  }

  // Validate isSpecialPrice if provided
  if (isSpecialPrice !== undefined && typeof isSpecialPrice !== 'boolean') {
    errors.push('isSpecialPrice must be a boolean value');
  }

  // Return errors if any
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
}; 