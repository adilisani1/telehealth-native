import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Ensure you install react-native-vector-icons
import { useSelector } from 'react-redux';
import { Fonts } from '../../Constants/Fonts';
import { Colors } from '../../Constants/themeColors';

const CommunicationCard = ({ iconName, title, subtitle, backgroundColor, onPress }) => {
    const { isDarkMode } = useSelector(store => store.theme);



    const styles = StyleSheet.create({
        cardContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: hp(1),
        },
        iconContainer: {
            width: wp(12),
            height: wp(12),
            borderRadius: wp(4),
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: wp(4),
        },
        textContainer: {
            flex: 1,
        },
        title: {
            fontSize: RFPercentage(2),
            fontFamily: Fonts.Bold,
            color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
        },
        subtitle: {
            fontSize: RFPercentage(1.8),
           fontFamily: Fonts.Regular,
            color: isDarkMode? Colors.darkTheme.primaryTextColor : Colors.lightTheme.secondryTextColor,
        },
    });
    return (
        <TouchableOpacity onPress={onPress}  style={styles.cardContainer}>
            <View style={[styles.iconContainer, { backgroundColor: `${backgroundColor}40` }]}>
                <Icon name={iconName} size={RFPercentage(3)} color={backgroundColor} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
        </TouchableOpacity>
    );
};



export default CommunicationCard;
