import mongoose from 'mongoose';
import config from './config.js';

// MongoDB connection options
const options = {
  autoIndex: true,
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.database.uri, options);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  } catch (error) {
    console.error(`Error disconnecting from MongoDB: ${error.message}`);
  }
};

export { connectDB, disconnectDB }; 