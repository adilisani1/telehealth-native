import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Colors } from '../../Constants/themeColors';

// import { BarIndicator} from 'react-native-indicators'

const Loader = ({ color, size }) => {
    return (
        <ActivityIndicator
            size={size || "small"}
            color={color ?? Colors.darkTheme.primaryColor}
            style={{alignSelf: 'center', transform: [{ scale: 1.5 }]}} // scale the size
            />
    )
}

export default Loader

const styles = StyleSheet.create({})