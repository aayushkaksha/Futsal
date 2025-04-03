// Export all middleware
import { protect, admin } from './auth.js';
import { authorize, adminOnly, ownerOrAdmin } from './rbac.js';

export {
  // Auth middleware
  protect,
  admin,
  
  // RBAC middleware
  authorize,
  adminOnly,
  ownerOrAdmin
}; 