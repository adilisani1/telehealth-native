import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Modal,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { Fonts } from '../../Constants/Fonts';
import { useSelector } from 'react-redux';
import { Colors } from '../../Constants/themeColors';

const CustomDropDown = ({ data, selectedValue, onValueChange, placeholder,textStyle  }) => {
    const [isVisible, setIsVisible] = useState(false);
    const { isDarkMode } = useSelector(store => store.theme);


    const handleSelect = (value) => {
        onValueChange(value);
        setIsVisible(false);
    };





    const styles = StyleSheet.create({
        dropdownButton: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.secondryColor,
            borderRadius: wp(2),
            paddingVertical: hp(1.5),
            paddingHorizontal: wp(4),
            // elevation: 2,
            borderWidth: 1,
            borderColor: isVisible? isDarkMode?Colors.darkTheme.primaryColor: Colors.lightTheme.primaryColor : isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,
        },
        selectedText: {
            fontSize: RFPercentage(2),
            fontFamily: Fonts.Regular,
            color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
        },
        notSelectedText: {
            fontSize: RFPercentage(2),
            fontFamily: Fonts.Regular,
            color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
        },

        dropdownContainer: {
            width: wp(92),
            maxHeight: hp(50),
            backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.secondryColor,
            borderRadius: wp(2),
            padding: wp(3),
            elevation: 5,
            marginTop: hp(1)
        },
        dropdownItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: hp(1.2),
            paddingHorizontal: wp(2),
            // borderBottomWidth: 1,
            // borderBottomColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,
        },
        itemText: {
            fontSize: RFPercentage(2),
            fontFamily: Fonts.Regular,
            color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
        },
        selectedItemText: {
            color: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
            fontFamily: Fonts.Medium,
        },
    });
    return (
        <View>
            {/* Dropdown button */}
            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setIsVisible(!isVisible)}
            >
                <Text style={[ selectedValue ?styles.selectedText: styles.notSelectedText ,]}>
                    {selectedValue || placeholder || 'Select an option'}
                </Text>
                <Icon
                    name={isVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={wp(5)}
                    color={isVisible? isDarkMode? Colors.darkTheme.primaryColor: Colors.lightTheme.primaryColor: isDarkMode ? Colors.darkTheme.secondryTextColor:Colors.lightTheme.secondryTextColor}
                />
            </TouchableOpacity>

            {/* Modal for dropdown */}
            {isVisible && (
                <ScrollView style={styles.dropdownContainer}>
                    {/* <FlatList data={data}  renderItem={({item, index}) => {
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.dropdownItem}
                                    onPress={() => handleSelect(item)}
                                >
                                    <Text
                                        style={[
                                            styles.itemText,
                                            selectedValue === item && styles.selectedItemText,
                                        ]}
                                    >
                                        {item}
                                    </Text>
                                    {selectedValue === item && (
                                        <Icon name="check" size={wp(5)} color={isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor} />
                                    )}
                                </TouchableOpacity>
                            )}} /> */}
                    {
                        data.map((item, index) => {
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.dropdownItem}
                                    onPress={() => handleSelect(item)}
                                >
                                    <Text
                                        style={[
                                            styles.itemText,
                                            selectedValue === item && styles.selectedItemText,
                                        ]}
                                    >
                                        {item}
                                    </Text>
                                    {selectedValue === item && (
                                        <Icon name="check" size={wp(5)} color={isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor} />
                                    )}
                                </TouchableOpacity>
                            )
                        })
                    }
                </ScrollView>
            )}
        </View>
    );
};


export default CustomDropDown;
