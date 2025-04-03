import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  
  // Database configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/futsalBooking'
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    expire: process.env.JWT_EXPIRE || '7d'
  },
  
  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*'
  }
};

export default config; 