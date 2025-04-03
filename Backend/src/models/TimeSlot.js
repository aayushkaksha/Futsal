import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isSpecialPrice: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create a compound index for unique time slots
timeSlotSchema.index({ day: 1, startTime: 1, endTime: 1 }, { unique: true });

const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);

export default TimeSlot; 