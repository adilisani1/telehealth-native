import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AirbnbRating } from 'react-native-ratings';
import StackHeader from '../../components/Header/StackHeader';
import { useSelector } from 'react-redux';
import { Colors } from '../../Constants/themeColors';
import { Fonts } from '../../Constants/Fonts';
import CustomButton from '../../components/Buttons/customButton';
import { SCREENS } from '../../Constants/Screens';
import { Images } from '../../assets/Images/images';
import moment from 'moment';

const ReviewSummary = ({navigation, route}) => {
    const { isDarkMode } = useSelector(store => store.theme);
    // Get real data from route.params
    const appointment = route?.params?.appointment;
    const doctor = appointment?.doctor;
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor,
            //   padding: wp('5%'),
        },

        doctorContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingBottom: hp('1.5%'),
            marginBottom: hp('2.5%'),
            borderBottomColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,
            borderBottomWidth: 1
        },
        doctorImage: {
            width: wp('20%'),
            height: wp('20%'),
            borderRadius: wp('10%'),
            marginRight: wp('4%'),
        },
        editIcon: {
            position: 'absolute',
            bottom: 0,
            right: wp('37%'),
            backgroundColor: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
            borderRadius: wp('5%'),
            padding: wp('2%'),
            borderWidth: wp(0.5),
            borderColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.secondryColor
        },
        doctorDetails: {
            flex: 1,
        },
        doctorName: {
            fontSize: RFPercentage(2.2),
            fontFamily: Fonts.Bold,
            color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
        },
        doctorSpeciality: {
            fontSize: RFPercentage(1.8),
            fontFamily: Fonts.Thin,
            color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
            marginVertical: hp('0.5%'),
        },
        locationContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: hp('0.5%'),
        },
        locationText: {
            fontSize: RFPercentage(1.8),
            fontFamily: Fonts.Regular,
            color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
            marginLeft: wp('1%'),
        },
        ratingContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        reviewText: {
            fontSize: RFPercentage(1.7),
            fontFamily: Fonts.Regular,
            color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
            borderLeftColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.secondryTextColor,
            borderLeftWidth: 1,
            paddingLeft: wp(2),

        },
        sectionContainer: {
            marginBottom: hp('2.5%'),
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,
            paddingBottom: hp('1.5%'),
        },
        sectionTitle: {
            fontSize: RFPercentage(2),
            fontFamily: Fonts.Medium,
            color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
            marginBottom: hp('1%'),
        },
        infoRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: hp('1%'),
            marginTop: hp('0.3%'),
        },
        infoLabel: {
            fontSize: RFPercentage(1.9),
            fontFamily: Fonts.Regular,
            color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
        },
        infoValue: {
            fontSize: RFPercentage(1.8),
            fontFamily: Fonts.Regular,
            color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
            textAlign: 'right',
        },
        forgetText: {
            color: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
            fontSize: RFPercentage(1.8),
            fontFamily: Fonts.Regular,
            // marginTop: hp(1),
            textAlign: 'right',
        },
         btn: {
              backgroundColor: isDarkMode ? Colors.darkTheme.primaryBtn.BtnColor : Colors.lightTheme.primaryBtn.BtnColor,
              paddingVertical: hp(1.8),
              borderRadius: wp(2),
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: hp(3),
            marginHorizontal : wp(5),
            marginBottom: hp(4)


            },
            btnText: {
              color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.secondryBtn.TextColor,
              fontFamily: Fonts.Bold,
              fontSize: RFPercentage(2),
        
            },
    });
    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <StackHeader title={'Review Summary'} headerStyle={{ paddingBottom: hp(1) }}  />

            {/* Doctor Info */}
            <View style={{ paddingHorizontal: wp(5), marginTop: hp(1), flex: 1 }} >
                <View style={styles.doctorContainer}>
                    <View>
                        <Image
                            source={doctor?.avatar ? { uri: doctor.avatar } : Images.dr2}
                            style={styles.doctorImage}
                        />
                        <TouchableOpacity style={styles.editIcon}>
                            <Icon name="star-shooting" size={RFPercentage(2.5)} color={isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.doctorDetails}>
                        <Text style={styles.doctorName}>{doctor?.name || 'Dr. Kenny Adeola'}</Text>
                        <Text style={styles.doctorSpeciality}>{doctor?.specialization || 'General Practitioner'}</Text>
                        <View style={styles.locationContainer}>
                            <Icon name="map-marker" size={RFPercentage(2)} color={isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor} />
                            <Text style={styles.locationText}>{doctor?.location || 'Lagos, Nigeria'}</Text>
                        </View>
                        <View style={styles.ratingContainer}>
                            <AirbnbRating
                                count={5}
                                showRating={false}
                                defaultRating={doctor?.rating || 5}
                                size={RFPercentage(2)}
                                onFinishRating={value => {}}
                            />
                            <Text style={styles.reviewText}>{doctor?.reviews ? `${doctor.reviews} Reviews` : '52 Reviews'}</Text>
                        </View>
                    </View>
                </View>

                {/* Appointment Info */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Schedule Appointment</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Date & Hour</Text>
                        <Text style={styles.infoValue}>{appointment ? `${moment(appointment.date).format('MMMM DD, YYYY')} | ${moment(appointment.date).format('hh:mm A')}` : 'November 24, 2023 | 8:30 AM'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Package</Text>
                        <Text style={styles.infoValue}>Video Call</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Booking For</Text>
                        <Text style={styles.infoValue}>{appointment?.patientName || 'Self'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Duration</Text>
                        <Text style={styles.infoValue}>30 minutes</Text>
                    </View>
                </View>

                {/* Patient Info */}
                <View style={styles.sectionContainer}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Amount</Text>
                        <Text style={styles.infoValue}>$1000</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Duration (30 mins)</Text>
                        <Text style={styles.infoValue}>20 mins</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Duration</Text>
                        <Text style={styles.infoValue}>27 minutes</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Total</Text>
                        <Text style={[styles.infoValue]} >$1500</Text>
                    </View>
                </View>
                <View style={styles.infoRow}>
                    <View style={{ flexDirection: 'row' }} >
                        <Icon name='credit-card' size={20} color={isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor} style={{ marginRight: wp(2) }} />
                        <Text style={styles.infoLabel}>Card Selected</Text>
                    </View>
                    <CustomButton text={'Change'} textStyle={styles.forgetText} containerStyle={{ width: wp(40), alignSelf: 'flex-end' }} onPress={() => navigation.navigate(SCREENS.PAYMENTOPTION)} />
                </View>
            </View>
            <CustomButton containerStyle={styles.btn} text={'Pay now'} textStyle={[styles.btnText, {color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.primaryBtn.TextColor,}]} onPress={()=> navigation.navigate(SCREENS.PAYMENTSUCCESS)} />
        </ScrollView>
    );
};



export default ReviewSummary;