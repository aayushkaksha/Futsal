// Role-Based Access Control (RBAC) middleware

/**
 * Middleware to restrict access based on user roles
 * @param {Array} roles - Array of allowed roles
 * @returns {Function} - Express middleware function
 */
export const authorize = (roles = []) => {
  // Convert string to array if only one role is passed
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    // Check if user exists and has a role
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Check if user's role is included in the allowed roles
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource`
      });
    }

    // User has required role, proceed
    next();
  };
};

/**
 * Middleware to restrict access to admin users only
 */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
};

/**
 * Middleware to check if user is accessing their own resource or is an admin
 * @param {Function} getResourceUserId - Function to extract user ID from the resource
 */
export const ownerOrAdmin = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      // If user is admin, allow access
      if (req.user.role === 'admin') {
        return next();
      }

      // Get the user ID associated with the resource
      const resourceUserId = await getResourceUserId(req);
      
      // Check if the resource belongs to the user
      if (resourceUserId && resourceUserId.toString() === req.user.id.toString()) {
        return next();
      }

      // User is not the owner or admin
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error checking resource ownership'
      });
    }
  };
}; 