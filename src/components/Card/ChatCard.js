import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    Image,
  } from 'react-native';
  import React, {useState, useEffect} from 'react';
  import { Fonts } from '../../Constants/Fonts';
  import {RFPercentage} from 'react-native-responsive-fontsize';
  import {useNavigation} from '@react-navigation/native';
  import { widthPercentageToDP } from 'react-native-responsive-screen';
  import { useSelector } from 'react-redux';
  import { Colors } from '../../Constants/themeColors';
  const ChatCard = ({profile, user_name, message, created_at, unread_count, onpress}) => {
    // const navigation = useNavigation();

    
    const name = user_name;
    const avatarLetter = name ? name.charAt(0).toUpperCase() : '';
  
    const styles = StyleSheet.create({
      card: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20},
     
      rowViewSB: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      title: {
        fontFamily: Fonts.Inter_SemiBold,
        color: Colors.primary_text,
        fontSize: RFPercentage(2),
        lineHeight: 30,
      },
      timeText: {
        fontFamily: Fonts.Inter_Medium,
        color: Colors.secondary_text,
        fontSize: RFPercentage(1.5),
      },
      description: {
        fontFamily: Fonts.Inter_Regular,
        color: Colors.secondary_text,
        fontSize: RFPercentage(1.5),
        flex: 0.9,
      },
    });
    return (
      <TouchableOpacity
        onPress={onpress}
        style={styles.card}>
        
        {/* {
          profile ? <Avatar.Image source={profile} size={40} /> : <View style={{backgroundColor: Colors.button.primary_button, paddingHorizontal: widthPercentageToDP(4),paddingVertical: widthPercentageToDP(2.2), borderRadius: widthPercentageToDP(10), }} ><Text style={{color: Colors.button.primary_button_text, fontSize: RFPercentage(2.4), padding: 0}} >{avatarLetter}</Text></View>
        } */}
        <View style={{marginLeft: 10, flex: 1}}>
          <View style={styles.rowViewSB}>
            <Text style={styles.title}>{user_name}</Text>
            <Text
              style={{
                ...styles.timeText,
                fontFamily:
                  unread_count > 0
                    ? Fonts.PlusJakartaSans_Bold
                    : Fonts.Inter_Medium,
                color: unread_count > 0 ? Colors.primary_text : Colors.secondary_text,
              }}>
              {created_at}
            </Text>
          </View>
          <View style={styles.rowViewSB}>
            <Text
              style={{
                ...styles.description,
  
                fontFamily:
                  unread_count > 0
                    ? Fonts.PlusJakartaSans_Bold
                    : Fonts.Inter_Regular,
                color: unread_count > 0 ? Colors.primary_text : Colors.secondary_text,
              }}
              numberOfLines={1}>
              {message}
            </Text>
            {/* {unread_count > 0 && <CBadge text={unread_count} />} */}
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  export default ChatCard;
  
  
  