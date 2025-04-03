// Export all validation middleware
import { validateRegister, validateLogin } from './authValidation.js';
import { validateCreateBooking, validateUpdateBooking } from './bookingValidation.js';
import { validateCreateTimeSlot, validateUpdateTimeSlot } from './timeSlotValidation.js';
import * as validationUtils from './utils.js';

export {
  // Auth validations
  validateRegister,
  validateLogin,
  
  // Booking validations
  validateCreateBooking,
  validateUpdateBooking,
  
  // TimeSlot validations
  validateCreateTimeSlot,
  validateUpdateTimeSlot,
  
  // Utility functions
  validationUtils
}; 