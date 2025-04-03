// Validation middleware for booking routes
export const validateCreateBooking = (req, res, next) => {
  const { date, startTime, endTime, duration, price } = req.body;
  const errors = [];

  // Validate date
  if (!date) {
    errors.push('Date is required');
  } else {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      errors.push('Please provide a valid date');
    } else if (dateObj < new Date().setHours(0, 0, 0, 0)) {
      errors.push('Booking date cannot be in the past');
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

  // Validate duration
  if (!duration) {
    errors.push('Duration is required');
  } else if (isNaN(duration) || duration <= 0) {
    errors.push('Duration must be a positive number');
  }

  // Validate price
  if (!price) {
    errors.push('Price is required');
  } else if (isNaN(price) || price < 0) {
    errors.push('Price must be a non-negative number');
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

export const validateUpdateBooking = (req, res, next) => {
  const { status, paymentStatus, paymentMethod } = req.body;
  const errors = [];

  // Validate status if provided
  if (status !== undefined) {
    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      errors.push('Invalid status value');
    }
  }

  // Validate payment status if provided
  if (paymentStatus !== undefined) {
    const validPaymentStatuses = ['unpaid', 'paid'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      errors.push('Invalid payment status value');
    }
  }

  // Validate payment method if provided
  if (paymentMethod !== undefined) {
    const validPaymentMethods = ['cash', 'online', ''];
    if (!validPaymentMethods.includes(paymentMethod)) {
      errors.push('Invalid payment method value');
    }
  }

  // Return errors if any
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
}; 