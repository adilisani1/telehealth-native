import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialIcons';
import StackHeader from '../../components/Header/StackHeader';
import { useSelector } from 'react-redux';
import { Colors } from '../../Constants/themeColors';
import { Fonts } from '../../Constants/Fonts';

const TermsAndCondition = () => {
  const { isDarkMode } = useSelector(store => store.theme);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode? Colors.darkTheme.backgroundColor: Colors.lightTheme.backgroundColor,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('4%'),
  },
  section: {
    marginTop: hp('2%'),
    paddingHorizontal: wp('4%'),
  },
  sectionTitle: {
    fontSize: RFPercentage(2.5),
    fontWeight: Fonts.Bold,
    color: isDarkMode? Colors.darkTheme.primaryColor: Colors.lightTheme.primaryColor, // Green color
    marginBottom: hp('1%'),
  },
  effectiveDate: {
    fontSize: RFPercentage(2),
    fontStyle: 'italic',
    color: isDarkMode?Colors.darkTheme.primaryTextColor: Colors.lightTheme.primaryTextColor,
    marginBottom: hp('1%'),
  },
  sectionText: {
    fontSize: RFPercentage(2),
    color: isDarkMode? Colors.darkTheme.secondryTextColor: Colors.lightTheme.secondryTextColor,
    marginBottom: hp('1.5%'),
    lineHeight: RFPercentage(3), // Improves readability
  },
});
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <StackHeader title={'Privacy Policy'} />
      {/* Cancellation Policy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cancellation Policy</Text>
        <Text style={styles.effectiveDate}>Effective Date: [Date]</Text>
        <Text style={styles.sectionText}>
          Overview: This Cancellation Policy outlines the procedures and conditions related to the
          cancellation of appointments on our telemedicine app. By using our services, you agree to
          abide by the terms and conditions outlined in this policy.
        </Text>
        <Text style={styles.sectionText}>
          For any questions or concerns regarding this policy, please contact our customer support
          team.
        </Text>
      </View>

      {/* Terms & Conditions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Terms & Condition</Text>
        <Text style={styles.effectiveDate}>Effective Date: [Date]</Text>
        <Text style={styles.sectionText}>
          1. Acceptance of Terms: By accessing or using MyDoctor app, you agree to comply with and
          be bound by these Terms and Conditions. If you do not agree with any part of these terms,
          you may not use our services.
        </Text>
        <Text style={styles.sectionText}>
          2. Eligibility: You must be at least 18 years old and have the legal capacity to enter
          into a contract to use our services. By using our services, you represent and warrant
          that you meet these eligibility requirements.
        </Text>
        <Text style={styles.sectionText}>
          3. Services: MyDoctor app provides a platform for virtual medical consultations,
          information sharing, and related services. Users understand that the app is not a
          substitute for professional medical advice, diagnosis, or treatment.
        </Text>
        <Text style={styles.sectionText}>
          4. User Accounts: Users are required to create an account to access certain features of
          the app. You are responsible for maintaining the confidentiality of your account
          credentials and for all activities that occur under your account.
        </Text>
      </View>
    </ScrollView>
  );
};


export default TermsAndCondition;
