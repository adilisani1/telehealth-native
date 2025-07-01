import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
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

const ConsultationNotes = ({navigation, route}) => {
  const {isDarkMode} = useSelector(store => store.theme);
  const {showAlert} = useAlert();
  const theme = isDarkMode ? Colors.darkTheme : Colors.lightTheme;

  const patient = route?.params?.patient || {name: 'Patient'};

  const [notes, setNotes] = useState({
    symptoms: '',
    diagnosis: '',
    prescription: '',
    recommendations: '',
    followUp: '',
  });

  const handleSave = () => {
    if (!notes.symptoms.trim() || !notes.diagnosis.trim()) {
      showAlert('Please fill in symptoms and diagnosis', 'error');
      return;
    }

    // Save consultation notes
    console.log('Saving consultation notes:', notes);
    showAlert('Consultation notes saved successfully', 'success');
    navigation.goBack();
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
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StackHeader title="Consultation Notes" />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>Patient: {patient.name}</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Symptoms *</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            placeholder="Describe patient's symptoms..."
            placeholderTextColor={theme.secondryTextColor}
            value={notes.symptoms}
            onChangeText={text => setNotes({...notes, symptoms: text})}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Diagnosis *</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            placeholder="Enter your diagnosis..."
            placeholderTextColor={theme.secondryTextColor}
            value={notes.diagnosis}
            onChangeText={text => setNotes({...notes, diagnosis: text})}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Prescription</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            placeholder="List medications and dosages..."
            placeholderTextColor={theme.secondryTextColor}
            value={notes.prescription}
            onChangeText={text => setNotes({...notes, prescription: text})}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Recommendations</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            placeholder="Lifestyle recommendations, diet, exercise..."
            placeholderTextColor={theme.secondryTextColor}
            value={notes.recommendations}
            onChangeText={text => setNotes({...notes, recommendations: text})}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Follow-up</Text>
          <TextInput
            style={[styles.textInput, styles.singleLineInput]}
            placeholder="Next appointment date or follow-up instructions..."
            placeholderTextColor={theme.secondryTextColor}
            value={notes.followUp}
            onChangeText={text => setNotes({...notes, followUp: text})}
          />
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            text="Save Consultation Notes"
            onPress={handleSave}
            containerStyle={{backgroundColor: Colors.success}}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ConsultationNotes;
