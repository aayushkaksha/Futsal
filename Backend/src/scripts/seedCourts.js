import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Court from '../models/court.js';
import { connectDB } from '../config/db.js';

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

// Sample court data
const courts = [
  {
    name: "Court A - Premium",
    description: "Premium futsal court with professional turf and equipment",
    capacity: 10,
    pricePerHour: 1000,
    isAvailable: true,
    features: ["lights", "showers", "lockers", "parking", "cafeteria"]
  },
  {
    name: "Court B - Standard",
    description: "Standard futsal court suitable for casual games",
    capacity: 8,
    pricePerHour: 800,
    isAvailable: true,
    features: ["lights", "parking"]
  },
  {
    name: "Court C - Basic",
    description: "Basic futsal court for practice sessions",
    capacity: 6,
    pricePerHour: 600,
    isAvailable: true,
    features: ["lights"]
  }
];

// Seed courts function
const seedCourts = async () => {
  try {
    // Delete existing courts
    await Court.deleteMany({});
    console.log('Deleted existing courts');

    // Insert new courts
    const createdCourts = await Court.insertMany(courts);
    console.log(`Added ${createdCourts.length} courts to the database`);

    // Exit process
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding courts: ${error.message}`);
    process.exit(1);
  }
};

// Run the seed function
seedCourts(); 