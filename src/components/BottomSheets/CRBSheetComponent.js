import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import React from 'react';
import RBSheet from 'react-native-raw-bottom-sheet';
import {useNavigation} from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Colors } from '../../Constants/themeColors';

const CRBSheetComponent = ({refRBSheet, content, height}) => {
  const navigation = useNavigation();

  const { isDarkMode } = useSelector((store) => store.theme);

  return (
      <RBSheet
        ref={refRBSheet}
        height={height ? height : 320}
        openDuration={300}
        customStyles={{
          container: {
            // justifyContent: 'center',
            paddingVertical: 20,
            alignItems: 'center',
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            backgroundColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.secondryColor,

          },
        }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {content}
        </ScrollView>
      </RBSheet>
  );
};

export default CRBSheetComponent;

const styles = StyleSheet.create({});
