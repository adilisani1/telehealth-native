import mongoose from 'mongoose';
import User from '../models/User.js';

// Database migration script to fix missing gender data
const fixMissingGenderData = async () => {
  try {
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/telehealth-native');
    console.log('✅ Connected to MongoDB');

    // Find all patients without gender data
    const patientsWithoutGender = await User.find({
      role: 'patient',
      $or: [
        { gender: { $exists: false } },
        { gender: null },
        { gender: '' },
        { gender: undefined }
      ]
    });

    console.log(`📊 Found ${patientsWithoutGender.length} patients without gender data`);

    if (patientsWithoutGender.length === 0) {
      console.log('✅ All patients already have gender data');
      process.exit(0);
    }

    // Update all patients without gender to have a default gender
    const updateResult = await User.updateMany(
      {
        role: 'patient',
        $or: [
          { gender: { $exists: false } },
          { gender: null },
          { gender: '' },
          { gender: undefined }
        ]
      },
      {
        $set: { gender: 'other' }
      }
    );

    console.log(`✅ Updated ${updateResult.modifiedCount} patients with default gender 'other'`);

    // Verify the fix
    const remainingPatientsWithoutGender = await User.countDocuments({
      role: 'patient',
      $or: [
        { gender: { $exists: false } },
        { gender: null },
        { gender: '' },
        { gender: undefined }
      ]
    });

    const totalPatients = await User.countDocuments({ role: 'patient' });
    const patientsWithGender = await User.countDocuments({ 
      role: 'patient', 
      gender: { $exists: true, $ne: null, $ne: '' } 
    });

    console.log(`📊 Final stats:`);
    console.log(`   - Total patients: ${totalPatients}`);
    console.log(`   - Patients with gender: ${patientsWithGender}`);
    console.log(`   - Patients without gender: ${remainingPatientsWithoutGender}`);

    if (remainingPatientsWithoutGender === 0) {
      console.log('🎉 SUCCESS: All patients now have gender data!');
    } else {
      console.log('⚠️  Some patients still don\'t have gender data');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing gender data:', error);
    process.exit(1);
  }
};

// Run the migration
fixMissingGenderData();
