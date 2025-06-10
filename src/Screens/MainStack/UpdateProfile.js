import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { Colors } from '../../Constants/themeColors';
import StackHeader from '../../components/Header/StackHeader';
import TxtInput from '../../components/TextInput/Txtinput';
import CustomButton from '../../components/Buttons/customButton';
import { Fonts } from '../../Constants/Fonts';
import CRBSheetComponent from '../../components/BottomSheets/CRBSheetComponent';
import DatePicker from 'react-native-date-picker';
import Feather from 'react-native-vector-icons/Feather';
import moment from 'moment';
import CustomDropDown from '../../components/DropDown/CustomDropDown';
import { useAlert } from '../../Providers/AlertContext';
import { Images } from '../../assets/Images/images';
import CameraBottomSheet from '../../components/BottomSheets/CameraBottomSheet';

const UpdateProfile = ({ navigation }) => {
    const { isDarkMode } = useSelector(store => store.theme);
    const [name, setName] = useState('Adewole Abdulazeez');
    const [phoneNumber, setPhoneNumber] = useState('0810 666 6666');
    const [email, setEmail] = useState('example@domainname.com');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [DOB, setDOB] = useState('');
    const datePicker_ref = useRef();
    const { showAlert } = useAlert();
    const [image, setImage] = useState('');

    const cameraSheet_ref = useRef()

    const [selectedGender, setSelectedGender] = useState('');

    const Genders = [
        'Male', 'Female', 'Others', 'Preferred not to say',
    ];


    const showBtmSheet = () => {
        datePicker_ref?.current?.open()
    }
    const closeBtmSheet = () => {
        datePicker_ref?.current?.close()
    }


    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor,
        },

        profileContainer: {
            alignItems: 'center',
            marginTop: hp('3%'),
        },
        profileImage: {
            width: wp('25%'),
            height: wp('25%'),
            borderRadius: wp('12.5%'),
            marginBottom: hp('1%'),
        },
        editIcon: {
            position: 'absolute',
            bottom: 0,
            right: wp('37%'),
            backgroundColor: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
            borderRadius: wp('5%'),
            padding: wp('2%'),
            borderWidth: wp(0.5),
            borderColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.secondryColor
        },
        form: {
            marginTop: hp('2%'),
            paddingHorizontal: wp('4%'),
        },
        label: {
            fontSize: RFPercentage(2.2),
            fontFamily: Fonts.Medium,
            color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
            marginVertical: hp('1%'),
        },

        row: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        flex: {
            flex: 1,
        },
        changeButton: {
            color: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
            fontSize: RFPercentage(2),
            marginLeft: wp('3%'),
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
            color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.primaryBtn.TextColor,
            fontFamily: Fonts.Bold,
            fontSize: RFPercentage(2),

        },
        rowView: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            // marginBottom: hp(1),
        },
        addDate: {
            fontFamily: Fonts.Bold,
            color: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
            fontSize: RFPercentage(2),
        },
        DobContainer: {
            backgroundColor: isDarkMode
                ? Colors.darkTheme.secondryColor
                : Colors.lightTheme.secondryColor,
            paddingHorizontal: wp('4%'),
            borderColor: isDarkMode
                ? Colors.darkTheme.secondryColor
                : Colors.lightTheme.BorderGrayColor,
            borderWidth: wp('0.3%'),
            borderRadius: wp('2%'),
            paddingVertical: hp(1.8),
            width: wp(90)
        },
        dobBirth: {
            fontFamily: Fonts.Regular,
            color: isDarkMode ?
                Colors.darkTheme.primaryTextColor
                : Colors.lightTheme.primaryTextColor,
            flex: 1,
            fontSize: RFPercentage(2),
        }

    });


    return (
        <ScrollView style={styles.container}>

            <StackHeader title={'Profile'} />
            <View style={styles.profileContainer}>
                
                {
                    image ? <Image
                        source={{ uri: image.path }} // Replace with actual image
                        style={styles.profileImage}
                    /> :
                    <Image
                    source={Images.dr2} // Replace with actual image
                    style={styles.profileImage}
                />
                }
                <TouchableOpacity style={styles.editIcon} onPress={() => cameraSheet_ref.current.open()} >
                    <Icon name="edit" size={RFPercentage(2.5)} color={isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor} />
                </TouchableOpacity>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Name</Text>
                <TxtInput placeholder={'Full Name'} style={{ width: wp(90) }} value={name} onChangeText={setName} containerStyle={{ paddingHorizontal: wp(5) }} />
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.row}>

                    <TxtInput placeholder={'Full Name'} style={{ width: wp(90) }} value={phoneNumber} onChangeText={setPhoneNumber} containerStyle={{ paddingHorizontal: wp(5) }} />

                    {/* <TouchableOpacity>
                        <Text style={styles.changeButton}>Change</Text>
                    </TouchableOpacity> */}
                </View>

                {/* Email */}
                <Text style={styles.label}>Email</Text>

                <TxtInput placeholder={'example@domainname.com'} editable={false} style={{ width: wp(90) }} value={email} onChangeText={setEmail} containerStyle={{ paddingHorizontal: wp(5) }} />


                {/* Date of Birth */}
                <Text style={styles.label}>Date of Birth</Text>

                <TouchableOpacity style={styles.DobContainer} onPress={showBtmSheet} >
                    <Text style={styles.dobBirth} >{DOB ? moment(DOB).format('DD/MM/YYYY') : `DD / MM / YYYY`}</Text>
                </TouchableOpacity>


                {/* Gender */}
                <Text style={styles.label}>Gender</Text>

                {/* <TxtInput leftIcon={'chevron-down'} leftIconSize={RFPercentage(3)} leftIconColor={isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor} placeholder={'Male/Female'} style={{ width: wp(90) }} value={dateOfBirth} onChangeText={setDateOfBirth} containerStyle={{ paddingHorizontal: wp(5) }} /> */}
                <CustomDropDown
                    data={Genders}
                    selectedValue={selectedGender}
                    onValueChange={setSelectedGender}
                    placeholder="Male/Female"
                    textStyle={{ color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.primaryColor }}
                />
            </View>


            <CustomButton containerStyle={styles.btn} text={'Update Profile'} textStyle={[styles.btnText]} onPress={() => {
                showAlert('Profile Updated Successfully', 'success');
                setTimeout(() => {
                    navigation.goBack();
                }, 2500);
            }} />





            <CRBSheetComponent height={hp(40)} refRBSheet={datePicker_ref} content={<View>
                <View style={styles.rowView}>
                    <Text style={styles.addDate} >Add Date</Text>
                    <TouchableOpacity onPress={closeBtmSheet} >
                        <Feather
                            name={'x'}
                            size={20}
                            color={Colors.lightTheme.primaryColor}
                        /></TouchableOpacity>
                </View>
                <DatePicker mode="date" theme={isDarkMode? 'dark' : 'light'} date={DOB || new Date()} onDateChange={setDOB} dividerColor={Colors.lightTheme.primaryColor}  style={{}} />
                <CustomButton containerStyle={styles.btn} text={'Confirm'} textStyle={[styles.btnText, { color: isDarkMode ? Colors.darkTheme.primaryBtn.TextColor : Colors.lightTheme.primaryBtn.TextColor, }]} onPress={() => closeBtmSheet()} />


            </View>} />


            <CameraBottomSheet
                refRBSheet={cameraSheet_ref}
                onPick={(image) => setImage(image)}
            // onCameraPick={img => {
            //   img && handleUploadImage(img);
            // }}
            // onGalleryPick={img => {
            //   img && handleUploadImage(img);
            // }}
            />
        </ScrollView>
    );
};



export default UpdateProfile;
