import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
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
import authApi from '../../services/authApi';
import { setUser } from '../../redux/Slices/authSlice';

const UpdateProfile = ({ navigation }) => {
    const { isDarkMode } = useSelector(store => store.theme);
    const { User, token, userType } = useSelector(store => store.auth);
    const dispatch = useDispatch();

    // Use User.role as fallback if userType is not set
    const currentUserType = userType || User?.role;

    const [name, setName] = useState(User?.name || '');
    const [phoneNumber, setPhoneNumber] = useState(User?.phone || '');
    const [email, setEmail] = useState(User?.email || '');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [DOB, setDOB] = useState(User?.dob ? new Date(User.dob) : null);
    const datePicker_ref = useRef();
    const { showAlert } = useAlert();
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const cameraSheet_ref = useRef()

    const [selectedGender, setSelectedGender] = useState(User?.gender || '');
    
    // Doctor-specific fields
    const [specialization, setSpecialization] = useState(User?.specialization || '');
    const [qualifications, setQualifications] = useState(User?.qualifications || '');

    console.log('🔍 UpdateProfile: userType =', userType, ', User.role =', User?.role, ', currentUserType =', currentUserType);

    const Genders = [
        'male', 'female', 'other'
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
                    <TxtInput placeholder={'Phone Number'} style={{ width: wp(90) }} value={phoneNumber} onChangeText={setPhoneNumber} containerStyle={{ paddingHorizontal: wp(5) }} />
                </View>

                {/* Email */}
                <Text style={styles.label}>Email</Text>
                <TxtInput placeholder={'example@domainname.com'} editable={false} style={{ width: wp(90) }} value={email} onChangeText={setEmail} containerStyle={{ paddingHorizontal: wp(5) }} />

                {/* Conditional fields based on user type */}
                {currentUserType === 'doctor' ? (
                    <>
                        {/* Doctor-specific fields */}
                        <Text style={styles.label}>Specialization</Text>
                        <TxtInput placeholder={'Enter your specialization'} style={{ width: wp(90) }} value={specialization} onChangeText={setSpecialization} containerStyle={{ paddingHorizontal: wp(5) }} />
                        
                        <Text style={styles.label}>Qualifications</Text>
                        <TxtInput placeholder={'Enter your qualifications'} style={{ width: wp(90) }} value={qualifications} onChangeText={setQualifications} containerStyle={{ paddingHorizontal: wp(5) }} />
                    </>
                ) : (
                    <>
                        {/* Patient-specific fields */}
                        <Text style={styles.label}>Date of Birth</Text>
                        <TouchableOpacity style={styles.DobContainer} onPress={showBtmSheet} >
                            <Text style={styles.dobBirth} >{DOB ? moment(DOB).format('DD/MM/YYYY') : `DD / MM / YYYY`}</Text>
                        </TouchableOpacity>

                        <Text style={styles.label}>Gender</Text>
                        <CustomDropDown
                            data={Genders}
                            selectedValue={selectedGender}
                            onValueChange={setSelectedGender}
                            placeholder="Male/Female"
                            textStyle={{ color: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.primaryColor }}
                        />
                    </>
                )}
            </View>


            <CustomButton containerStyle={styles.btn} text={loading ? 'Updating...' : 'Update Profile'} textStyle={[styles.btnText]} onPress={async () => {
                // Test network connectivity first
                try {
                    console.log('🌐 TESTING NETWORK CONNECTIVITY...');
                    const testResponse = await authApi.getProfile();
                    console.log('✅ NETWORK TEST SUCCESSFUL:', testResponse.status);
                } catch (networkError) {
                    console.error('❌ NETWORK TEST FAILED:', networkError.message);
                    if (networkError.message === 'Network Error') {
                        showAlert('Network connection failed. Please check your internet connection and backend server.', 'error');
                        return;
                    }
                }
                
                // Validation before submitting
                if (currentUserType === 'doctor') {
                    if (!specialization.trim()) {
                        showAlert('Specialization is required for doctors', 'error');
                        return;
                    }
                    if (!qualifications.trim()) {
                        showAlert('Qualifications are required for doctors', 'error');
                        return;
                    }
                }
                
                if (!name.trim()) {
                    showAlert('Name is required', 'error');
                    return;
                }
                
                if (!phoneNumber.trim()) {
                    showAlert('Phone number is required', 'error');
                    return;
                }
                
                setLoading(true);
                try {
                    // Create a test with simple JSON first to see if the endpoint works
                    const jsonData = {
                        name: name,
                        phone: phoneNumber,
                    };
                    
                    if (currentUserType === 'doctor') {
                        jsonData.specialization = specialization;
                        jsonData.qualifications = qualifications;
                        console.log('🩺 DOCTOR UPDATE: Sending data:', jsonData);
                    } else {
                        jsonData.gender = selectedGender;
                        if (DOB) {
                            jsonData.dob = moment(DOB).format('YYYY-MM-DD');
                        }
                        console.log('👤 PATIENT UPDATE: Sending data:', jsonData);
                    }
                    
                    // If no image, send as JSON first to test
                    if (!image) {
                        console.log('📋 SENDING JSON DATA (no image)');
                        console.log('👤 USER TYPE:', currentUserType);
                        console.log('🌐 MAKING JSON API CALL...');
                        
                        const res = await authApi.updateProfile(jsonData);
                        console.log('✅ API RESPONSE RECEIVED:', res.status);
                        
                        if (res.data.success) {
                            console.log('✅ PROFILE UPDATE SUCCESSFUL');
                            dispatch(setUser(res.data.data));
                            showAlert('Profile Updated Successfully', 'success');
                            setTimeout(() => {
                                navigation.goBack();
                            }, 1500);
                        } else {
                            console.error('❌ UPDATE FAILED - Server returned:', res.data);
                            showAlert(res.data.message || 'Profile update failed', 'error');
                        }
                    } else {
                        // If image exists, use FormData
                        const formData = new FormData();
                        formData.append('name', name);
                        formData.append('phone', phoneNumber);
                        
                        if (currentUserType === 'doctor') {
                            formData.append('specialization', specialization);
                            formData.append('qualifications', qualifications);
                        } else {
                            formData.append('gender', selectedGender);
                            if (DOB) {
                                formData.append('dob', moment(DOB).format('YYYY-MM-DD'));
                            }
                        }
                        
                        formData.append('avatar', {
                            uri: image.path,
                            type: image.mime,
                            name: image.path.split('/').pop(),
                        });
                        
                        console.log('📋 SENDING FORMDATA (with image)');
                        console.log('👤 USER TYPE:', currentUserType);
                        console.log('🌐 MAKING FORMDATA API CALL...');
                        
                        const res = await authApi.updateProfile(formData);
                        console.log('✅ API RESPONSE RECEIVED:', res.status);
                        
                        if (res.data.success) {
                            console.log('✅ PROFILE UPDATE SUCCESSFUL');
                            dispatch(setUser(res.data.data));
                            showAlert('Profile Updated Successfully', 'success');
                            setTimeout(() => {
                                navigation.goBack();
                            }, 1500);
                        } else {
                            console.error('❌ UPDATE FAILED - Server returned:', res.data);
                            showAlert(res.data.message || 'Profile update failed', 'error');
                        }
                    }
                } catch (err) {
                    console.error('❌ UPDATE ERROR - Full error object:', err);
                    console.error('❌ UPDATE ERROR - Error message:', err.message);
                    console.error('❌ UPDATE ERROR - Error code:', err.code);
                    console.error('❌ UPDATE ERROR - Response data:', err.response?.data);
                    console.error('❌ UPDATE ERROR - Response status:', err.response?.status);
                    
                    let errorMessage = 'Profile update failed';
                    
                    if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
                        errorMessage = 'Network connection failed. Please check your internet connection and try again.';
                    } else if (err.response?.data?.message) {
                        errorMessage = err.response.data.message;
                    } else if (err.message) {
                        errorMessage = err.message;
                    }
                    
                    showAlert(errorMessage, 'error');
                } finally {
                    setLoading(false);
                }
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