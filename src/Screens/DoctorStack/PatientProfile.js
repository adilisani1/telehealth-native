import React, {
  useState,
  useEffect
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import {useSelector} from 'react-redux';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Colors} from '../../Constants/themeColors';
import {Fonts} from '../../Constants/Fonts';
import {SCREENS} from '../../Constants/Screens';
import StackHeader from '../../components/Header/StackHeader';
import {Images} from '../../assets/Images/images';

const PatientProfile = ({navigation, route}) => {
  const {isDarkMode} = useSelector(store => store.theme);
  const theme = isDarkMode ? Colors.darkTheme : Colors.lightTheme;


  const patientParam = route?.params?.patient;
  const [patientData, setPatientData] = React.useState(null);
  const [prescription, setPrescription] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const fetchPatientProfile = async () => {
      if (!patientParam?.id && !patientParam?._id) return;
      setLoading(true);
      setError('');
      try {
        const patientId = patientParam.id || patientParam._id;
        const token = await import('../../utils/tokenStorage').then(m => m.getToken());
        const res = await fetch(`https://mrvwhr8v-5000.inc1.devtunnels.ms/api/doctor/patient/${patientId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        if (data && data.data && data.data.patient) {
          setPatientData(data.data.patient);
        }
        // Find latest completed appointment with prescription
        if (data && data.data && Array.isArray(data.data.history)) {
          const latestWithPrescription = data.data.history
            .filter(a => a.prescription && a.prescription.diagnosis)
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
          setPrescription(latestWithPrescription?.prescription || null);
        }
      } catch (e) {
        setError('Failed to load patient profile');
      } finally {
        setLoading(false);
      }
    };
    fetchPatientProfile();
  }, [patientParam]);

  const InfoRow = ({label, value}) => (
    <View style={styles.infoRow}>
      <Text style={[styles.label, {color: theme.secondryTextColor}]}>
        {label}
      </Text>
      <Text style={[styles.value, {color: theme.primaryTextColor}]}>
        {value || 'Not provided'}
      </Text>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
    },
    scrollContainer: {
      padding: wp(4),
    },
    header: {
      alignItems: 'center',
      marginBottom: hp(3),
    },
    profileImage: {
      width: wp(25),
      height: wp(25),
      borderRadius: wp(12.5),
      marginBottom: hp(2),
    },
    patientName: {
      fontSize: RFPercentage(2.8),
      fontFamily: Fonts.Bold,
      color: theme.primaryTextColor,
      marginBottom: hp(0.5),
    },
    patientAge: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Regular,
      color: theme.secondryTextColor,
    },
    infoContainer: {
      backgroundColor: theme.secondryColor,
      borderRadius: wp(3),
      padding: wp(4),
      marginBottom: hp(2),
    },
    sectionTitle: {
      fontSize: RFPercentage(2.4),
      fontFamily: Fonts.Bold,
      color: theme.primaryTextColor,
      marginBottom: hp(2),
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp(1.5),
    },
    label: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Medium,
      flex: 1,
    },
    value: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Regular,
      flex: 2,
      textAlign: 'right',
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: hp(2),
    },
    actionButton: {
      flex: 0.48,
      paddingVertical: hp(1.5),
      borderRadius: wp(2),
      alignItems: 'center',
    },
    callButton: {
      backgroundColor: Colors.success,
    },
    chatButton: {
      backgroundColor: theme.primaryColor,
    },
    notesButton: {
      backgroundColor: Colors.error,
      marginTop: hp(2),
    },
    actionButtonText: {
      color: Colors.white,
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Medium,
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StackHeader title="Patient Profile" />
        <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
          <Text style={{color: theme.primaryTextColor}}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }
  if (error || !patientData) {
    return (
      <SafeAreaView style={styles.container}>
        <StackHeader title="Patient Profile" />
        <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
          <Text style={{color: Colors.error}}>{error || 'Patient not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <StackHeader title="Patient Profile" />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Image source={Images.profile} style={styles.profileImage} />
          <Text style={styles.patientName}>{patientData.name}</Text>
          <Text style={styles.patientAge}>
            {patientData.dob ? `${Math.floor((Date.now() - new Date(patientData.dob)) / (365.25*24*60*60*1000))} years old` : ''} • {patientData.gender}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <InfoRow label="Phone" value={patientData.phone || patientData.mobile || 'Not provided'} />
          <InfoRow label="Email" value={patientData.email} />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Prescriptions</Text>
          {/* <InfoRow label="Blood Group" value={patientData.bloodGroup} />
          <InfoRow label="Allergies" value={patientData.allergies} />
          <InfoRow label="Medical History" value={patientData.medicalHistory} />
          <InfoRow label="Last Visit" value={patientData.lastVisit} /> */}
          {/* Prescription Entities */}
        
          <InfoRow label="Diagnosis" value={prescription?.diagnosis || 'Not Diagnosed yet'} />
          
          {Array.isArray(prescription?.medicines) && prescription.medicines.length > 0 ? (
            prescription.medicines.map((med, idx) => (
              <InfoRow key={idx} label={`Medicine ${idx+1}`} value={`${med.name} (${med.dosage}) - ${med.instructions}`} />
            ))
          ) : (
            <InfoRow label="Medicines" value="No medicines prescribed" />
          )}
        </View>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.callButton]}
            onPress={() => navigation.navigate(SCREENS.CALL)}>
            <Text style={styles.actionButtonText}>Video Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.chatButton]}
            onPress={() => navigation.navigate(SCREENS.CHAT)}>
            <Text style={styles.actionButtonText}>Send Message</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.actionButton, styles.notesButton]}
          onPress={() =>
            navigation.navigate(SCREENS.CONSULTATION_NOTES, {
              patient: patientData,
            })
          }>
          <Text style={styles.actionButtonText}>Add Consultation Notes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PatientProfile;
