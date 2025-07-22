import React from 'react';
import {
    View,
    Text,
    SectionList,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import StackHeader from '../../components/Header/StackHeader';
import { Fonts } from '../../Constants/Fonts';
import { Colors } from '../../Constants/themeColors';
import { useSelector } from 'react-redux';
import CustomButton from '../../components/Buttons/customButton';
import { useEffect, useState } from 'react';
import patientApi from '../../services/patientApi';
import { useAlert } from '../../Providers/AlertContext';
import doctorApi from '../../services/doctorApi';


const typeIcons = {
    AppointmentSuccess: {icon: 'event', color : '#2ced8c'},
    schedule: {icon: 'update', color : '#1774ff'},
    VideoCall: {icon: 'videocam', color : '#2ced8c'},
    cancelled: {icon: 'cancel', color : '#eb5c32'},
    account: {icon: 'account-balance', color : '#1774ff'},
};

const Notifications = () => {
    const { isDarkMode } = useSelector(store => store.theme);
    const { User, userType } = useSelector(store => store.auth);
    const { showAlert } = useAlert();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Helper to map backend notification to frontend format
    const mapNotification = (n) => ({
        id: n._id,
        type: n.type || 'account',
        title: n.type === 'admin' ? 'Admin Notice' : (n.type.charAt(0).toUpperCase() + n.type.slice(1)),
        description: n.message,
        time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date(n.createdAt).toISOString().slice(0, 10),
        read: n.read,
    });

    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            try {
                let res;
                if (userType === 'doctor') {
                    res = await doctorApi.getDoctorNotifications();
                } else {
                    res = await patientApi.getNotifications();
                }
                // Backend returns { success, data: [notifications], message }
                const notifs = (res.data.data || []).map(mapNotification);
                setNotifications(notifs);
            } catch (err) {
                showAlert(err.response?.data?.message || 'Failed to load notifications', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, [userType]);

    const handleMarkAsRead = async (notificationId) => {
        try {
            if (userType === 'doctor') {
                await doctorApi.markNotificationAsRead(notificationId);
            } else {
                await patientApi.markNotificationAsRead(notificationId);
            }
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
        } catch (err) {
            showAlert(err.response?.data?.message || 'Failed to mark as read', 'error');
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor
            //   padding: wp('5%'),
        },
        markReadText: {
            fontSize: RFPercentage(2),
            fontFamily: Fonts.Medium,
            color: '#4caf50',
        },
        sectionTitle: {
            fontSize: RFPercentage(2.3),
            fontFamily: Fonts.Medium,
            color: isDarkMode? Colors.darkTheme.primaryTextColor:Colors.lightTheme.primaryTextColor,
            marginVertical: hp('2%'),
        },
        listContent: {
            paddingBottom: hp('10%'),
        },
        notificationContainer: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: hp('1%'),
            paddingVertical: hp('1%'),
            //   paddingHorizontal: wp('4%'),
            //   backgroundColor: '#1a1a1a',
            // borderRadius: wp('2%'),
            elevation: 1
        },
        iconContainer: {
            width: wp('15%'),
            height: wp('15%'),
            justifyContent: 'center',
            alignItems: 'center',
            // backgroundColor: '#333',
            borderRadius: wp('12%'),
            marginRight: wp('3%'),
        },
        textContainer: {
            flex: 1,
        },
        title: {
            fontSize: RFPercentage(2.3),
            fontFamily: Fonts.Medium,
            color: isDarkMode? Colors.darkTheme.primaryTextColor:Colors.lightTheme.primaryTextColor,

        },
        description: {
            fontSize: RFPercentage(1.8),
            fontFamily: Fonts.Regular,
            color: isDarkMode? Colors.darkTheme.primaryTextColor:Colors.lightTheme.primaryTextColor,
            marginTop: hp('0.5%'),
        },
        time: {
            fontSize: RFPercentage(1.8),
            fontFamily: Fonts.Regular,
            color: isDarkMode? Colors.darkTheme.secondryTextColor:Colors.lightTheme.secondryTextColor,
        },
    });

    // Group notifications by date
    const groupedNotifications = notifications.reduce((groups, item) => {
        const { date } = item;
        if (!groups[date]) groups[date] = [];
        groups[date].push(item);
        return groups;
    }, {});

    const sections = Object.keys(groupedNotifications).map(date => ({
        title: date,
        data: groupedNotifications[date],
    }));

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.notificationContainer} onPress={() => !item.read && handleMarkAsRead(item.id)}>
            <View style={[styles.iconContainer, {backgroundColor: `${(typeIcons[item.type] ? typeIcons[item.type].color : '#1774ff')}30`}]}>
                <Icon
                    name={typeIcons[item.type]?.icon || 'notifications'}
                    size={RFPercentage(3.5)}
                    color={typeIcons[item.type]?.color || '#1774ff'}
                />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.title, item.read && { opacity: 0.5 }]}>
                    {item.title}
                </Text>
                <Text style={[styles.description, item.read && { opacity: 0.5 }]}>{item.description}</Text>
            </View>
            <Text style={[styles.time, item.read && { opacity: 0.5 }]}>{item.time}</Text>
        </TouchableOpacity>
    );

    const renderSectionHeader = ({ section: { title } }) => (
        <View style={[title === new Date().toISOString().slice(0, 10) && {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}]} >
             <Text style={styles.sectionTitle}>
            {title === new Date().toISOString().slice(0, 10)
                ? 'Today'
                : title}
        </Text>
        </View>
    );

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <View style={styles.container}>
            <StackHeader title={'Notifications'} rightIconContainer={{backgroundColor: isDarkMode? `${Colors.darkTheme.primaryColor}40`: `${Colors.lightTheme.primaryColor}40`, paddingHorizontal: wp(2),paddingVertical: wp(1), borderRadius: wp(2)}} rightIcon={<Text style={{color: isDarkMode? Colors.darkTheme.primaryTextColor: Colors.lightTheme.primaryTextColor}} >{unreadCount} unread</Text>}  />
            {loading ? (
                <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><Text>Loading notifications...</Text></View>
            ) : notifications.length === 0 ? (
                <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><Text>No notifications found</Text></View>
            ) : (
                <SectionList
                    sections={sections}
                    keyExtractor={(item, index) => item.id.toString()}
                    renderItem={renderItem}
                    renderSectionHeader={renderSectionHeader}
                    contentContainerStyle={styles.listContent}
                    style={{ paddingHorizontal: wp(4) }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default Notifications;