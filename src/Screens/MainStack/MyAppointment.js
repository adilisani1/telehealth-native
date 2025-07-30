import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomRating from '../../components/CustomRating/CustomRating';
import StackHeader from '../../components/Header/StackHeader';
import { useSelector } from 'react-redux';
import { Colors } from '../../Constants/themeColors';
import { Fonts } from '../../Constants/Fonts';
import { Images } from '../../assets/Images/images';
import patientApi from '../../services/patientApi';
import appointmentApi from '../../services/appointmentApi';
import { useAlert } from '../../Providers/AlertContext';
import FullLoader from '../../components/Loaders';
import { useFocusEffect } from '@react-navigation/native';
import CustomButton from '../../components/Buttons/customButton';

const MyAppointment = () => {
    const { isDarkMode } = useSelector(store => store.theme);
    const { token } = useSelector(store => store.auth.User || {});
    const { showAlert } = useAlert();
    
    const [activeTab, setActiveTab] = useState('upcoming');
    const [upcoming, setUpcoming] = useState([]);
    const [history, setHistory] = useState([]);
    const [missed, setMissed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const theme = {
        backgroundColor: isDarkMode ? Colors.darkTheme.backgroundColor : Colors.lightTheme.backgroundColor,
        primaryTextColor: isDarkMode ? Colors.darkTheme.primaryTextColor : Colors.lightTheme.primaryTextColor,
        secondryTextColor: isDarkMode ? Colors.darkTheme.secondryTextColor : Colors.lightTheme.secondryTextColor,
        primaryColor: isDarkMode ? Colors.darkTheme.primaryColor : Colors.lightTheme.primaryColor,
        secondryColor: isDarkMode ? Colors.darkTheme.secondryColor : Colors.lightTheme.secondryColor,
        BorderGrayColor: isDarkMode ? Colors.darkTheme.BorderGrayColor : Colors.lightTheme.BorderGrayColor,
    };

    const fetchAppointments = async () => {
        try {
            console.log('🔄 Starting to fetch appointments...');
            
            // Fetch all appointment types with individual error handling
            console.log('📡 Calling upcoming appointments API...');
            const upcomingRes = await patientApi.getUpcomingAppointments();
            console.log('✅ Upcoming API response:', upcomingRes.data);
            
            console.log('📡 Calling history appointments API...');
            const historyRes = await patientApi.getAppointmentHistory();
            console.log('✅ History API response:', historyRes.data);
            
            console.log('📡 Calling missed appointments API...');
            let missedRes;
            try {
                missedRes = await patientApi.getMissedAppointments();
                console.log('✅ Missed API response:', missedRes.data);
            } catch (missedError) {
                console.error('❌ Failed to fetch missed appointments:', missedError);
                console.error('❌ Missed API error details:', {
                    message: missedError.message,
                    response: missedError.response?.data,
                    status: missedError.response?.status
                });
                // Create a fallback response structure
                missedRes = { data: { data: { missed: [] } } };
            }
            
            console.log('📡 Raw API responses:', {
                upcomingRes: upcomingRes.data,
                historyRes: historyRes.data,
                missedRes: missedRes.data
            });
            
            const upcomingData = upcomingRes.data.data?.upcoming || [];
            const historyData = historyRes.data.data?.history || [];
            
            // Filter out any invalid appointment data - be more lenient for missing fields
            const validHistoryData = historyData.filter(item => item && item._id && item.status);
            
            // Process missed appointments separately to handle missing patientName
            const missedDataFromHistory = validHistoryData.filter(item => item.status === 'missed');
            const missedDataSeparate = (missedRes.data.data?.missed || []).filter(item => item && item._id && item.status);
            
            console.log('🔍 Missed appointments processing:', {
                missedFromHistory: missedDataFromHistory.length,
                missedFromSeparateAPI: missedDataSeparate.length,
                historyHasMissed: missedDataFromHistory.map(item => ({
                    id: item._id,
                    status: item.status,
                    patientName: item.patientName,
                    populatedPatientName: item.patient?.name,
                    hasPatient: !!item.patient
                }))
            });
            
            // Always prioritize history data since it's working and has the missed appointments
            const finalMissedData = missedDataFromHistory.length > 0 ? missedDataFromHistory : missedDataSeparate;
            
            console.log('📊 Processed data:', {
                upcoming: upcomingData,
                history: validHistoryData,
                missedFromHistory: missedDataFromHistory,
                missedSeparate: missedDataSeparate,
                finalMissed: finalMissedData,
                historyStatuses: validHistoryData.map(item => ({ 
                    id: item._id, 
                    status: item.status, 
                    date: item.date,
                    patientName: item.patientName,
                    hasDoctor: !!item.doctor,
                    doctorName: item.doctor?.name
                })),
                missedStatuses: finalMissedData.map(item => ({ 
                    id: item._id, 
                    status: item.status, 
                    date: item.date,
                    patientName: item.patientName,
                    hasDoctor: !!item.doctor,
                    doctorName: item.doctor?.name,
                    hasAllFields: !!(item._id && item.status)
                }))
            });
            
            setUpcoming(upcomingData);
            setHistory(validHistoryData.filter(item => item.status !== 'missed')); // Exclude missed from history
            setMissed(finalMissedData);
            
            console.log('✅ State updated successfully');
            console.log('🎯 Final missed state set:', {
                length: finalMissedData.length,
                appointments: finalMissedData.map(item => ({
                    id: item._id,
                    status: item.status,
                    patientName: item.patientName || 'UNDEFINED',
                    populatedPatientName: item.patient?.name || 'UNDEFINED',
                    doctorName: item.doctor?.name || 'UNDEFINED',
                    date: item.date,
                    hasRequiredFields: !!(item._id && item.status)
                }))
            });
            
            // Also log what's in the missed state after setting
            setTimeout(() => {
                console.log('🔍 Missed state after timeout:', missed.length);
            }, 100);
        } catch (err) {
            console.error('❌ Failed to fetch appointments:', {
                error: err,
                message: err.message,
                response: err.response?.data
            });
            showAlert(err.response?.data?.message || 'Failed to load appointments', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
          setLoading(true);
        }, [])
    );

    useEffect(() => {
        if (loading) {
            fetchAppointments();
        }
    }, [loading]);

    const refreshAppointments = () => {
        setRefreshing(true);
        fetchAppointments();
    };

    const createTestMissedAppointment = async () => {
        try {
            await patientApi.createTestMissedAppointment();
            showAlert('Test missed appointment created', 'success');
            refreshAppointments();
        } catch (err) {
            showAlert(err.response?.data?.message || 'Failed to create test appointment', 'error');
        }
    };

    const convertExistingToMissed = async () => {
        try {
            const result = await patientApi.convertToMissedAppointments();
            showAlert(result.data.message || 'Appointments converted to missed', 'success');
            refreshAppointments();
        } catch (err) {
            showAlert(err.response?.data?.message || 'Failed to convert appointments', 'error');
        }
    };

    const testMissedEndpoint = async () => {
        try {
            console.log('🧪 Testing missed appointments endpoint directly...');
            const result = await patientApi.getMissedAppointments();
            console.log('🧪 Direct missed appointments result:', result.data);
            showAlert(`Found ${result.data.data?.missed?.length || 0} missed appointments`, 'info');
        } catch (err) {
            console.error('🧪 Direct missed appointments error:', err);
            showAlert(err.response?.data?.message || 'Failed to test missed endpoint', 'error');
        }
    };

    const debugAllAppointments = async () => {
        try {
            console.log('🔍 Fetching ALL appointments for debugging...');
            const result = await patientApi.getAllAppointmentsDebug();
            console.log('🔍 ALL appointments debug result:', result.data);
            const groupedByStatus = result.data.data?.groupedByStatus || {};
            const statusCounts = Object.keys(groupedByStatus).map(status => 
                `${status}: ${groupedByStatus[status].length}`
            ).join(', ');
            showAlert(`All appointments: ${statusCounts}`, 'info');
        } catch (err) {
            console.error('🔍 Debug all appointments error:', err);
            showAlert(err.response?.data?.message || 'Failed to debug all appointments', 'error');
        }
    };

    const debugCurrentState = () => {
        console.log('🔍 Current component state:', {
            upcoming: upcoming.length,
            history: history.length,
            missed: missed.length,
            activeTab,
            missedData: missed.map(item => ({
                id: item._id,
                status: item.status,
                patientName: item.patientName,
                populatedPatientName: item.patient?.name,
                hasPatient: !!item.patient
            }))
        });
        showAlert(`State: upcoming(${upcoming.length}), history(${history.length}), missed(${missed.length})`, 'info');
    };

    const handleCancel = async (appointmentId) => {
        setActionLoading(true);
        try {
            await appointmentApi.cancelAppointment(appointmentId, {}, token);
            showAlert('Appointment cancelled', 'success');
            refreshAppointments(); // Refresh after action
        } catch (err) {
            showAlert(err.response?.data?.message || 'Failed to cancel appointment', 'error');
        } finally {
            setActionLoading(false);
        }
    };
    const handleComplete = async (appointmentId) => {
        setActionLoading(true);
        try {
            await appointmentApi.completeAppointment(appointmentId, {}, token);
            showAlert('Appointment marked as complete', 'success');
            refreshAppointments(); // Refresh after action
        } catch (err) {
            showAlert(err.response?.data?.message || 'Failed to complete appointment', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'requested': return Colors.warning;
            case 'accepted': return Colors.success;
            case 'completed': return Colors.info;
            case 'cancelled': return Colors.danger;
            case 'missed': return Colors.error;
            default: return Colors.primary;
        }
    };

    const getCurrentData = () => {
        let data = [];
        switch (activeTab) {
            case 'upcoming': 
                data = upcoming;
                break;
            case 'history': 
                data = history; // Shows completed and cancelled appointments only
                break;
            case 'missed': 
                data = missed; // Use the separate missed state
                break;
            default: 
                data = [];
        }
        
        console.log(`📋 getCurrentData for ${activeTab} tab:`, {
            tab: activeTab,
            dataLength: data.length,
            missedStateLength: missed.length,
            upcomingLength: upcoming.length,
            historyLength: history.length,
            data: data.map(item => ({ 
                id: item._id, 
                status: item.status, 
                patientName: item.patientName,
                populatedPatientName: item.patient?.name,
                hasPatientName: !!(item.patientName || item.patient?.name)
            }))
        });
        
        return data;
    };

    const getHistoryWithSeparateMissed = () => {
        return history.filter(item => item.status !== 'missed');
    };

    const getMissedFromHistory = () => {
        return history.filter(item => item.status === 'missed');
    };

    const renderAppointmentCard = ({ item }) => (
        <View style={[
            styles.appointmentCard, 
            { backgroundColor: theme.secondryColor },
            item.status === 'missed' && { borderLeftWidth: 4, borderLeftColor: Colors.error }
        ]}>
            <View style={styles.cardHeader}>
                <View style={styles.doctorInfo}>
                    <Image
                        source={item.doctor?.avatar ? { uri: item.doctor.avatar } : Images.dr2}
                        style={styles.doctorImage}
                    />
                    <View style={styles.doctorDetails}>
                        <Text style={[styles.doctorName, { color: theme.primaryTextColor }]}>
                            {item.doctor?.name || 'Doctor'}
                        </Text>
                        <Text style={[styles.doctorSpecialty, { color: theme.secondryTextColor }]}>
                            {item.doctor?.specialization || 'Specialization'}
                        </Text>
                        <View style={styles.ratingContainer}>
                            <CustomRating
                                count={5}
                                defaultRating={item.doctor?.rating || 5}
                                size={RFPercentage(1.8)}
                                readonly={true}
                                starColor={theme.primaryColor}
                                emptyStarColor={theme.BorderGrayColor}
                                onFinishRating={() => {}}
                            />
                            <Text style={[styles.reviewText, { color: theme.secondryTextColor }]}>
                                ({item.doctor?.reviewCount || 52} Reviews)
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        {item.status === 'missed' && ' ⚠️'}
                    </Text>
                </View>
            </View>
            
            <View style={styles.appointmentDetails}>
                <View style={styles.detailRow}>
                    <Icon name="calendar" size={RFPercentage(2)} color={theme.primaryColor} />
                    <Text style={[styles.detailText, { color: theme.primaryTextColor }]}>
                        {new Date(item.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                        })}
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Icon name="clock" size={RFPercentage(2)} color={theme.primaryColor} />
                    <Text style={[styles.detailText, { color: theme.primaryTextColor }]}>
                        {new Date(item.date).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        })}
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Icon name="account" size={RFPercentage(2)} color={theme.primaryColor} />
                    <Text style={[styles.detailText, { color: theme.primaryTextColor }]}>
                        {item.patientName || item.patient?.name || 'Patient Name Not Available'}
                    </Text>
                </View>
                {item.status === 'missed' && (
                    <View style={styles.detailRow}>
                        <Icon name="alert-circle" size={RFPercentage(2)} color={Colors.error} />
                        <Text style={[styles.detailText, { color: Colors.error, fontStyle: 'italic' }]}>
                            This appointment was missed
                        </Text>
                    </View>
                )}
            </View>

            {activeTab === 'upcoming' && item.status === 'requested' && (
                <View style={styles.actionSection}>
                    <CustomButton
                        text="Cancel Appointment"
                        onPress={() => handleCancel(item._id)}
                        disabled={actionLoading}
                        loading={actionLoading}
                        buttonStyle={[styles.actionButton, { backgroundColor: Colors.danger }]}
                        textStyle={{ color: Colors.white }}
                    />
                </View>
            )}
        </View>
    );

    const renderEmptyState = () => {
        const emptyMessages = {
            upcoming: 'No upcoming appointments',
            history: 'No appointment history',
            missed: 'No missed appointments'
        };
        
        const emptyIcons = {
            upcoming: 'calendar-plus',
            history: 'history',
            missed: 'calendar-remove'
        };

        // Add debug info for missed tab
        if (activeTab === 'missed') {
            console.log('🔍 Rendering empty state for missed tab:', {
                missedLength: missed.length,
                historyLength: history.length,
                missedFromHistory: history.filter(item => item.status === 'missed').length
            });
        }

        return (
            <View style={styles.emptyState}>
                <Icon 
                    name={emptyIcons[activeTab]} 
                    size={RFPercentage(8)} 
                    color={theme.BorderGrayColor} 
                />
                <Text style={[styles.emptyStateText, { color: theme.secondryTextColor }]}>
                    {emptyMessages[activeTab]}
                </Text>
                {activeTab === 'missed' && missed.length === 0 && history.length > 0 && (
                    <Text style={[styles.emptyStateSubtext, { color: theme.secondryTextColor }]}>
                        Debug: {history.length} total history items, {history.filter(item => item.status === 'missed').length} missed
                    </Text>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <FullLoader loading={loading} />
            <StackHeader title="My Appointments" />
            
            {/* Debug Section - Remove in production */}
            <View style={styles.debugSection}>
                <View style={styles.debugButtonRow}>
                    <TouchableOpacity 
                        style={[styles.debugButton, { backgroundColor: Colors.warning, flex: 0.24 }]}
                        onPress={createTestMissedAppointment}
                    >
                        <Text style={styles.debugButtonText}>Create</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.debugButton, { backgroundColor: Colors.info, flex: 0.24 }]}
                        onPress={convertExistingToMissed}
                    >
                        <Text style={styles.debugButtonText}>Convert</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.debugButton, { backgroundColor: Colors.success, flex: 0.2 }]}
                        onPress={testMissedEndpoint}
                    >
                        <Text style={styles.debugButtonText}>Test</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.debugButton, { backgroundColor: Colors.primary, flex: 0.2 }]}
                        onPress={debugAllAppointments}
                    >
                        <Text style={styles.debugButtonText}>Debug</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.debugButton, { backgroundColor: Colors.warning, flex: 0.2 }]}
                        onPress={debugCurrentState}
                    >
                        <Text style={styles.debugButtonText}>State</Text>
                    </TouchableOpacity>
                </View>
            </View>
            
            {/* Tab Navigation */}
            <View style={[styles.tabContainer, { backgroundColor: theme.secondryColor }]}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'upcoming' && { backgroundColor: theme.primaryColor }
                    ]}
                    onPress={() => {
                        console.log('🔄 Switching to upcoming tab');
                        setActiveTab('upcoming');
                    }}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'upcoming' ? Colors.white : theme.secondryTextColor }
                    ]}>
                        Upcoming ({upcoming.length})
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'history' && { backgroundColor: theme.primaryColor }
                    ]}
                    onPress={() => {
                        console.log('🔄 Switching to history tab');
                        setActiveTab('history');
                    }}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'history' ? Colors.white : theme.secondryTextColor }
                    ]}>
                        History ({history.length})
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'missed' && { backgroundColor: theme.primaryColor }
                    ]}
                    onPress={() => {
                        console.log('🔄 Switching to missed tab');
                        console.log('📊 Current missed data:', missed);
                        console.log('📊 Missed from history:', getMissedFromHistory());
                        setActiveTab('missed');
                    }}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'missed' ? Colors.white : theme.secondryTextColor }
                    ]}>
                        Missed ({missed.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Appointment List */}
            <FlatList
                data={getCurrentData()}
                renderItem={renderAppointmentCard}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={refreshAppointments}
                        colors={[theme.primaryColor]}
                        tintColor={theme.primaryColor}
                    />
                }
                ListEmptyComponent={renderEmptyState}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    debugSection: {
        paddingHorizontal: wp(4),
        paddingVertical: hp(1),
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    debugButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    debugButton: {
        paddingVertical: hp(1),
        paddingHorizontal: wp(2),
        borderRadius: wp(2),
        alignItems: 'center',
    },
    debugButtonText: {
        color: Colors.white,
        fontSize: RFPercentage(1.6),
        fontFamily: Fonts.Medium,
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: wp(4),
        marginVertical: hp(2),
        borderRadius: wp(2),
        padding: wp(1),
    },
    tab: {
        flex: 1,
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(2),
        borderRadius: wp(1.5),
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabText: {
        fontSize: RFPercentage(1.8),
        fontFamily: Fonts.Medium,
        textAlign: 'center',
    },
    listContainer: {
        paddingHorizontal: wp(4),
        paddingBottom: hp(2),
    },
    appointmentCard: {
        borderRadius: wp(3),
        padding: wp(4),
        marginBottom: hp(2),
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: hp(2),
    },
    doctorInfo: {
        flexDirection: 'row',
        flex: 1,
        marginRight: wp(2),
    },
    doctorImage: {
        width: wp(15),
        height: wp(15),
        borderRadius: wp(7.5),
        marginRight: wp(3),
    },
    doctorDetails: {
        flex: 1,
    },
    doctorName: {
        fontSize: RFPercentage(2.2),
        fontFamily: Fonts.Bold,
        marginBottom: hp(0.5),
    },
    doctorSpecialty: {
        fontSize: RFPercentage(1.8),
        fontFamily: Fonts.Regular,
        marginBottom: hp(0.5),
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reviewText: {
        fontSize: RFPercentage(1.6),
        fontFamily: Fonts.Regular,
        marginLeft: wp(2),
    },
    statusBadge: {
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.5),
        borderRadius: wp(4),
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusText: {
        color: Colors.white,
        fontSize: RFPercentage(1.6),
        fontFamily: Fonts.Medium,
    },
    appointmentDetails: {
        marginBottom: hp(1.5),
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(0.8),
    },
    detailText: {
        fontSize: RFPercentage(1.8),
        fontFamily: Fonts.Regular,
        marginLeft: wp(2),
    },
    actionSection: {
        marginTop: hp(1),
    },
    actionButton: {
        borderRadius: wp(2),
        paddingVertical: hp(1.2),
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: hp(10),
    },
    emptyStateText: {
        fontSize: RFPercentage(2.2),
        fontFamily: Fonts.Medium,
        marginTop: hp(2),
        textAlign: 'center',
    },
    emptyStateSubtext: {
        fontSize: RFPercentage(1.8),
        fontFamily: Fonts.Regular,
        marginTop: hp(1),
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default MyAppointment;