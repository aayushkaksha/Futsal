// Validation middleware for authentication routes
export const validateRegister = (req, res, next) => {
  const { name, email, password, phone } = req.body;
  const errors = [];

  // Validate name
  if (!name || name.trim() === '') {
    errors.push('Name is required');
  }

  // Validate email
  if (!email) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      errors.push('Please provide a valid email');
    }
  }

  // Validate password
  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  // Validate phone
  if (!phone) {
    errors.push('Phone number is required');
  } else {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      errors.push('Please provide a valid phone number');
    }
  }

  // Return errors if any
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Validate email
  if (!email) {
    errors.push('Email is required');
  }

  // Validate password
  if (!password) {
    errors.push('Password is required');
  }

  // Return errors if any
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
}; 