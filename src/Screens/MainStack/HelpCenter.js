import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Change icon set as required
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // Change icon set as required
import { Fonts } from '../../Constants/Fonts';
import StackHeader from '../../components/Header/StackHeader';
import TxtInput from '../../components/TextInput/Txtinput';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { useSelector } from 'react-redux';
import { Colors } from '../../Constants/themeColors';
const HelpCenterScreen = () => {
  const [activeTab, setActiveTab] = useState('FAQ'); // Tracks FAQ or Contact Us
  const [expandedIndex, setExpandedIndex] = useState(null); // Tracks expanded FAQ item
  const [isExpanded, setIsExpanded] = useState('');
  const [activeCategory, setActiveCategory] = useState('All'); // Tracks active FAQ category
  const [searchQuery, setSearchQuery] = useState('')
  const { isDarkMode } = useSelector(store => store.theme);
  const FAQData = [
    {
      category: 'All',
    },
    {
      category: 'General',
      questions: [
        { question: 'What is telemedicine?', answer: 'Telemedicine allows you to consult a doctor remotely through an app.' },
        { question: 'Is telemedicine safe?', answer: 'Yes, telemedicine is safe and secure with encrypted communication for patient privacy.' },
        { question: 'Do I need insurance to use telemedicine?', answer: 'Insurance is not always required, but many insurance companies do cover telemedicine consultations.' },
        { question: 'What type of devices can I use for telemedicine?', answer: 'You can use smartphones, tablets, or computers with internet access for telemedicine consultations.' },
        { question: 'Is telemedicine available 24/7?', answer: 'Yes, depending on the service, telemedicine consultations are often available 24/7.' }
      ]
    },
    {
      category: 'Services',
      questions: [
        { question: 'What services do you provide?', answer: 'We provide consultations, prescriptions, and follow-ups through our app.' },
        { question: 'Can I get a prescription through telemedicine?', answer: 'Yes, after a consultation, a licensed doctor can prescribe medication through the app.' },
        { question: 'Do you offer mental health services?', answer: 'Yes, we provide mental health consultations with licensed therapists and counselors.' },
        { question: 'Can I get a second opinion from a doctor?', answer: 'Yes, you can request a second opinion from another licensed professional using the app.' },
        { question: 'Do you offer pediatric services?', answer: 'Yes, our app offers pediatric consultations for children of all ages.' }
      ]
    }
  ];
  

  const contactData = [
    { icon: 'headset', label: 'Customer Service', value: '' },
    { icon: 'whatsapp', label: 'Whatsapp', value: '0810 666 6666' },
    { icon: 'web', label: 'Website', value: '' },
    { icon: 'facebook', label: 'Facebook', value: '' },
    { icon: 'twitter', label: 'Twitter', value: '' },
    { icon: 'instagram', label: 'Instagram', value: '' },
  ];

  // Filter questions based on the active category
  const filteredFAQs =
  activeCategory === 'All'
    ? FAQData.flatMap((item) => item.questions || []) // Combine all questions from categories except "All"
    : FAQData.find((item) => item.category === activeCategory)?.questions || [];


  const handleToggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const toggleExpand = (index) => {
    setIsExpanded(isExpanded === index? null: index);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode? Colors.darkTheme.backgroundColor: Colors.lightTheme.backgroundColor,
    },
    tabs: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode? Colors.darkTheme.BorderGrayColor: Colors.lightTheme.BorderGrayColor,
    },
    tab: {
      paddingVertical: hp(1.5),
      paddingHorizontal: wp(4),
    },
    activeTab: {
      borderBottomWidth: 5,
      borderBottomColor: isDarkMode? Colors.darkTheme.primaryColor: Colors.lightTheme.primaryColor,
      borderBottomEndRadius: 5,
      borderBottomStartRadius: 5,
      
    },
    tabText: {
      fontSize: RFPercentage(2),
      fontFamily: Fonts.Regular,
      color: isDarkMode? Colors.darkTheme.secondryTextColor: Colors.lightTheme.secondryTextColor,
    },
    activeTabText: {
      color: isDarkMode? Colors.darkTheme.primaryTextColor: Colors.lightTheme.primaryTextColor,
    },
    content: {
      flex: 1,
    },
    categoryTabs: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginVertical: hp(2),
    },
    categoryTab: {
      paddingVertical: hp(1),
      paddingHorizontal: wp(8),
      borderRadius: wp(2), // Responsive radius
      backgroundColor: isDarkMode? Colors.darkTheme.secondryColor: Colors.lightTheme.secondryColor,
      borderColor: isDarkMode? Colors.darkTheme.secondryColor : Colors.lightTheme.BorderGrayColor,
      borderWidth: wp(0.3),
    },
    activeCategoryTab: {
      backgroundColor: isDarkMode? Colors.darkTheme.primaryColor: Colors.lightTheme.primaryColor,
    },
    categoryTabText: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Regular,
      color: isDarkMode? Colors.darkTheme.primaryTextColor: Colors.lightTheme.secondryTextColor,
    },
    activeCategoryTabText: {
      color: isDarkMode? Colors.darkTheme.primaryTextColor: Colors.lightTheme.secondryColor,
    },
    faqContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: wp(3),
      paddingHorizontal: wp(4),
    },
    faqQuestion: {
      fontSize: RFPercentage(1.93),
      fontFamily: Fonts.Medium,
      color: isDarkMode? Colors.darkTheme.primaryTextColor: Colors.lightTheme.primaryTextColor,
    },
    faqAnswer: {
      fontSize: RFPercentage(1.8),
      fontFamily: Fonts.Regular,
      color: isDarkMode? Colors.darkTheme.primaryTextColor: Colors.lightTheme.primaryTextColor,
      paddingLeft: wp(4),
      borderTopColor: isDarkMode?Colors.darkTheme.BorderGrayColor: Colors.lightTheme.BorderGrayColor,
      borderTopWidth: 1,
      paddingVertical: hp(2),
    },
    contactContainer: {
        marginBottom: hp(1.7),
        borderColor: isDarkMode? Colors.darkTheme.BorderGrayColor:Colors.lightTheme.BorderGrayColor, 
        borderWidth: 1, 
        borderRadius: 6, 
        paddingVertical: wp(3),
        paddingHorizontal: wp(4),

      },
      contactHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      contactLabel: {
        flex: 1,
        marginLeft: wp(2),
        fontSize: RFPercentage(1.93),
        fontFamily: Fonts.Medium,
        color: isDarkMode? Colors.darkTheme.primaryTextColor: Colors.lightTheme.primaryTextColor
      },
      expandableContent: {
        marginTop: hp(1),
        paddingLeft: 34,
        borderTopColor: isDarkMode?Colors.darkTheme.BorderGrayColor: Colors.lightTheme.BorderGrayColor,
      borderTopWidth: 1,
      paddingTop: hp(1)
      },
      contactValue: {
        fontSize: RFPercentage(1.8),
        fontFamily: Fonts.Regular,
        color: isDarkMode? Colors.darkTheme.primaryTextColor: Colors.lightTheme.primaryTextColor

      },
  });
  
  return (
    <SafeAreaView style={styles.container}>
      
      <StackHeader title={'Help Centere'} />

      <TxtInput  rightIcon={'magnify'} rightIconSize={RFPercentage(3)}
                    rightIconColor={
                        isDarkMode
                            ? Colors.darkTheme.primaryColor
                            : Colors.lightTheme.primaryColor
                    } placeholder={'Need help...'} style={{ width: wp(90), alignSelf:'center'  }} value={searchQuery} onChangeText={setSearchQuery} containerStyle={{ paddingHorizontal: wp(5) }} />

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'FAQ' && styles.activeTab]}
          onPress={() => setActiveTab('FAQ')}
        >
          <Text style={[styles.tabText, activeTab === 'FAQ' && styles.activeTabText]}>FAQ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Contact Us' && styles.activeTab]}
          onPress={() => setActiveTab('Contact Us')}
        >
          <Text style={[styles.tabText, activeTab === 'Contact Us' && styles.activeTabText]}>Contact Us</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'FAQ' ? (
        <View style={styles.content}>
          {/* Category Tabs */}
          <View style={styles.categoryTabs}>
            {FAQData.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryTab,
                  activeCategory === item.category && styles.activeCategoryTab,
                ]}
                onPress={() => setActiveCategory(item.category)}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    activeCategory === item.category && styles.activeCategoryTabText,
                  ]}
                >
                  {item.category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* FAQ List */}
          <FlatList
            data={filteredFAQs}
            keyboardShouldPersistTaps='handled'
            style={{paddingHorizontal: wp(5)}}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity style={{borderColor: isDarkMode? Colors.darkTheme.BorderGrayColor:Colors.lightTheme.BorderGrayColor, borderWidth: 1, borderRadius: 6, marginBottom: hp(2)}} onPress={() => handleToggleExpand(index)}>

                <View style={styles.faqContainer}>
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <Icon
                    name={expandedIndex === index ? 'expand-less' : 'expand-more'}
                    size={24}
                    color={isDarkMode
                        ? Colors.darkTheme.primaryColor
                        : Colors.lightTheme.primaryColor}
                  />
                </View>
                {expandedIndex === index && <Text style={styles.faqAnswer}>{item.answer}</Text>}
              </TouchableOpacity>
            )}
          />
        </View>
      ) : (
        <FlatList
          data={contactData}
          keyExtractor={(item, index) => index.toString()}
          style={{paddingHorizontal: wp(5), marginTop: hp(2)}}
          renderItem={({ item, index }) => (
            <View style={styles.contactContainer}>
            {/* Header */}
            <TouchableOpacity onPress={()=>toggleExpand(index)} style={styles.contactHeader}>
              <MaterialCommunityIcons name={item.icon} size={24} color={isDarkMode? Colors.darkTheme.primaryColor: Colors.lightTheme.primaryColor} />
              <Text style={styles.contactLabel}>{item.label}</Text>
              <MaterialCommunityIcons
                name={isExpanded === index  ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={isDarkMode? Colors.darkTheme.primaryColor: Colors.lightTheme.primaryColor}
              />
            </TouchableOpacity>
      
            {/* Expandable Content */}
            {isExpanded === index && (
              <View style={styles.expandableContent}>
                {item.value ? (
                  <Text style={styles.contactValue}>{item.value}</Text>
                ) : (
                  <Text style={styles.contactValue}>No additional information</Text>
                )}
              </View>
            )}
          </View>



          )}
        />
      )}
    </SafeAreaView>
  );
};

export default HelpCenterScreen;
