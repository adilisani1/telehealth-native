import { FlatList, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native'
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
import { setDarkMode, toggleTheme } from '../../redux/Slices/Theme';
;

const ThemeSetting = () => {
    const { isDarkMode } = useSelector(store => store.theme);
    const dispatch = useDispatch()

  const colorScheme = useColorScheme();

  


  



    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor,
        },
        optionsList: {
            marginTop: hp('3%'),
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

            <StackHeader title={'Theme Settings'} headerStyle={{ paddingBottom: hp(0) }} />

            <View style={styles.optionContainer}>
            <Text style={styles.optionText}>{'Turn on Dark Mode'}</Text>
            <CustomSwitch
                value={isDarkMode}
                onValueChange={() => dispatch(toggleTheme())}
                
            />
        </View>
            <View style={styles.optionContainer}>
            <Text style={styles.optionText}>{'Turn on Light Mode'}</Text>
            <CustomSwitch
                value={!isDarkMode}
                onValueChange={() => dispatch(toggleTheme())}
                
            />
        </View>
            {/* <View style={styles.optionContainer}>
            <Text style={styles.optionText}>{'Set as Device Theme'}</Text>
            <CustomSwitch
                value={!isDarkMode}
                onValueChange={() => {
                     if (colorScheme === 'dark') {
                          dispatch(setDarkMode(true))
                        }else{
                          dispatch(setDarkMode(false))
                        }
                }}
                
            />
        </View> */}

            {/* <FlatList
                data={profileOptions}
                keyExtractor={(item) => item.id}
                renderItem={renderOption}
                contentContainerStyle={styles.optionsList}
            /> */}
        </View>
    )
}

export default ThemeSetting
