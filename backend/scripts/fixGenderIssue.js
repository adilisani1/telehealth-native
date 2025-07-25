#!/usr/bin/env node
/**
 * Gender Data Fix Script
 * This script fixes the gender N/A issue by updating patients in the database
 */

import mongoose from 'mongoose';
import User from '../models/User.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

const main = async () => {
  try {
    console.log('🔧 TELEHEALTH GENDER DATA FIX SCRIPT');
    console.log('=====================================');
    
    // Connect to database
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/telehealth-native');
    console.log('✅ Connected to MongoDB');

    // Analyze current data
    console.log('\n📊 ANALYZING CURRENT DATA...');
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const patientsWithGender = await User.countDocuments({ 
      role: 'patient', 
      gender: { $exists: true, $ne: null, $ne: '', $ne: undefined } 
    });
    const patientsWithoutGender = totalPatients - patientsWithGender;

    console.log(`   • Total patients: ${totalPatients}`);
    console.log(`   • Patients with gender: ${patientsWithGender}`);
    console.log(`   • Patients without gender: ${patientsWithoutGender}`);

    if (patientsWithoutGender === 0) {
      console.log('🎉 All patients already have gender data! No fix needed.');
      process.exit(0);
    }

    // Show sample patients without gender
    console.log('\n👥 SAMPLE PATIENTS WITHOUT GENDER:');
    const samplePatients = await User.find({
      role: 'patient',
      $or: [
        { gender: { $exists: false } },
        { gender: null },
        { gender: '' },
        { gender: undefined }
      ]
    }, 'name email phone').limit(5);

    samplePatients.forEach((patient, index) => {
      console.log(`   ${index + 1}. ${patient.name} (${patient.email})`);
    });

    // Ask user what to do
    console.log('\n🤔 CHOOSE A FIX OPTION:');
    console.log('   1. Set all missing genders to "other"');
    console.log('   2. Set all missing genders to "male"');
    console.log('   3. Set all missing genders to "female"');
    console.log('   4. Skip database fix (only use frontend fallback)');
    console.log('   5. Cancel');

    const choice = await askQuestion('\nEnter your choice (1-5): ');

    let genderValue = null;
    switch (choice.trim()) {
      case '1':
        genderValue = 'other';
        break;
      case '2':
        genderValue = 'male';
        break;
      case '3':
        genderValue = 'female';
        break;
      case '4':
        console.log('📝 Skipping database fix. The frontend fallback will handle display.');
        process.exit(0);
      case '5':
        console.log('❌ Operation cancelled.');
        process.exit(0);
      default:
        console.log('❌ Invalid choice. Operation cancelled.');
        process.exit(1);
    }

    // Confirm the action
    const confirm = await askQuestion(`\n⚠️  This will set gender = "${genderValue}" for ${patientsWithoutGender} patients. Continue? (y/N): `);
    
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('❌ Operation cancelled.');
      process.exit(0);
    }

    // Perform the update
    console.log(`\n🔄 Updating ${patientsWithoutGender} patients with gender = "${genderValue}"...`);
    
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
        $set: { gender: genderValue }
      }
    );

    console.log(`✅ Successfully updated ${updateResult.modifiedCount} patients`);

    // Verify the fix
    const newPatientsWithGender = await User.countDocuments({ 
      role: 'patient', 
      gender: { $exists: true, $ne: null, $ne: '', $ne: undefined } 
    });

    console.log('\n🎉 FIX COMPLETED!');
    console.log(`   • Patients with gender data: ${newPatientsWithGender}/${totalPatients}`);
    
    if (newPatientsWithGender === totalPatients) {
      console.log('✅ All patients now have gender data!');
      console.log('📱 The frontend should now display gender correctly.');
    } else {
      console.log('⚠️  Some patients still don\'t have gender data. You may need to run this script again.');
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
};

main();
