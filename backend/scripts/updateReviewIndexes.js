import mongoose from 'mongoose';
import Review from '../models/Review.js';
import { connectDB } from '../config/db.js';

const updateIndexes = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    console.log('Getting current indexes...');
    const indexes = await Review.collection.getIndexes();
    console.log('Current indexes:', Object.keys(indexes));
    
    // Drop the old problematic index if it exists
    try {
      console.log('Attempting to drop old index...');
      await Review.collection.dropIndex({ doctor: 1, patient: 1 });
      console.log('Successfully dropped old doctor_1_patient_1 index');
    } catch (error) {
      console.log('Index might not exist or already dropped:', error.message);
    }
    
    console.log('Creating new indexes...');
    
    // Create the new indexes
    await Review.collection.createIndex(
      { doctor: 1, patient: 1, appointment: 1 }, 
      { 
        unique: true,
        partialFilterExpression: { appointment: { $exists: true } },
        name: 'doctor_patient_appointment_unique'
      }
    );
    console.log('Created appointment-specific review index');
    
    await Review.collection.createIndex(
      { doctor: 1, patient: 1 }, 
      { 
        unique: true,
        partialFilterExpression: { appointment: { $exists: false } },
        name: 'doctor_patient_general_unique'
      }
    );
    console.log('Created general review index');
    
    console.log('Getting updated indexes...');
    const newIndexes = await Review.collection.getIndexes();
    console.log('New indexes:', Object.keys(newIndexes));
    
    console.log('Index update completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('Error updating indexes:', error);
    process.exit(1);
  }
};

updateIndexes();
