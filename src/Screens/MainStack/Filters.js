import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { Fonts } from '../../Constants/Fonts';
import { useSelector } from 'react-redux';
import CustomDropDown from '../../components/DropDown/CustomDropDown';
import StackHeader from '../../components/Header/StackHeader';
import { Colors } from '../../Constants/themeColors';
import CustomButton from '../../components/Buttons/customButton';
import { AirbnbRating } from 'react-native-ratings';
import { useAlert } from '../../Providers/AlertContext';

const Filters = ({ navigation }) => {
    const { isDarkMode } = useSelector(store => store.theme);
    const [selectedSpecialty, setSelectedSpecialty] = useState('All');
    const [selectedRating, setSelectedRating] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const { showAlert } = useAlert();


    const languages = [
        'English',
        'English and Yoruba',
        'English and Hausa',
        'English and Igbo',
        'English and Fulfulde',
        'English and Kanuri',
    ];
    const specialties = ['All', 'Doctor', 'Pharmacy', 'Ambulance'];
    const ratings = [
        { id: '1', value: 'Nil', rate: 0 },
        { id: '2', value: '4.5 and above', rate: 5 },
        { id: '3', value: '4.0 - 4.5', rate: 4 },
        { id: '4', value: '3.5 - 4.0', rate: 3 },
        { id: '5', value: '3.0 - 3.5', rate: 2 },
        { id: '6', value: '2.5 - 3.0', rate: 1 },
    ];



    const styles = StyleSheet.create({
        container: {
            flex: 1,
            padding: wp(4),
            backgroundColor: isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor,
        },
        sectionTitle: {
            fontSize: RFPercentage(2),
            fontFamily: Fonts.Bold,
            marginVertical: hp(1),
            color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
        },
        specialtyContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: hp(2),
        },
        specialtyButton: {
            paddingVertical: hp(1.2),
            paddingHorizontal: wp(4),
            borderRadius: wp(2),
        },
        selectedSpecialty: {
            backgroundColor: isDarkMode ? Colors.darkTheme.primaryBtn.BtnColor : Colors.lightTheme.primaryBtn.BtnColor,
        },
        specialtyText: {
            fontSize: RFPercentage(1.8),
            fontFamily: Fonts.Regular,
            color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
        },
        selectedSpecialtyText: {
            color: isDarkMode ? Colors.lightTheme.primaryTextColor : Colors.darkTheme.primaryTextColor,
        },
        ratingContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: hp(2),
        },
        ratingStars: {
            // flexDirection: 'row',
            marginRight: wp(3),
            // marginBottom: hp(2),
            alignItems: 'center',

        },
        ratingText: {
            flex: 1,
            fontSize: RFPercentage(1.8),
            fontFamily: Fonts.Regular,
            color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
            textAlignVertical: 'center',
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
            color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.primaryBtn.TextColor,
            fontFamily: Fonts.Bold,
            fontSize: RFPercentage(2),

        },

    });

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <StackHeader title={'Search Filters'} headerStyle={{ paddingLeft: 0, paddingBottom: hp(2) }} />

            {/* Specialty */}
            <Text style={styles.sectionTitle}>Specialty</Text>
            <View style={styles.specialtyContainer}>
                {specialties.map((item) => (

                    <CustomButton keey={item} containerStyle={[styles.specialtyButton,
                    selectedSpecialty === item && styles.selectedSpecialty]} mode={selectedSpecialty === item ? false : true} onPress={() => setSelectedSpecialty(item)} text={item} textStyle={[
                        styles.specialtyText,
                        selectedSpecialty === item && styles.selectedSpecialtyText,
                    ]} />
                ))}
            </View>

            {/* Reviews */}
            <Text style={styles.sectionTitle}>Reviews</Text>
            <FlatList
                data={ratings}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.ratingContainer}
                        onPress={() => setSelectedRating(item.value)}
                    >
                        <View style={styles.ratingStars}>

                            <AirbnbRating
                                count={5}
                                showRating={false}
                                defaultRating={item.rate}
                                size={RFPercentage(3)}
                                // starImage={<Images.food1 />}
                                // ratingContainerStyle={{marginBottom: 20, width: 50}}
                                onFinishRating={value => {
                                    // setRating(value);
                                }}
                            />

                        </View>
                        <Text style={styles.ratingText}>{item.value}</Text>
                        <Icon
                            name={selectedRating === item.value ? 'radio-button-on' : "radio-button-unchecked"}
                            size={wp(5)}
                            color={selectedRating === item.value ? isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor : isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.secondryTextColor}
                        />
                    </TouchableOpacity>
                )}
            />

            {/* Language */}
            <Text style={styles.sectionTitle}>Language and Communication</Text>

            <CustomDropDown
                data={languages}
                selectedValue={selectedLanguage}
                onValueChange={setSelectedLanguage}
                placeholder="Select Language"
            />



            <CustomButton containerStyle={styles.btn} text={'Apply'} textStyle={[styles.btnText]} onPress={() => {
                showAlert('Filters Applied Successfully', 'success');
                setTimeout(() => {
                    navigation.goBack();
                }, 2500);
            }} />
        </ScrollView>
    );
};



export default Filters;