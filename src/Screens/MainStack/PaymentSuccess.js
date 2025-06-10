import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Fonts } from '../../Constants/Fonts';
import StackHeader from '../../components/Header/StackHeader';
import { useSelector } from 'react-redux';
import { Colors } from '../../Constants/themeColors';
import CustomButton from '../../components/Buttons/customButton';
import { SCREENS } from '../../Constants/Screens';

const PaymentSuccess = ({ navigation }) => {
    const { isDarkMode } = useSelector(store => store.theme);

    const handleViewAppointment = () => {
        // Alert.alert('Navigate', 'View Appointment Pressed');
        // Add navigation logic here
    };

    const handleGoHome = () => {
        // Alert.alert('Navigate', 'Go to Home Pressed');
        // Add navigation logic here
    };



    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor,
            //   paddingHorizontal: wp(5),
            //   paddingVertical: hp(2),
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: hp(4),
        },
        headerText: {
            fontSize: RFPercentage(2.5),
            fontFamily: Fonts.Medium,
            color: '#333',
            marginLeft: wp(2),
        },
        successContainer: {
            alignItems: 'center',
            marginBottom: hp(5),
        },
        iconWrapper: {
            marginBottom: hp(2),
        },
        successText: {
            fontSize: RFPercentage(2.5),
            fontFamily: Fonts.Bold,
            color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
            marginBottom: hp(1),
        },
        subText: {
            fontSize: RFPercentage(2),
            fontFamily: Fonts.Regular,
            color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
            textAlign: 'center',
            marginBottom: hp(0.5),
        },
        doctorName: {
            fontSize: RFPercentage(2),
            fontFamily: Fonts.Medium,
            color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
            textAlign: 'center',
        },
        detailsContainer: {
            //   backgroundColor: '#F9F9F9',
            paddingVertical: hp(2),
            paddingHorizontal: wp(4),
            marginBottom: hp(4),
            borderTopColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,
            borderTopWidth: 2,
            borderStyle: 'dashed',
            flex: 1
        },
        detailRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: hp(1.5),
        },
        detailText: {
            fontSize: RFPercentage(2),
            fontFamily: Fonts.Regular,
            color: isDarkMode?Colors.darkTheme.primaryTextColor:Colors.lightTheme.primaryTextColor,
            marginLeft: wp(2),
        },
        buttonContainer: {
            alignItems: 'center',
            backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.secondryColor,
            elevation: 4,
            padding: wp(3),
            borderTopStartRadius: wp(7),
            borderTopEndRadius: wp(7),

        },
        btn: {
            backgroundColor: isDarkMode ? Colors.darkTheme.primaryBtn.BtnColor : Colors.lightTheme.primaryBtn.BtnColor,
            paddingVertical: hp(1.5),
            borderRadius: wp(2),
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: hp(1),
            marginHorizontal: wp(4),
            width: '90%',
        },
        btnText: {
            color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.secondryBtn.TextColor,
            fontFamily: Fonts.Bold,
            fontSize: RFPercentage(2),

        },

    });


    return (
        <View style={styles.container}>
            {/* Header */}
            <StackHeader title={'Payment'} headerStyle={{ paddingBottom: hp(1) }} />


            {/* Success Icon and Text */}
            <View style={{ paddingHorizontal: wp(5), flex: 1 , paddingTop: hp(7)}} >
                <View style={styles.successContainer}>
                    <View style={styles.iconWrapper}>
                        <Icon name="check-circle" size={RFPercentage(12)} color={isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor} />
                    </View>
                    <Text style={styles.successText}>Payment Successful</Text>
                    <Text style={styles.subText}>
                        You have successfully booked an appointment with
                    </Text>
                    <Text style={styles.doctorName}>Dr. Kenny Adeola</Text>
                </View>

                {/* Appointment Details */}
                <View style={styles.detailsContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }} >
                        <View style={styles.detailRow}>
                            <Icon name="person" size={RFPercentage(3)} color={isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor} />
                            <Text style={styles.detailText}>Madilyn Doe</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Icon name="confirmation-number" size={RFPercentage(3)} color={isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor} />
                            <Text style={styles.detailText}>#20</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }} >
                        <View style={[styles.detailRow, { marginLeft: wp(4) }]}>
                            <Icon name="calendar-today" size={RFPercentage(3)} color={isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor} />
                            <Text style={[styles.detailText,]}>19 Nov, 2023</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Icon name="schedule" size={RFPercentage(3)} color={isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor} />
                            <Text style={styles.detailText}>8:30 AM</Text>
                        </View>

                    </View>

                </View>

            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>

                <CustomButton containerStyle={styles.btn} text={'View Appointment'} textStyle={[styles.btnText, { color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.primaryBtn.TextColor, }]} onPress={() => navigation.navigate(SCREENS.MYAPPOINTMENT)} />
                <CustomButton containerStyle={styles.btn} text={'Go to Home'} mode={true} textStyle={[styles.btnText]} onPress={() => navigation.navigate(SCREENS.TABS)} />

            </View>
        </View>
    );
};

export default PaymentSuccess;
