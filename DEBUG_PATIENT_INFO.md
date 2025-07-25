# Patient Information Debug Guide

## Problem Description
Patient information is not visible in the appointment details modal, showing "Invalid" values instead of actual patient data. Health records API is also returning 403 errors.

## Debugging Setup Complete

### 1. Enhanced Logging in Key Files

#### AppointmentDetailsModal.js
- Added comprehensive logging in `fetchPatientDetails()` function
- Logs appointment object structure when modal opens
- Detailed API response analysis with multiple response structure handling
- Step-by-step logging of patient data processing
- Render-time logging to see exactly what values are being displayed

#### DoctorAppointments.js
- Enhanced `mapAppointment()` function with detailed logging
- Shows raw appointment data from API
- Logs patient ID extraction process
- Displays final mapped appointment structure

#### appointmentManagementService.js
- Already has comprehensive error handling for 403 health records errors
- Uses fallback endpoint strategy for health records

### 2. Debug Utilities Created

#### debugPatientInfo.js
- `debugPatientInformation()` - Analyzes appointment and patient data structures
- `testPatientDetailsAPI()` - Tests API endpoints directly
- `runPatientInfoDebug()` - Complete diagnostic workflow
- Mock patient data for testing

#### testPatientInfo.js
- `testPatientInfoAPI()` - Comprehensive API testing with authentication checks
- `analyzePatientDataIssues()` - Identifies missing patient data fields
- `testWithRealAppointment()` - Tests with actual appointment data
- `generateMockPatientData()` - Provides mock data for testing

#### DebugPatientInfo.js (React Component)
- Temporary debug component that can be added to any screen
- Interactive testing interface
- Real-time API testing with visual results
- Shows appointment data and test results

## How to Use the Debug Tools

### Step 1: Check Console Logs
1. Open the appointment details modal with any appointment
2. Check React Native console for detailed logs starting with:
   - 🔵 MODAL OPENED
   - 🗂️ MAPPING APPOINTMENT
   - 🔍 DEBUGGING PATIENT DETAILS FETCH
   - 🏷️ RENDERING NAME/EMAIL/PHONE

### Step 2: Add Debug Component (Temporary)
Add this to DoctorAppointments.js or any screen to test:

```javascript
import DebugPatientInfo from '../components/DebugPatientInfo';

// Add this anywhere in your render method:
<DebugPatientInfo appointment={selectedAppointment} />
```

### Step 3: Run Direct API Tests
In any component, you can run:

```javascript
import { testPatientInfoAPI } from '../utils/testPatientInfo';

// Test with a real patient ID
const result = await testPatientInfoAPI('actual-patient-id-here');
console.log('Test result:', result);
```

## Common Issues to Look For

### 1. Authentication Issues
- Check if token exists in console logs
- Look for 401 errors in API calls
- Verify token is being sent in Authorization header

### 2. Patient ID Issues
- Check if `appointment.patientId` exists
- Verify patient ID extraction from appointment object
- Look at the mapping in DoctorAppointments.js

### 3. API Response Structure Issues
- Check the exact structure of patient details API response
- Look for nested data in `response.success.data`, `response.data`, `response.user`, etc.
- Verify field names match what we're expecting

### 4. Field Mapping Issues
- Check if patient data has different field names than expected
- Look for `fullName` vs `name`, `emailAddress` vs `email`, etc.
- Verify the render logic in AppointmentDetailsModal.js

## Expected Console Output

When working correctly, you should see:
```
🔵 MODAL OPENED - APPOINTMENT DATA CHECK:
🗂️ MAPPING APPOINTMENT: [appointment data]
🔍 DEBUGGING PATIENT DETAILS FETCH
   - Final patientId: [some-id]
✅ Patient details API response: [response data]
🏷️ RENDERING NAME: [actual name]
📧 RENDERING EMAIL: [actual email]
```

When there's an issue, you'll see:
```
❌ No patientId found in appointment
❌ ERROR FETCHING PATIENT DETAILS
❌ Health records API error: 403
```

## Quick Fixes to Try

### If No Patient ID:
1. Check appointment object structure in console
2. Verify the mapping in `mapAppointment()` function
3. Check if API response structure changed

### If API Call Fails:
1. Check authentication token
2. Verify API endpoint URLs
3. Check network connectivity
4. Look for 401/403/404 errors

### If Patient Data Empty:
1. Check API response structure in console
2. Verify field name mapping
3. Check if response is nested differently

### If "Invalid" Values Showing:
1. Check the render logging to see what values are being processed
2. Verify the fallback chain in render logic
3. Check if patient data is null/undefined

## Next Steps After Debugging

1. Run the app and open an appointment modal
2. Check the console output following the patterns above
3. Identify the specific issue from the logs
4. Apply the appropriate fix based on the root cause found
5. Remove debug logging once issue is resolved

## Files Modified for Debugging

- ✅ `src/components/AppointmentDetailsModal.js` - Enhanced logging
- ✅ `src/Screens/DoctorStack/DoctorAppointments.js` - Enhanced mapping logs
- ✅ `src/utils/debugPatientInfo.js` - Debug utilities
- ✅ `src/utils/testPatientInfo.js` - API testing utilities
- ✅ `src/components/DebugPatientInfo.js` - Debug component
- ✅ `src/services/appointmentManagementService.js` - Already has error handling

The debugging setup is now complete and ready to help identify the root cause of the patient information display issues.
