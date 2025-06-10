import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Switch } from 'react-native-switch';
import { useSelector } from 'react-redux';
import { Colors } from '../../Constants/themeColors';
const CustomSwitch = ({ value, onValueChange }) => {
    const { isDarkMode } = useSelector(store => store.theme);
    return (
        <Switch
            value={value}
            onValueChange={onValueChange}
            disabled={false}
            activeText={'On'}
            inActiveText={'Off'}
            circleBorderActiveColor={isDarkMode? Colors.darkTheme.primaryColor:Colors.lightTheme.primaryColor}
            circleBorderInactiveColor={'#BEBEBE'}
            backgroundActive={isDarkMode? Colors.darkTheme.primaryColor:Colors.lightTheme.primaryColor}
            backgroundInactive={'#E2E2E2'}
            circleActiveColor={isDarkMode? Colors.darkTheme.secondryColor:Colors.lightTheme.secondryColor}
            circleInActiveColor={'#BEBEBE'}
            //   renderInsideCircle={() => <CustomComponent />} // custom component to render inside the Switch circle (Text, Image, etc.)
            changeValueImmediately={true} // if rendering inside circle, change state immediately or wait for animation to complete
            innerCircleStyle={{
                alignItems: 'center',
                justifyContent: 'center',
            }} // style for inner animated circle for what you (may) be rendering inside the circle
            outerCircleStyle={{}} // style for outer animated circle
            renderActiveText={false}
            renderInActiveText={false}
            switchLeftPx={2} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
            switchRightPx={2} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
            switchWidthMultiplier={2} // multiplied by the `circleSize` prop to calculate total width of the Switch
            switchBorderRadius={20} // Sets the border Radius of the switch slider. If unset, it remains the circleSize.
            circleSize={20}
            barHeight={20}
            circleBorderWidth={1}
        />
    );
};

export default CustomSwitch;

const styles = StyleSheet.create({});
