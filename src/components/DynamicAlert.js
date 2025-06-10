import React, { useEffect, useState } from 'react';
import { Dimensions, Text, StyleSheet, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useAlert } from '../Providers/AlertContext';
import { normalizeFontSize, scaleHeight,scaleWidth } from '../utils/responsive';
import { Fonts } from '../Constants/Fonts';
import { Colors } from '../Constants/themeColors';
import { useSelector } from 'react-redux';
const { width } = Dimensions.get('window');

const DynamicAlert = () => {
    const { alert, hideAlert } = useAlert();
    const {} = useSelector(store => store.theme)

    useEffect(() => {
        if (alert.visible) {
            const timer = setTimeout(() => {
                hideAlert();
            }, 3000);

            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alert.visible]);

    if (!alert.visible) return null;

    const getShadowStyle = () => {
        switch (alert.type) {
            case 'success':
                return styles.successShadow;
            case 'error':
                return styles.errorShadow;
            default:
                return {};
        }
    };

    const styles = StyleSheet.create({
        container: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: width * 0.040,
            margin: width * 0.04,
            borderRadius: 10,
            zIndex: 1000,
            backgroundColor: Colors.lightTheme.primaryColor,
            borderWidth: 1.5,
        },
        content: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
        },
        text: {
            fontFamily: Fonts.Medium,
            color: 'white',
            fontSize: normalizeFontSize(15),
        },
        descriptionText: {
            fontFamily: Fonts.Medium,
            color: Colors.lightTheme.secondryColor,
            fontSize: normalizeFontSize(12),
        },
        icon: {
            width: width * 0.06,
            height: width * 0.06,
            top: scaleHeight(10),
        },
        success: {
            borderColor: '#4CAF50',
            
        },
        error: {
            borderColor: Colors.error,
            backgroundColor: Colors.error
        },
        successShadow: {
            shadowColor: Colors.success,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.8,
            shadowRadius: 2,
            elevation: 5,
        },
        errorShadow: {
            shadowColor: Colors.error,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.8,
            shadowRadius: 2,
            elevation: 5,
        },
    });

    return (
        <Animatable.View
            animation={alert.type === 'success' ? "slideInDown" : "bounceInRight"}
            duration={500}
            style={[styles.container, styles[alert.type], getShadowStyle(), {}]}
        >
            <View style={styles.content}>
                {/* <Image resizeMode='contain' source={getImageSource()} style={styles.icon} /> */}
                <Text style={[styles.text, {
                    color: Colors.white
                }]}>{alert.message}</Text>
            </View>
            {alert.description &&             <Text style={styles.descriptionText}>{alert.description}</Text>
        }
        </Animatable.View>
    );
};



export default DynamicAlert;
