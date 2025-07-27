import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import CustomButton from '../Buttons/customButton'
import { RFPercentage } from 'react-native-responsive-fontsize'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Fonts } from '../../Constants/Fonts';
import { Colors } from '../../Constants/themeColors';
import { useNavigation } from '@react-navigation/native';
import { SCREENS } from '../../Constants/Screens';
import { Images } from '../../assets/Images/images';
import DisplayRating from '../Rating/DisplayRating';

const DoctorCard = ({ item }) => {
    const { isDarkMode } = useSelector(store => store.theme);

    const navigation = useNavigation()


    const styles = StyleSheet.create({
        doctorImage: {
            width: wp(12),
            height: wp(12),
            borderRadius: wp(6),
            marginRight: wp(4)
        },
        doctorName: {
            fontSize: RFPercentage(2),
            fontFamily: Fonts.Medium,
            color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor
        },
        specialization: {
            fontSize: RFPercentage(1.7),
            color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
            fontFamily: Fonts.Regular,

        },

        doctorCard: {
            flexDirection: 'row',
            padding: wp(4),
            backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.secondryColor,
            borderRadius: wp(3),
            marginBottom: hp(1.5),
            elevation: 2,
            justifyContent: 'space-between'
        },
        rating: {
            fontSize: RFPercentage(1.8),
            color: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.secondryTextColor,
            backgroundColor: `${Colors.lightTheme.primaryColor}40`, paddingHorizontal: wp(1), borderRadius: wp(1), marginRight: wp(2)
        },
        reviews: {
            fontSize: RFPercentage(1.6),
            color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
        },
        ratingContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: hp(0.5),
        },
        ratingText: {
            fontSize: RFPercentage(1.8),
            fontFamily: Fonts.Medium,
            color: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
            marginLeft: wp(1),
        },
        reviewCount: {
            fontSize: RFPercentage(1.6),
            fontFamily: Fonts.Regular,
            color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
            marginLeft: wp(2),
        },
    })
    console.log(item.who, 'who')

    // Get rating data from doctorProfile or fallback to old rating field
    const averageRating = item.doctorProfile?.averageRating || item.rating || 0;
    const totalReviews = item.doctorProfile?.totalReviews || item.reviews || 0;

    return (
        <TouchableOpacity style={styles.doctorCard} onPress={() => {
            navigation.navigate(SCREENS.DETAILS, { who: 'doctor', doctorId: item.id || item._id });
        }} >
            <View style={{ flexDirection: 'row' }} >
                <Image source={Images.dr2} style={styles.doctorImage} />
                <View>
                    <Text style={styles.doctorName}>{item.name}</Text>
                    <Text style={styles.specialization}>{item.specialization ? item.specialization : item.location}</Text>
                    
                    {/* Updated Rating Display */}
                    <DisplayRating 
                        rating={averageRating}
                        totalReviews={totalReviews}
                        size={16}
                        style={{ marginTop: hp(0.5) }}
                    />
                </View>
            </View>
            <CustomButton onPress={() => {
                navigation.navigate(SCREENS.DETAILS, { who: 'doctor', doctorId: item.id || item._id });
            }} icon={'arrow-right'} iconSize={RFPercentage(3.2)} iconColor={isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.secondryTextColor} containerStyle={{ alignItems: 'center', justifyContent: 'center' }} />
            {/* {
                item.who === 'ambulance' ? <CustomButton icon={'phone'} iconSize={RFPercentage(3.2)} iconColor={isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.secondryTextColor} containerStyle={{ alignItems: 'center', justifyContent: 'center', backgroundColor: isDarkMode?Colors.darkTheme.primaryColor: Colors.lightTheme.primaryColor, paddingHorizontal: wp(2), height: hp(5), alignSelf: 'center', borderRadius: wp(6) }} />:
            } */}




        </TouchableOpacity>
    )
}

export default DoctorCard
