import express from 'express';
import { 
  getCourts, 
  getCourt, 
  getCourtAvailability, 
  createCourt, 
  updateCourt 
} from '../controllers/courtController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getCourts);
router.get('/:id', getCourt);
router.get('/:id/availability', getCourtAvailability);

// Admin routes (protected)
router.post('/', protect, authorize('admin'), createCourt);
router.put('/:id', protect, authorize('admin'), updateCourt);

export default router; 