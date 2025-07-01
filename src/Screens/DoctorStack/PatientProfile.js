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

  const patient = route?.params?.patient;

  const defaultPatient = {
    name: 'John Doe',
    age: 35,
    gender: 'Male',
    phone: '+1234567890',
    email: 'john.doe@email.com',
    address: '123 Main St, City, State',
    bloodGroup: 'O+',
    allergies: 'None',
    medicalHistory: 'Hypertension, Diabetes',
    lastVisit: '2024-01-15',
  };

  const patientData = patient || defaultPatient;

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

  return (
    <SafeAreaView style={styles.container}>
      <StackHeader title="Patient Profile" />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Image source={Images.profile} style={styles.profileImage} />
          <Text style={styles.patientName}>{patientData.name}</Text>
          <Text style={styles.patientAge}>
            {patientData.age} years old • {patientData.gender}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <InfoRow label="Phone" value={patientData.phone} />
          <InfoRow label="Email" value={patientData.email} />
          <InfoRow label="Address" value={patientData.address} />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Medical Information</Text>
          <InfoRow label="Blood Group" value={patientData.bloodGroup} />
          <InfoRow label="Allergies" value={patientData.allergies} />
          <InfoRow label="Medical History" value={patientData.medicalHistory} />
          <InfoRow label="Last Visit" value={patientData.lastVisit} />
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
