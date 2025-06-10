import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import StackHeader from '../../components/Header/StackHeader';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { Colors } from '../../Constants/themeColors';
import TxtInput from '../../components/TextInput/Txtinput';
import { Fonts } from '../../Constants/Fonts';
import { TouchableOpacity } from 'react-native';
import { SCREENS } from '../../Constants/Screens';
import { Images } from '../../assets/Images/images';


const doctors = [
    { id: '1', name: 'Dr. Taiwo', specialization: 'Oncologists', rating: '4.3', reviews: '130', image: Images.dr1 },
    { id: '2', name: 'Dr. Johnson', specialization: 'Pediatrician', rating: '4.8', reviews: '280', image: Images.dr2  },
    { id: '3', name: 'Dr. Kenny', specialization: 'Psychologist', rating: '4.3', reviews: '130', image: Images.dr3 },
    { id: '4', name: 'Dr. Gidado', specialization: 'Neuro Surgeon', rating: '4.8', reviews: '280', image: Images.dr4 },
    { id: '5', name: 'Dr. Bala', specialization: 'Virologist', rating: '4.3', reviews: '130', image: Images.dr2 },
    { id: '6', name: 'Dr. Johnson', specialization: 'Radiologist', rating: '4.8', reviews: '280', image: Images.dr3 },
    { id: '7', name: 'Dr. Taiwo', specialization: 'Oncologists', rating: '4.3', reviews: '130', image: Images.dr1 },
    { id: '8', name: 'Dr. Gidado', specialization: 'Neuro Surgeon', rating: '4.8', reviews: '280', image: Images.dr4 },

];

const SeeAllDoctors = ({navigation}) => {
    const [searchQuery, setSearchQuery] = useState('')

    const { isDarkMode } = useSelector(store => store.theme);
    const renderDoctorCard = ({ item }) => (
        <TouchableOpacity onPress={()=> navigation.navigate(SCREENS.DETAILS, {who: 'doctor'})} style={styles.card}>
            <Image source={item.image} style={styles.image} />
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.specialization}>{item.specialization}</Text>
            <View style={styles.ratingContainer}>
                <Text style={styles.rating}><Icon name='star' color={isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor} />{item.rating}</Text>
                <Text style={styles.reviews}>({item.reviews} reviews)</Text>
            </View>
        </TouchableOpacity>
    );

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor
        },
        header: {
            padding: wp(5),
            flexDirection: 'row',
            justifyContent: 'center',
        },
        title: {
            fontSize: RFPercentage(3),
            color: '#fff',
            fontWeight: 'bold',
        },
        searchBar: {
            paddingHorizontal: wp(5),
            marginBottom: hp(2),
        },
        searchInput: {
            backgroundColor: '#333',
            color: '#fff',
            borderRadius: wp(2),
            padding: wp(3),
            fontSize: RFPercentage(2),
        },
        cardList: {
            paddingHorizontal: wp(5),
        },
        card: {
            backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.secondryColor,
            borderRadius: wp(2),
            padding: wp(3),
            margin: wp(2),
            flex: 1,
            alignItems: 'center',
            borderColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,
            borderWidth: 1,
        },
        image: {
            width: wp(20),
            height: wp(20),
            borderRadius: wp(10),
            marginBottom: hp(1),
        },
        name: {
            fontSize: RFPercentage(2),
            color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
            fontFamily: Fonts.Bold
        },
        specialization: {
            fontSize: RFPercentage(1.8),
            color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
            marginVertical: hp(0.5),
            fontFamily: Fonts.Regular,
        },
        ratingContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: hp(0.5),
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
    });
    return (
        <View style={styles.container}>
            <StatusBar
                    backgroundColor={isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.secondryColor}
                    barStyle={isDarkMode? 'light-content': 'dark-content'}
                  />
            <StackHeader title={'Doctors'} rightIcon={<Icon name='filter-outline' size={wp(8)} color={isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.secondryTextColor} />} />

            <View style={styles.searchBar}>
                <TxtInput rightIcon={'magnify'} rightIconSize={RFPercentage(3)}
                    rightIconColor={
                        isDarkMode
                            ? Colors.darkTheme.secondryTextColor
                            : Colors.lightTheme.secondryTextColor
                    } placeholder={'Search doctor, hospital...'} style={{ width: wp(90) }} value={searchQuery} onChangeText={setSearchQuery} containerStyle={{ paddingHorizontal: wp(5) }} />
            </View>

            {/* Doctor Cards */}
            <FlatList
                data={doctors}
                renderItem={renderDoctorCard}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.cardList}
            />
        </View>
    );
};



export default SeeAllDoctors;
