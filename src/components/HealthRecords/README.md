# Health Records Upload Component

## Overview
The HealthRecordsUpload component allows patients to prepare medical records during appointment booking. The records are uploaded to the backend after the appointment is successfully scheduled.

## Features
- **Medical Images**: Upload X-rays, MRI scans, and other medical images
- **Medical Notes**: Add text-based medical notes and observations
- **File Validation**: Automatic file size validation (5MB limit)
- **Error Handling**: Comprehensive error handling and user feedback
- **Integration with Appointment Booking**: Records are uploaded after successful appointment confirmation

## Usage

### Basic Integration
```javascript
import HealthRecordsUpload from '../../components/HealthRecords/HealthRecordsUpload';

// In your component
const [healthRecordsData, setHealthRecordsData] = useState(null);

<HealthRecordsUpload 
  onHealthRecordsChange={(data) => {
    console.log('Health records data updated:', data);
    setHealthRecordsData(data);
  }}
  containerStyle={{ marginBottom: hp(2) }}
/>
```

### Props
- `onHealthRecordsChange`: Callback function called when health records data changes
- `containerStyle`: Additional styling for the container

## Current Implementation
Currently integrated in:
- `src/Screens/MainStack/NewAppointment.js` - During appointment booking

## API Integration
Uses `src/services/healthRecordsApi.js` which connects to:
- **POST** `/api/health-records` - Upload health records (called after appointment booking)

## Workflow
1. Patient fills appointment booking form
2. Patient optionally prepares health records (images or notes)
3. Patient confirms appointment booking
4. Appointment is created first
5. Health records are uploaded automatically after successful appointment creation
6. Patient receives confirmation for both appointment and health records

## File Types Supported
1. **Image Types**: 
   - JPEG, PNG, GIF
   - Maximum 5 files per upload
   - 5MB per file limit

2. **Notes**: 
   - Text-based medical notes
   - No file limit (text only)

## Future Enhancements
- PDF file upload support (currently disabled)
- Multiple file type selection
- File preview functionality
- Drag and drop interface

## Dependencies
- react-native-image-picker: For image selection
- react-native-vector-icons: For UI icons
- React Native responsive libraries for styling

## Error Handling
The component includes comprehensive error handling for:
- Authentication failures
- File size validation
- Network errors
- Invalid file types
- Upload failures after appointment booking
