/**
 * Doctor Availability Debug Utility
 * Use this to test the availability management functionality
 */

import { getDoctorProfile, updateDoctorAvailability } from '../services/doctorService';
import { getToken } from '../utils/tokenStorage';

export const debugDoctorAvailability = async () => {
  console.log('🔍 Debugging Doctor Availability System');
  console.log('======================================');

  try {
    // 1. Get current token
    const token = await getToken();
    if (!token) {
      console.log('❌ No token found - user not logged in');
      return;
    }
    console.log('✅ Token found');

    // 2. Get doctor profile
    console.log('\n📱 Fetching doctor profile...');
    const profile = await getDoctorProfile(token);
    console.log('Doctor Profile:', {
      id: profile._id || profile.id,
      name: profile.name,
      role: profile.role,
      hasAvailability: !!profile.availability,
      availabilityLength: profile.availability?.length || 0,
      timezone: profile.timezone
    });

    // 3. Show current availability
    if (profile.availability && profile.availability.length > 0) {
      console.log('\n📅 Current Availability:');
      profile.availability.forEach(day => {
        console.log(`  ${day.day}: ${day.slots.length > 0 ? day.slots.join(', ') : 'Not available'}`);
      });
    } else {
      console.log('\n📅 No availability set');
    }

    // 4. Test availability update (with same data)
    console.log('\n💾 Testing availability update...');
    const testAvailability = [
      { day: 'Monday', slots: ['09:00-10:00', '14:00-15:00'] },
      { day: 'Tuesday', slots: ['10:00-11:00'] },
      { day: 'Wednesday', slots: [] },
      { day: 'Thursday', slots: ['15:00-16:00'] },
      { day: 'Friday', slots: ['09:00-12:00'] },
      { day: 'Saturday', slots: [] },
      { day: 'Sunday', slots: [] }
    ];

    await updateDoctorAvailability(token, testAvailability, 'Asia/Karachi');
    console.log('✅ Availability update successful');

    // 5. Verify update
    console.log('\n🔄 Verifying update...');
    const updatedProfile = await getDoctorProfile(token);
    console.log('Updated availability:', updatedProfile.availability);

    console.log('\n🎉 Debug completed successfully!');
    return {
      success: true,
      doctorId: profile._id || profile.id,
      originalAvailability: profile.availability,
      updatedAvailability: updatedProfile.availability
    };

  } catch (error) {
    console.error('❌ Debug failed:', error);
    return {
      success: false,
      error: error.message || error
    };
  }
};

export const getCurrentDoctorInfo = async () => {
  try {
    const token = await getToken();
    if (!token) return null;

    const profile = await getDoctorProfile(token);
    return {
      id: profile._id || profile.id,
      name: profile.name,
      role: profile.role,
      hasAvailability: !!profile.availability,
      timezone: profile.timezone
    };
  } catch (error) {
    console.error('Failed to get doctor info:', error);
    return null;
  }
};

export default {
  debugDoctorAvailability,
  getCurrentDoctorInfo
};
