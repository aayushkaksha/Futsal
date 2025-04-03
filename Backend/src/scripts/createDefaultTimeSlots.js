import mongoose from 'mongoose';
import TimeSlot from '../models/TimeSlot.js';
import { connectDB, disconnectDB } from '../config/db.js';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const hours = Array.from({ length: 13 }, (_, i) => i + 7); // 7am to 7pm

const createDefaultTimeSlots = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    console.log('Creating default time slots...');
    const timeSlots = [];
    
    for (const day of days) {
      for (const hour of hours) {
        const startTime = `${hour}:00`;
        const endTime = `${hour + 1}:00`;
        
        // Set default prices (you can adjust these)
        let price = 1000; // Regular price
        
        // Higher price for evenings and weekends
        if (hour >= 17) {
          price = 1200; // Evening price
        }
        if (day === 'Saturday' || day === 'Sunday') {
          price = 1500; // Weekend price
        }
        
        timeSlots.push({
          day,
          startTime,
          endTime,
          price,
          isAvailable: true,
          isSpecialPrice: (hour >= 17) || (day === 'Saturday' || day === 'Sunday')
        });
      }
    }
    
    // Check if time slots already exist
    const existingCount = await TimeSlot.countDocuments();
    if (existingCount > 0) {
      console.log(`${existingCount} time slots already exist. Skipping creation.`);
      console.log('If you want to recreate time slots, please drop the collection first.');
      return;
    }
    
    // Insert time slots
    const result = await TimeSlot.insertMany(timeSlots);
    console.log(`Created ${result.length} default time slots`);
    
  } catch (error) {
    console.error('Error creating default time slots:', error);
  } finally {
    await disconnectDB();
    console.log('Database connection closed');
  }
};

// Run the function
createDefaultTimeSlots(); 