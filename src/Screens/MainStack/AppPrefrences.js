import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import StackHeader from '../../components/Header/StackHeader'
import { useDispatch, useSelector } from 'react-redux';
import { Colors } from '../../Constants/themeColors';
import { SCREENS } from '../../Constants/Screens';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Fonts } from '../../Constants/Fonts';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import CustomSwitch from '../../components/Buttons/CustomSwitch';
import { toggleTheme } from '../../redux/Slices/Theme';
;

const AppPreferences = () => {
    const { isDarkMode } = useSelector(store => store.theme);
    const dispatch = useDispatch()

    const [profileOptions, setProfileOptions] = useState([
        { id: '1', name: 'Email Notifications', icon: 'person-outline', value: true },
        { id: '2', name: 'Reminders Notifications', icon: 'favorite-outline', value: false },
        { id: '3', name: 'General Notifications', icon: 'help-outline', value: false },
        { id: '4', name: 'New Updates Notifications', icon: 'help-outline', value: false },
    ]);

    const toggleSwitch = (id) => {
        setProfileOptions((prevOptions) =>
            prevOptions.map((option) =>
                option.id === id ? { ...option, value: !option.value } : option
            )
        );

        console.log(profileOptions);

    };

    const renderOption = ({ item }) => (
        <View style={styles.optionContainer}>
            <Text style={styles.optionText}>{item.name}</Text>
            <CustomSwitch
                value={item.value}
                onValueChange={() => toggleSwitch(item.id)}

            />
        </View>
    );



    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor,
        },
        optionsList: {
            // marginTop: hp('1%'),
            paddingHorizontal: wp('4%'),
            paddingBottom: hp(3),
        },
        optionContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: hp('2%'),
            borderBottomWidth: wp(0.5),
            borderBottomColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,
            marginLeft: wp(2),
        },
        optionText: {
            fontSize: RFPercentage(2.2),
            color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
            fontFamily: Fonts.Regular,
        },
    });
    return (
        <View style={styles.container}>

            <StackHeader title={'App Preferences'} headerStyle={{ paddingBottom: hp(0) }} />
            <View style={[styles.optionsList, {marginTop: hp(3)}]} >
                <Text style={[styles.optionText, {fontFamily: Fonts.Bold}]}>{'Theme Settings'}</Text>

                <View style={styles.optionContainer}>
                    <Text style={styles.optionText}>{'Dark Mode'}</Text>
                    <CustomSwitch
                        value={isDarkMode}
                        onValueChange={() => dispatch(toggleTheme())}

                    />
                </View>
                <View style={styles.optionContainer}>
                    <Text style={styles.optionText}>{'Light Mode'}</Text>
                    <CustomSwitch
                        value={!isDarkMode}
                        onValueChange={() => dispatch(toggleTheme())}

                    />
                </View>

            </View>

            <Text style={[styles.optionText, {fontFamily: Fonts.Bold, paddingLeft: wp(4)}]}>{'Notification Settings'}</Text>
            <FlatList
                data={profileOptions}
                keyExtractor={(item) => item.id}
                renderItem={renderOption}
                contentContainerStyle={styles.optionsList}
            />


        </View>
    )
}

export default AppPreferences
