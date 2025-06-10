import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    //   CheckBox,
    StyleSheet,
    Alert,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import StackHeader from '../../components/Header/StackHeader';
import TxtInput from '../../components/TextInput/Txtinput';
import { useSelector } from 'react-redux';
import { Colors } from '../../Constants/themeColors';
import CustomButton from '../../components/Buttons/customButton';
import { useAlert } from '../../Providers/AlertContext';
import { SCREENS } from '../../Constants/Screens';
import { Fonts } from '../../Constants/Fonts';


const AddCard = ({navigation}) => {
    const [cardHolderName, setCardHolderName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [saveCard, setSaveCard] = useState(false);
    const { isDarkMode } = useSelector((store) => store.theme);
      const {showAlert} = useAlert()
    


    const validateFields = () => {
        if (!cardHolderName.trim()) {
            showAlert('Please Enter Card Holder Name', 'error');
            return false;
        }
        if (!/^\d{16}$/.test(cardNumber)) {
            showAlert('Card Number must be 16 digits', 'error');
            return false;
        }
        if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiryDate)) {
            showAlert('Expiry Date must be in MM/YY format', 'error');

            return false;
        }
        if (!/^\d{3}$/.test(cvv)) {
            showAlert('CVV must be 3 digits', 'error');

            return false;
        }
        return true;
    };

    const handleAddCard = () => {
        if (validateFields()) {
            navigation.navigate(SCREENS.REVIEWSUMMARY)
            // Reset fields after successful addition
            setCardHolderName('');
            setCardNumber('');
            setExpiryDate('');
            setCvv('');
            setSaveCard(false);
        }
    };


    const styles = StyleSheet.create({
        container: {
            flex: 1,
            padding: wp(5),
            backgroundColor: isDarkMode? Colors.darkTheme.backgroundColor:Colors.lightTheme.backgroundColor,
        },
        label: {
            fontSize: RFPercentage(2),
            fontFamily: Fonts.Medium,
            color: isDarkMode? Colors.darkTheme.primaryTextColor: Colors.lightTheme.primaryTextColor,
            marginVertical: hp(1),
        },
      
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        halfWidth: {
            width: '48%',
        },
        saveCardContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: hp(2),
        },
        saveCardText: {
            fontSize: RFPercentage(2),
            fontFamily: Fonts.Regular,
            color: isDarkMode? Colors.darkTheme.primaryTextColor: Colors.lightTheme.primaryTextColor,
            marginLeft: wp(2),
        },
        addCardButton: {
            backgroundColor: '#4CAF50',
            paddingVertical: hp(2),
            borderRadius: wp(2),
            alignItems: 'center',
        },
        addCardButtonText: {
            color: '#FFF',
            fontSize: RFPercentage(2.2),
            fontFamily: Fonts.Bold,
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
            color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.secondryBtn.TextColor,
            fontFamily: Fonts.Bold,
            fontSize: RFPercentage(2),

        },
    });

    return (
        <View style={styles.container}>
            {/* Card Holder Name */}
            <StackHeader title={'Add Card'} headerStyle={{ paddingLeft: 0, paddingBottom: hp(2) }} />
            <Text style={styles.label}>Card Holder Name</Text>
            {/* <TextInput
                style={styles.input}
                placeholder="Enter card holder name"
                placeholderTextColor="#999"
                value={cardHolderName}
                onChangeText={setCardHolderName}
            /> */}
            <TxtInput placeholder={'Enter card holder name'} value={cardHolderName} onChangeText={setCardHolderName} containerStyle={{ paddingHorizontal: wp(5) }} />


            {/* Card Number */}
            <Text style={styles.label}>Card Number</Text>
            <TxtInput placeholder={'Enter card number'} keyboardType={'numeric'} value={cardNumber} onChangeText={setCardNumber} containerStyle={{ paddingHorizontal: wp(5) }} />

            {/* Expiry Date and CVV */}
            <View style={styles.row}>
                <View style={[styles.inputWrapper, styles.halfWidth]}>
                    <Text style={styles.label}>Expiry Date</Text>

                    <TxtInput placeholder={"MM/YY"} keyboardType={'numeric'} value={expiryDate} onChangeText={setExpiryDate} containerStyle={{ paddingHorizontal: wp(5) }} />

                </View>
                <View style={[styles.inputWrapper, styles.halfWidth]}>
                    <Text style={styles.label}>CVV</Text>

                    <TxtInput placeholder={"000"} keyboardType={'numeric'} value={cvv} onChangeText={setCvv} containerStyle={{ paddingHorizontal: wp(5) }} />

                </View>
            </View>

            {/* Save Card */}
            <View style={styles.saveCardContainer}>
                {/* <CheckBox
          value={saveCard}
          onValueChange={setSaveCard}
          tintColors={{ true: '#007BFF', false: '#CCC' }}
        /> */}
                <Icon name={saveCard ? 'checkbox-marked' : 'checkbox-blank-outline'} size={RFPercentage(2.3)} color={saveCard ? isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor : isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor} onPress={() => setSaveCard(!saveCard)} />

                <Text style={styles.saveCardText}>Save Card</Text>
            </View>
            <CustomButton containerStyle={styles.btn} text={'Add Card'} textStyle={[styles.btnText, { color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.primaryBtn.TextColor, }]} onPress={() => handleAddCard()} />
        </View>
    );
};


export default AddCard;
