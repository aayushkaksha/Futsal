import mongoose from 'mongoose';

const courtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide court name'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide court capacity'],
    min: [1, 'Minimum capacity is 1 player'],
    max: [15, 'Maximum capacity is 15 players']
  },
  pricePerHour: {
    type: Number,
    required: [true, 'Please provide price per hour'],
    min: [0, 'Price cannot be negative']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  maintenanceSchedule: [{
    startDate: Date,
    endDate: Date,
    reason: String
  }],
  features: [{
    type: String,
    enum: ['lights', 'showers', 'lockers', 'parking', 'cafeteria']
  }],
  images: [{
    url: String,
    publicId: String
  }]
}, {
  timestamps: true
});

// Add method to check if court is available for booking
courtSchema.methods.isAvailableForBooking = function(date, startTime, endTime) {
  if (!this.isAvailable) return false;
  
  // Check maintenance schedule
  const bookingDate = new Date(date);
  for (const maintenance of this.maintenanceSchedule) {
    if (bookingDate >= maintenance.startDate && bookingDate <= maintenance.endDate) {
      return false;
    }
  }
  
  return true;
};

const Court = mongoose.model('Court', courtSchema);

export default Court; 