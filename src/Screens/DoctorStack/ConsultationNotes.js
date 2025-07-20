import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {useSelector} from 'react-redux';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Colors} from '../../Constants/themeColors';
import {Fonts} from '../../Constants/Fonts';
import StackHeader from '../../components/Header/StackHeader';
import CustomButton from '../../components/Buttons/customButton';
import {useAlert} from '../../Providers/AlertContext';
import { getToken } from '../../utils/tokenStorage';


const ConsultationNotes = ({navigation}) => {
  const {isDarkMode} = useSelector(store => store.theme);
  const {showAlert} = useAlert();
  const theme = isDarkMode ? Colors.darkTheme : Colors.lightTheme;

  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    notes: '',
    diagnosis: '',
    medicines: [
      { name: '', dosage: '', instructions: '' },
    ],
  });

  useEffect(() => {
    const fetchCompletedAppointments = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const res = await fetch('https://mrvwhr8v-5000.inc1.devtunnels.ms/api/doctor/appointments/history', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        if (data && data.data && Array.isArray(data.data.history)) {
          setAppointments(data.data.history);
        }
      } catch (e) {
        showAlert('Failed to fetch completed appointments', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCompletedAppointments();
  }, []);

  const handleMedicineChange = (idx, field, value) => {
    setForm(prev => ({
      ...prev,
      medicines: prev.medicines.map((med, i) => i === idx ? { ...med, [field]: value } : med)
    }));
  };

  const addMedicine = () => {
    setForm(prev => ({ ...prev, medicines: [...prev.medicines, { name: '', dosage: '', instructions: '' }] }));
  };

  const removeMedicine = idx => {
    setForm(prev => ({ ...prev, medicines: prev.medicines.filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    if (!selectedAppointment) {
      showAlert('Please select a completed appointment', 'error');
      return;
    }
    if (!form.notes.trim() || !form.diagnosis.trim()) {
      showAlert('Please fill in notes and diagnosis', 'error');
      return;
    }
    const medicines = form.medicines.filter(med => med.name.trim() && med.dosage.trim() && med.instructions.trim());
    if (medicines.length === 0) {
      showAlert('Please add at least one medicine (all fields required)', 'error');
      return;
    }
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch(`https://mrvwhr8v-5000.inc1.devtunnels.ms/api/doctor/appointments/${selectedAppointment}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: form.notes,
          diagnosis: form.diagnosis,
          medicines,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showAlert('Consultation notes saved successfully', 'success');
        navigation.goBack();
      } else {
        showAlert(data.message || 'Failed to save consultation notes', 'error');
      }
    } catch (e) {
      showAlert('Failed to save consultation notes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
    },
    scrollContainer: {
      padding: wp(4),
    },
    patientInfo: {
      backgroundColor: theme.secondryColor,
      padding: wp(4),
      borderRadius: wp(3),
      marginBottom: hp(2),
    },
    patientName: {
      fontSize: RFPercentage(2.4),
      fontFamily: Fonts.Bold,
      color: theme.primaryTextColor,
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: hp(2),
      width: '100%',
    },
    label: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Medium,
      color: theme.primaryTextColor,
      marginBottom: hp(1),
    },
    textInput: {
      borderWidth: 1,
      borderColor: theme.BorderGrayColor,
      borderRadius: wp(2),
      padding: wp(3),
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Regular,
      color: theme.primaryTextColor,
      backgroundColor: theme.secondryColor,
      textAlignVertical: 'top',
    },
    multilineInput: {
      height: hp(12),
    },
    singleLineInput: {
      height: hp(6),
    },
    buttonContainer: {
      marginTop: hp(3),
      marginBottom: hp(2),
      alignItems: 'center',
      width: '100%',
    },
    saveButton: {
      width: '100%',
      paddingVertical: hp(2.2),
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 3,
      marginTop: 8,
    },
    saveButtonText: {
      color: Colors.white,
      fontFamily: Fonts.Bold,
      fontSize: RFPercentage(2.2),
      letterSpacing: 0.5,
    },
    pickerWrapper: {
      borderWidth: 1,
      borderColor: Colors.primary,
      borderRadius: wp(2),
      backgroundColor: Colors.lightTheme.secondryColor,
      marginTop: 4,
      marginBottom: 8,
      overflow: 'hidden',
      minHeight: hp(8.5),
      justifyContent: 'center',
      width: '100%',
      paddingBottom: 0,
      paddingTop: 4,
      paddingVertical: 8,
    },
    picker: {
      width: '100%',
      color: Colors.primary,
      fontFamily: Fonts.Medium,
      fontSize: RFPercentage(2.2),
      backgroundColor: 'transparent',
      minHeight: hp(7.5),
      fontWeight: 'bold',
      textAlignVertical: 'center',
      paddingVertical: 8,
    },
    medicineCard: {
      backgroundColor: Colors.lightTheme.secondryColor,
      borderRadius: 12,
      padding: wp(3),
      marginBottom: hp(1.5),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    addMedicineBtn: {
      marginTop: 8,
      alignSelf: 'flex-start',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: Colors.lightTheme.backgroundColor,
    },
    enhancedInput: {
      backgroundColor: Colors.lightTheme.backgroundColor,
      borderWidth: 0.5,
      borderColor: Colors.primary,
      borderRadius: 8,
      marginTop: 6,
      marginBottom: 6,
      paddingLeft: 12,
      paddingRight: 12,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StackHeader title="Consultation Notes" />
      <ScrollView style={styles.scrollContainer}>
        <View style={[styles.inputContainer, {zIndex: 10}]}> 
          <Text style={styles.label}>Select Completed Appointment *</Text>
          <View style={[styles.pickerWrapper, {backgroundColor: isDarkMode ? '#222' : '#fff', borderColor: theme.primaryColor}]}> 
            <Picker
              selectedValue={selectedAppointment}
              onValueChange={itemValue => setSelectedAppointment(itemValue)}
              style={[styles.picker, {
                color: selectedAppointment ? theme.primaryTextColor : theme.secondryTextColor,
                fontWeight: selectedAppointment ? 'bold' : 'normal',
                backgroundColor: 'transparent',
              }]}
              dropdownIconColor={theme.primaryColor}
              mode={Platform.OS === 'ios' ? 'dialog' : 'dropdown'}
              enabled={appointments.length > 0}
            >
              <Picker.Item label="Select appointment..." value="" color={theme.secondryTextColor} />
              {appointments.map(appt => (
                <Picker.Item
                  key={String(appt._id)}
                  label={`${appt.patient?.name || 'Patient'} | ${new Date(appt.date).toLocaleString()}`}
                  value={String(appt._id)}
                  color={theme.primaryTextColor}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Notes *</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            placeholder="Enter consultation notes..."
            placeholderTextColor={theme.secondryTextColor}
            value={form.notes}
            onChangeText={text => setForm(f => ({ ...f, notes: text }))}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Diagnosis *</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            placeholder="Enter diagnosis..."
            placeholderTextColor={theme.secondryTextColor}
            value={form.diagnosis}
            onChangeText={text => setForm(f => ({ ...f, diagnosis: text }))}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Medicines *</Text>
          {form.medicines.map((med, idx) => (
            <View key={idx} style={styles.medicineCard}>
              <TextInput
                style={[styles.textInput, styles.singleLineInput]}
                placeholder="Medicine Name"
                placeholderTextColor={theme.secondryTextColor}
                value={med.name}
                onChangeText={text => handleMedicineChange(idx, 'name', text)}
              />
              <TextInput
                style={[styles.textInput, styles.singleLineInput, { marginTop: 4 }]}
                placeholder="Dosage (e.g. 5mg)"
                placeholderTextColor={theme.secondryTextColor}
                value={med.dosage}
                onChangeText={text => handleMedicineChange(idx, 'dosage', text)}
              />
              <TextInput
                style={[styles.textInput, styles.singleLineInput, { marginTop: 4 }]}
                placeholder="Instructions (e.g. Once daily)"
                placeholderTextColor={theme.secondryTextColor}
                value={med.instructions}
                onChangeText={text => handleMedicineChange(idx, 'instructions', text)}
              />
              {form.medicines.length > 1 && (
                <TouchableOpacity onPress={() => removeMedicine(idx)} style={{ marginTop: 4 }}>
                  <Text style={{ color: Colors.error, fontFamily: Fonts.Medium }}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity onPress={addMedicine} style={styles.addMedicineBtn}>
            <Text style={{ color: theme.primaryColor, fontFamily: Fonts.Medium }}>+ Add Medicine</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: Colors.success, opacity: loading ? 0.6 : 1 },
            ]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Consultation Notes'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ConsultationNotes;
