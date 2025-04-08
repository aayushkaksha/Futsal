import Joi from 'joi';

// Validation middleware for booking routes
export const validateCreateBooking = (req, res, next) => {
  const schema = Joi.object({
    court: Joi.string().hex().length(24).required(),
    date: Joi.date().min('now').required(),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    duration: Joi.number().min(1).max(4).required(),
    numberOfPlayers: Joi.number().min(1).max(10).required(),
    equipment: Joi.boolean().default(false),
    notes: Joi.string().max(500).allow('')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  // Validate that endTime is after startTime
  const startTime = new Date(`2000-01-01T${req.body.startTime}`);
  const endTime = new Date(`2000-01-01T${req.body.endTime}`);
  
  if (endTime <= startTime) {
    return res.status(400).json({
      success: false,
      message: 'End time must be after start time'
    });
  }

  next();
};

export const validateUpdateBooking = (req, res, next) => {
  const schema = Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'cancelled', 'completed'),
    paymentStatus: Joi.string().valid('unpaid', 'paid', 'refunded'),
    paymentMethod: Joi.string().valid('cash', 'online', 'card', ''),
    notes: Joi.string().max(500).allow(''),
    cancellationReason: Joi.string().max(500).allow('')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
}; 