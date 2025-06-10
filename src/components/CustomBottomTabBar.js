import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Image, Platform } from 'react-native';
import { normalizeFontSize, scaleHeight, scaleWidth } from '../utils/responsive';
import { Colors } from '../Constants/themeColors';
import { Fonts } from '../Constants/Fonts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';


const CustomBottomTabBar = ({ state, descriptors, navigation, icons }) => {
    const { routes } = state;
    const { isDarkMode } = useSelector(store => store.theme);



const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: isDarkMode? Colors.darkTheme.secondryColor:Colors.lightTheme.secondryColor,
        height: Platform.OS === 'ios' ? 80 : 60,
        paddingBottom: Platform.OS === 'ios' ? 15 : 0,
    },
    tabButton: {
        borderRadius: 30,
        paddingHorizontal: 10,
        height: 40,
        justifyContent: 'center',
    },
    tabText: {
       
        textAlign: 'center',
        color: isDarkMode? Colors.darkTheme.secondryTextColor: Colors.lightTheme.secondryTextColor,
        fontFamily: Fonts.Regular,
        fontSize: normalizeFontSize(10),
        // marginTop: scaleHeight(10)
    },


});
    return (
        <View style={[styles.tabContainer]}>
            {routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label = options.title !== undefined ? options.title : route.name;
                //const Icon = options.icon;
                const isFocused = state.index === index;
                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };



                return (
                    <TouchableOpacity
                        key={route.key}
                        onPress={onPress}
                        style={[styles.tabButton, isFocused && {backgroundColor: `${isDarkMode?Colors.darkTheme.primaryColor: Colors.lightTheme.primaryColor}40`,height: 50}]}
                    >
                        {/* Icon */}
                        <View style={{ position: 'relative' }}>
                            <Icon name={icons[index]}
                                size={30} color={isFocused
                                    ? isDarkMode? Colors.darkTheme.primaryColor: Colors.lightTheme.primaryColor
                                    : isDarkMode? Colors.darkTheme.secondryTextColor: Colors.lightTheme.secondryTextColor} />
                                    {/* <Text style={[styles.tabText, isFocused && {color: isDarkMode? Colors.darkTheme.primaryColor: Colors.lightTheme.primaryColor}]} >{label}</Text> */}

                          
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};


export default CustomBottomTabBar;
