import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please provide booking date']
  },
  startTime: {
    type: String,
    required: [true, 'Please provide start time']
  },
  endTime: {
    type: String,
    required: [true, 'Please provide end time']
  },
  duration: {
    type: Number,
    required: [true, 'Please provide duration in hours']
  },
  price: {
    type: Number,
    required: [true, 'Please provide booking price']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'online', ''],
    default: ''
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Create a compound index to prevent double bookings
bookingSchema.index({ date: 1, startTime: 1, endTime: 1 }, { unique: true });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking; 