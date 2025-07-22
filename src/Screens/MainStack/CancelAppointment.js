import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import StackHeader from '../../components/Header/StackHeader';
import { useSelector } from 'react-redux';
import { Colors } from '../../Constants/themeColors';
import { Fonts } from '../../Constants/Fonts';
import CustomButton from '../../components/Buttons/customButton';
import TxtInput from '../../components/TextInput/Txtinput';
import { useAlert } from '../../Providers/AlertContext';

const CancelAppointment = ({ navigation }) => {
    const [reason, setReason] = useState('');
    const { isDarkMode } = useSelector(store => store.theme);
    const [selectedReason, setSelectedReason] = useState('');
    const { showAlert } = useAlert();



    const reasons = [
        'Rescheduling',
        'Feeling Better',
        'Weather conditions',
        'Financial Constraints',
        'Unexpected Work',
        'Others',
    ];


    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor,
        },

        instructionText: {
            fontSize: RFPercentage(2),
            fontFamily: Fonts.Regular,
            color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.secondryTextColor,
            marginBottom: hp('3%'),
        },
        reasonContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: hp('2%'),
        },
        reasonText: {
            fontSize: RFPercentage(2),
            fontFamily: Fonts.Thin,
            color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.secondryTextColor,
            marginLeft: wp('2%'),
        },
        otherLabel: {
            fontSize: RFPercentage(2),
            fontFamily: Fonts.Medium,
            color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.secondryTextColor,
            marginTop: hp('2%'),
            marginBottom: hp('1%'),
        },
        textInput: {
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: wp('2%'),
            padding: wp('4%'),
            fontSize: RFPercentage(2),
            fontFamily: Fonts.Regular,
            color: '#333',
        },

        btn: {
            backgroundColor: isDarkMode ? Colors.darkTheme.primaryBtn.BtnColor : Colors.lightTheme.primaryBtn.BtnColor,
            paddingVertical: hp(1.5),
            borderRadius: wp(2),
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: hp(2),
            marginHorizontal: wp(4)
            // borderColor:  isDarkMode ? Colors.darkTheme.primaryBtn.BtnColor : Colors.lightTheme.primaryBtn.BtnColor,
            // borderWidth: scaleHeight(2)
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
            <StackHeader title={'Cancel Appointment'} />

            {/* Instructions */}
            <View style={{ paddingHorizontal: wp('5%'), flexGrow: 1 }}>
                <Text style={styles.instructionText}>
                    Please let us know the reason for your cancellation so that we can better serve you, we care about your health.
                </Text>

                {/* Reasons */}
                {reasons.map((reason, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.reasonContainer}
                        onPress={() => setSelectedReason(reason)}

                    >
                        <MaterialIcons
                            name={selectedReason === reason ? 'radio-button-checked' : 'radio-button-unchecked'}
                            size={RFPercentage(2.5)}
                            color={selectedReason === reason ? isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor : isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.secondryTextColor}
                            onPress={() => setSelectedReason(reason)}
                        />
                        <Text style={styles.reasonText}>{reason}</Text>
                    </TouchableOpacity>
                ))}

                {/* Other Reason Input */}
                {selectedReason === 'Others' && (

                    <View style={{ flexGrow: 1 }} >
                        <Text style={styles.otherLabel}>Others</Text>
                        <TxtInput placeholder={'Describe your problem'} style={{ flex: 1, marginBottom: hp(4), }} value={reason} onChangeText={setReason} containerStyle={{ paddingHorizontal: wp(3), }} multiline={true} numberOfLines={5} />

                    </View>
                )}

                {/* Cancel Appointment Button */}
                <View>
                    <CustomButton containerStyle={styles.btn} text={'Cancel Appointment'} textStyle={[styles.btnText, { color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.primaryBtn.TextColor, }]} onPress={() => {
                        showAlert('Appointment Cancelled Successfully', 'success');
                        setTimeout(() => {
                            navigation.goBack();
                        }, 2500);
                    }} />
                </View>

            </View>


        </View>
    );
};


export default CancelAppointment;