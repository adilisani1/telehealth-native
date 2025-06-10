import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Ensure you install react-native-vector-icons
import { useSelector } from 'react-redux';
import { Colors } from '../../Constants/themeColors';
import { Fonts } from '../../Constants/Fonts';

const StatCard = ({ icon, value, label, iconColor }) => {
    const { isDarkMode } = useSelector(store => store.theme);

    const styles = StyleSheet.create({
        cardContainer: {
            width: wp(25),
            paddingVertical: hp(2),
            backgroundColor: isDarkMode? Colors.darkTheme.secondryColor: Colors.lightTheme.secondryColor,
            borderRadius: wp(2),
            alignItems: 'center',
            elevation: 2,
            height: hp(15),
            justifyContent: 'flex-end'
        },
        iconContainer: {
            backgroundColor: `${iconColor}40`,
            paddingTop: hp(2.5),
            paddingHorizontal: hp(1),
            paddingHorizontal: hp(1),
            paddingBottom: hp(0.8),
            position: 'absolute',
            top:0,
            borderBottomRightRadius: wp(6),
            borderBottomLeftRadius: wp(6),
        },
        value: {
            fontSize: RFPercentage(2.2),
            fontFamily: Fonts.Bold,
            color: isDarkMode? Colors.darkTheme.primaryTextColor: Colors.lightTheme.primaryTextColor,
        },
        label: {
            fontSize: RFPercentage(1.5),
            fontFamily: Fonts.Regular,
            color: isDarkMode? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
            // marginTop: hp(0.5),
            
        },
    });
    return (
        <View style={styles.cardContainer}>
            <View style={styles.iconContainer}>
                {/* <Icon name={iconName} size={RFPercentage(3)} color={iconColor} /> */}
                {icon}
            </View>
                <Text style={styles.value}>{value}</Text>
                <Text style={styles.label}>{label}</Text>
        </View>
    );
};



export default StatCard;
