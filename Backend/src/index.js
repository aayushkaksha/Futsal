import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

// Import configuration
import config from './config/config.js';
import { connectDB } from './config/db.js';

// Import routes
import authRoutes from './routes/auth.js';
import bookingRoutes from './routes/booking.js';
import userRoutes from './routes/user.js';
import timeSlotRoutes from './routes/timeSlot.js';

// Import error handler middleware
import { errorHandler } from './middleware/errorHandler.js';

// Initialize express app
const app = express();
const PORT = config.server.port;

// Middleware
app.use(express.json());
app.use(cors({
  origin: config.cors.origin
}));
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
  res.send('Futsal Booking API is running');
});

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/timeslots', timeSlotRoutes);

// Use error handler middleware
app.use(errorHandler);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start server after successful database connection
    app.listen(PORT, () => {
      console.log(`Server running in ${config.server.nodeEnv} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
};

// Start the server
startServer(); 