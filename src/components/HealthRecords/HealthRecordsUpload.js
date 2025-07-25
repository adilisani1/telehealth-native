import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSelector } from 'react-redux';
import { Colors } from '../../Constants/themeColors';
import { Fonts } from '../../Constants/Fonts';
import TxtInput from '../TextInput/Txtinput';
import CustomButton from '../Buttons/customButton';
import healthRecordsApi from '../../services/healthRecordsApi';
import { useAlert } from '../../Providers/AlertContext';

const HealthRecordsUpload = ({ onHealthRecordsChange, containerStyle }) => {
  const { isDarkMode } = useSelector(store => store.theme);
  const { showAlert } = useAlert();
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [recordType, setRecordType] = useState('');
  const [description, setDescription] = useState('');
  const [noteData, setNoteData] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);

  const recordTypes = [
    { label: 'Medical Image (X-ray, MRI, etc.)', value: 'image' },
    { label: 'Medical Note', value: 'note' },
    // PDF temporarily disabled until document picker is fully integrated
    // { label: 'Medical Report (PDF)', value: 'pdf' },
  ];

  // Safety check for required dependencies
  if (!showAlert) {
    console.warn('HealthRecordsUpload: AlertContext not available');
    return null;
  }

  // Notify parent component whenever health records data changes
  const updateHealthRecordsData = useCallback(() => {
    const healthRecordsData = {
      hasData: !!(recordType && description.trim() && (
        (recordType === 'note' && noteData.trim()) || 
        (recordType !== 'note' && selectedFiles.length > 0)
      )),
      type: recordType,
      description: description.trim(),
      noteData: recordType === 'note' ? noteData.trim() : '',
      files: recordType !== 'note' ? selectedFiles : []
    };
    
    console.log('� DEBUG: Updating health records data:', {
      hasData: healthRecordsData.hasData,
      type: healthRecordsData.type,
      description: healthRecordsData.description ? 'Yes' : 'No',
      noteDataLength: healthRecordsData.noteData.length,
      filesCount: healthRecordsData.files.length
    });
    
    if (onHealthRecordsChange) {
      onHealthRecordsChange(healthRecordsData);
    }
  }, [recordType, description, noteData, selectedFiles]); // Removed onHealthRecordsChange from dependencies

  // Update parent when any relevant data changes
  useEffect(() => {
    // Only log when there's meaningful data change to reduce console spam
    const hasValidData = recordType && description.trim() && (
      (recordType === 'note' && noteData.trim()) || 
      (recordType !== 'note' && selectedFiles.length > 0)
    );
    
    if (hasValidData) {
      console.log('✅ DEBUG: Valid health records data, updating parent');
      updateHealthRecordsData();
    } else if (recordType) {
      console.log('⚠️ DEBUG: Incomplete health records data, skipping update');
    }
  }, [recordType, description, noteData, selectedFiles, updateHealthRecordsData]);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.secondryColor,
      borderRadius: wp(3),
      padding: wp(4),
      marginVertical: hp(1),
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: hp(1),
    },
    title: {
      fontSize: RFPercentage(2.2),
      fontFamily: Fonts.Bold,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
    },
    subtitle: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
      marginBottom: hp(2),
    },
    typeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: wp(3),
      marginVertical: hp(0.5),
      borderRadius: wp(2),
      borderWidth: 1,
      borderColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,
      backgroundColor: isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor,
    },
    selectedTypeButton: {
      borderColor: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
      backgroundColor: isDarkMode ? Colors.darkTheme.primaryColor + '20' : Colors.lightTheme.primaryColor + '20',
    },
    typeText: {
      fontSize: RFPercentage(1.9),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      marginLeft: wp(2),
    },
    selectedTypeText: {
      fontFamily: Fonts.Medium,
      color: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
    },
    uploadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: wp(4),
      marginVertical: hp(1),
      borderRadius: wp(2),
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
      backgroundColor: isDarkMode ? Colors.darkTheme.primaryColor + '10' : Colors.lightTheme.primaryColor + '10',
    },
    uploadButtonText: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Medium,
      color: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
      marginLeft: wp(2),
    },
    fileItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: wp(3),
      marginVertical: hp(0.5),
      borderRadius: wp(2),
      backgroundColor: isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor,
      borderWidth: 1,
      borderColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,
    },
    fileName: {
      flex: 1,
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      marginLeft: wp(2),
    },
    removeButton: {
      padding: wp(1),
    },
    label: {
      fontSize: RFPercentage(1.9),
      fontFamily: Fonts.Medium,
      color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
      marginTop: hp(1),
      marginBottom: hp(0.5),
    },
    toggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: wp(3),
      borderRadius: wp(2),
      backgroundColor: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
    },
    toggleButtonText: {
      fontSize: RFPercentage(1.9),
      fontFamily: Fonts.Medium,
      color: Colors.white,
      marginLeft: wp(1),
    },
    uploadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: wp(2),
    },
    uploadingText: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Regular,
      color: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
      marginLeft: wp(2),
    },
  });

  const handleTypeSelect = (type) => {
    setRecordType(type);
    setSelectedFiles([]);
    setNoteData('');
    // Note: updateHealthRecordsData will be called automatically via useEffect
  };

  const handleFileUpload = async () => {
    try {
      if (recordType === 'image') {
        const result = await launchImageLibrary({
          mediaType: 'photo',
          quality: 0.8,
          selectionLimit: 5,
        });
        
        if (!result.didCancel && result.assets) {
          const files = result.assets.map(asset => ({
            uri: asset.uri,
            type: asset.type,
            name: asset.fileName || `image_${Date.now()}.jpg`,
            size: asset.fileSize,
          }));
          setSelectedFiles(files);
          // Note: updateHealthRecordsData will be called automatically via useEffect
        }
      } else if (recordType === 'pdf') {
        // For now, show alert that PDF selection will be available soon
        showAlert('PDF file selection will be available in the next update. Please use image upload or notes for now.', 'info');
        return;
      }
    } catch (error) {
      console.error('File selection error:', error);
      showAlert('Error selecting file. Please try again.', 'error');
    }
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    // Note: updateHealthRecordsData will be called automatically via useEffect
  };

  const handleSave = () => {
    // Validation
    if (!recordType) {
      showAlert('Please select a record type', 'error');
      return;
    }

    if (!description.trim()) {
      showAlert('Please enter a description', 'error');
      return;
    }

    if (recordType !== 'note' && selectedFiles.length === 0) {
      showAlert('Please select at least one file', 'error');
      return;
    }

    if (recordType === 'note' && !noteData.trim()) {
      showAlert('Please enter your medical note', 'error');
      return;
    }

    // Validate file size (5MB limit)
    if (recordType !== 'note') {
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      for (const file of selectedFiles) {
        if (file.size && file.size > maxSize) {
          showAlert(`File "${file.name}" is too large. Maximum size is 5MB.`, 'error');
          return;
        }
      }
    }

    // Update parent component with final data
    updateHealthRecordsData();
    setShowUploadForm(false);
    showAlert('Health records prepared successfully. They will be uploaded after appointment confirmation.', 'success');
  };

  // Test function to directly upload health records (for debugging)
  const testDirectUpload = async () => {
    console.log('🧪 DEBUG: Testing direct upload...');
    try {
      if (recordType === 'note') {
        const result = await healthRecordsApi.uploadHealthRecord({
          type: 'note',
          description: description.trim(),
          noteData: noteData.trim(),
        });
        console.log('✅ Direct upload successful:', result);
        showAlert('Direct upload test successful!', 'success');
      } else if (selectedFiles.length > 0) {
        const result = await healthRecordsApi.uploadHealthRecord({
          type: recordType,
          description: description.trim(),
          file: selectedFiles[0],
        });
        console.log('✅ Direct upload successful:', result);
        showAlert('Direct upload test successful!', 'success');
      }
    } catch (error) {
      console.error('❌ Direct upload failed:', error);
      showAlert('Direct upload test failed: ' + error.message, 'error');
    }
  };

  const renderUploadForm = () => (
    <View>
      <Text style={styles.label}>Select Record Type</Text>
      {recordTypes.map((type) => (
        <TouchableOpacity
          key={type.value}
          style={[
            styles.typeButton,
            recordType === type.value && styles.selectedTypeButton,
          ]}
          onPress={() => handleTypeSelect(type.value)}
        >
          <Icon 
            name={
              type.value === 'image' ? 'image' :
              type.value === 'pdf' ? 'picture-as-pdf' : 'note'
            }
            size={wp(5)}
            color={
              recordType === type.value
                ? (isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor)
                : (isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor)
            }
          />
          <Text
            style={[
              styles.typeText,
              recordType === type.value && styles.selectedTypeText,
            ]}
          >
            {type.label}
          </Text>
        </TouchableOpacity>
      ))}

      {recordType && (
        <>
          <Text style={styles.label}>Description</Text>
          <TxtInput
            placeholder="Enter description (e.g., Blood test results, X-ray scan)"
            value={description}
            onChangeText={setDescription}
            containerStyle={{ marginBottom: hp(1) }}
          />

          {recordType === 'note' ? (
            <>
              <Text style={styles.label}>Medical Note</Text>
              <TxtInput
                placeholder="Enter your medical note, symptoms, or observations"
                value={noteData}
                onChangeText={setNoteData}
                multiline={true}
                numberOfLines={4}
                containerStyle={{ marginBottom: hp(1) }}
              />
            </>
          ) : (
            <>
              <Text style={styles.label}>
                {recordType === 'image' ? 'Upload Images' : 'Upload PDF Files'}
              </Text>
              <TouchableOpacity style={styles.uploadButton} onPress={handleFileUpload}>
                <Icon name="cloud-upload" size={wp(6)} color={isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor} />
                <Text style={styles.uploadButtonText}>
                  {recordType === 'image' ? 'Select Images' : 'Select PDF Files'}
                </Text>
              </TouchableOpacity>

              {selectedFiles.map((file, index) => (
                <View key={index} style={styles.fileItem}>
                  <Icon 
                    name={recordType === 'image' ? 'image' : 'picture-as-pdf'} 
                    size={wp(5)} 
                    color={isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor}
                  />
                  <Text style={styles.fileName} numberOfLines={1}>
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </Text>
                  <TouchableOpacity style={styles.removeButton} onPress={() => removeFile(index)}>
                    <Icon name="close" size={wp(5)} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}

          <CustomButton 
            containerStyle={{ marginTop: hp(2) }}
            text="Save Health Records"
            onPress={handleSave}
          />
          
          {/* Debug button - remove in production */}
          <CustomButton 
            containerStyle={{ 
              marginTop: hp(1), 
              backgroundColor: '#FFA500' // Orange color for debug button
            }}
            text="🧪 Test Direct Upload (DEBUG)"
            onPress={testDirectUpload}
          />
        </>
      )}
    </View>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.headerContainer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Health Records (Optional)</Text>
          <Text style={styles.subtitle}>
            Upload relevant medical records to help your doctor prepare for the consultation
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.toggleButton}
          onPress={() => setShowUploadForm(!showUploadForm)}
        >
          <Icon 
            name={showUploadForm ? 'keyboard-arrow-up' : 'add'} 
            size={wp(5)} 
            color={Colors.white}
          />
          <Text style={styles.toggleButtonText}>
            {showUploadForm ? 'Hide' : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>

      {showUploadForm && renderUploadForm()}
    </View>
  );
};

export default HealthRecordsUpload;
