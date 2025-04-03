// Utility functions for validation


export const isValidEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};


export const isValidPhone = (phone) => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};


export const isValidTime = (time) => {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(time);
};

export const isValidFutureDate = (date) => {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, message: 'Invalid date format' };
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (dateObj < today) {
    return { isValid: false, message: 'Date cannot be in the past' };
  }
  
  return { isValid: true, message: '' };
};

export const isEndTimeAfterStartTime = (startTime, endTime) => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  return endMinutes > startMinutes;
}; 