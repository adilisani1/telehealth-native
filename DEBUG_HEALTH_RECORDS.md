# Health Records API Debug Guide

## Current Issue
The health records API `{{base_url}}/api/health-records` is not being called when uploading health records during appointment booking.

## Debugging Steps Added

### 1. Debug Logs in NewAppointment.js
- Added detailed logging in `uploadHealthRecords()` function
- Added logging when health records data is received from component
- Added logging before appointment booking to show current state

### 2. Debug Logs in HealthRecordsUpload.js
- Added logging in `updateHealthRecordsData()` function
- Added logging for data changes in useEffect
- Added comprehensive dependency tracking

### 3. Direct Test Button
- Added "🧪 Test Direct Upload (DEBUG)" button in health records component
- This bypasses the appointment booking flow and tests the API directly
- Helps identify if issue is with data flow or API itself

## How to Debug

### Step 1: Test Direct Upload
1. Open the app and navigate to New Appointment screen
2. Expand the Health Records section
3. Select a record type (Image or Note)
4. Fill in description and select files/enter notes
5. Click the "🧪 Test Direct Upload (DEBUG)" button
6. Check console logs and alerts

**Expected Result**: If API is working, you should see success message
**If Fails**: API itself has issues (authentication, network, backend)

### Step 2: Test Full Flow
1. Complete the appointment booking form
2. Add health records (type, description, files/notes)
3. Click "Book Appointment"
4. Check console logs for:
   - Health records data being passed to parent
   - uploadHealthRecords function being called
   - API calls being made

### Step 3: Check Console Logs
Look for these debug messages:
- `🔍 DEBUG: HealthRecords data updated:`
- `🔍 DEBUG: NewAppointment received health records data:`
- `🔍 DEBUG: About to book appointment. Current healthRecordsData:`
- `🔍 DEBUG: uploadHealthRecords called`
- `📤 Starting health records upload...`
- `📤 Making X API calls...`

## Possible Issues & Solutions

### Issue 1: No Data Being Passed
**Symptoms**: `healthRecordsData` is null or `hasData: false`
**Check**: Health records component logs
**Solution**: Fix data collection in HealthRecordsUpload component

### Issue 2: Data Not Complete
**Symptoms**: Missing description, files, or noteData
**Check**: Validation logs in updateHealthRecordsData
**Solution**: Fix form validation or data structure

### Issue 3: API Authentication Issues
**Symptoms**: Direct test fails with auth error
**Check**: Network logs, token validity
**Solution**: Fix authentication in healthRecordsApi service

### Issue 4: Network/Backend Issues
**Symptoms**: API calls fail with network errors
**Check**: Backend server status, API endpoints
**Solution**: Fix backend or API configuration

### Issue 5: File Upload Issues
**Symptoms**: Image uploads fail but notes work
**Check**: FormData construction, file formats
**Solution**: Fix file handling in API service

## Debug Console Commands

### Check Current Health Records Data
```javascript
console.log('Current health records:', JSON.stringify(healthRecordsData, null, 2));
```

### Test API Service Directly
```javascript
import healthRecordsApi from './src/services/healthRecordsApi';

// Test note upload
healthRecordsApi.uploadHealthRecord({
  type: 'note',
  description: 'Test note',
  noteData: 'Test content'
}).then(console.log).catch(console.error);
```

## Files Modified for Debugging
- `src/Screens/MainStack/NewAppointment.js` - Added comprehensive logging
- `src/components/HealthRecords/HealthRecordsUpload.js` - Added debug logs and test button
- `src/services/healthRecordsApi.js` - Enhanced error logging

## Next Steps
1. Test the direct upload button first
2. If direct upload works, test full appointment flow
3. Check console logs for exact failure point
4. Remove debug code after fixing the issue
