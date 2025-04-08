import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  court: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Court',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please provide booking date'],
    validate: {
      validator: function(value) {
        return value >= new Date();
      },
      message: 'Booking date must be in the future'
    }
  },
  startTime: {
    type: String,
    required: [true, 'Please provide start time'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time in HH:MM format']
  },
  endTime: {
    type: String,
    required: [true, 'Please provide end time'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time in HH:MM format']
  },
  duration: {
    type: Number,
    required: [true, 'Please provide duration in hours'],
    min: [1, 'Minimum booking duration is 1 hour'],
    max: [4, 'Maximum booking duration is 4 hours']
  },
  price: {
    type: Number,
    required: [true, 'Please provide booking price'],
    min: [0, 'Price cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'online', 'card', ''],
    default: ''
  },
  numberOfPlayers: {
    type: Number,
    required: [true, 'Please provide number of players'],
    min: [1, 'Minimum 1 player required'],
    max: [10, 'Maximum 10 players allowed']
  },
  equipment: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  cancellationReason: {
    type: String,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Create a compound index to prevent double bookings for the same court
bookingSchema.index({ court: 1, date: 1, startTime: 1, endTime: 1 }, { unique: true });

// Add virtual field for booking status
bookingSchema.virtual('isActive').get(function() {
  return this.status === 'confirmed' && new Date(this.date) >= new Date();
});

// Add method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  const bookingDate = new Date(this.date);
  const now = new Date();
  const hoursUntilBooking = (bookingDate - now) / (1000 * 60 * 60);
  return this.status === 'confirmed' && hoursUntilBooking > 24;
};

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking; 