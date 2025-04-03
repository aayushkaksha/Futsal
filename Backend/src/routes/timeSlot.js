import express from 'express';
import {
  createTimeSlot,
  getTimeSlots,
  getTimeSlotsByDay,
  getTimeSlot,
  updateTimeSlot,
  deleteTimeSlot
} from '../controllers/timeSlotController.js';
import { validateCreateTimeSlot, validateUpdateTimeSlot } from '../validations/index.js';
import { protect, adminOnly } from '../middleware/index.js';

const router = express.Router();

// Public routes
router.get('/', getTimeSlots);
router.get('/day/:day', getTimeSlotsByDay);
router.get('/:id', getTimeSlot);

// Admin-only routes
router.use(protect);
router.use(adminOnly);

router.post('/', validateCreateTimeSlot, createTimeSlot);
router.put('/:id', validateUpdateTimeSlot, updateTimeSlot);
router.delete('/:id', deleteTimeSlot);

export default router; 