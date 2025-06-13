import React, {useContext, useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {SocketContext} from '../../../Providers/SocketProvider';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RTCView } from 'react-native-webrtc';
import {COLORS, SIZES} from '../../../Constants/themes';
import {VideoCallContext} from '../../../Providers/VideoCallProvider';
import {AuthContext} from '../../../Providers/AuthProvider';
import {startConsultation} from '../../../services/ChatService';

export default function CallScreen(props) {
  const {
    onCall,
    localStream,
    remoteStream,
    createOffer,
    peerConnection,
    endCall,
    setOnCall,
    setCallEnded,
  } = useContext(VideoCallContext);

  const [user, setUser] = useContext(AuthContext);
  const [mic, setMic] = useState(true);
  const [video, setVideo] = useState(true);
  const soc = useContext(SocketContext);

  useEffect(() => {
    setOnCall(true);
    setCallEnded(false);
    call();
  }, []);

  useEffect(() => {
    if (!onCall) {
      props.navigation.goBack();
    }
  }, [onCall]);

  const toggleMic = () => {
    if (localStream)
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
        setMic(!mic);
      });
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
        setVideo(!video);
      });
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track._switchCamera());
    }
  };

  const call = () => {
    startConsultation(soc, user.phone, user.selectedPhone?.toString());
    createOffer(user.phone + '_' + user.selectedPhone);
  };

  const remoteVideo = remoteStream ? (
    <RTCView
      key={2}
      mirror={true}
      style={styles.rtcViewRemote}
      objectFit="contain"
      streamURL={remoteStream && remoteStream.toURL()}
    />
  ) : (
    <View
      style={{
        height: SIZES.height,
        width: SIZES.width,
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text
        style={{
          fontSize: 22,
          textAlign: 'center',
          color: 'white',
          justifyContent: 'center',
          backgroundColor: 'black',
        }}>
        Connecting...
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.primary[100]}}>
      <StatusBar backgroundColor="green" barStyle={'dark-content'} />
      <View style={styles.videosContainer}>
        <View
          style={{
            position: 'absolute',
            zIndex: 1,
            top: 20,
            right: 3,
            backgroundColor: 'orange',
          }}>
          <View style={{flex: 1}}>
            <TouchableOpacity
              onPress={() =>
                localStream && localStream._tracks[1]._switchCamera()
              }>
              <View>
                <RTCView
                  key={1}
                  zOrder={0}
                  objectFit="cover"
                  mirror={true}
                  style={styles.rtcView}
                  streamURL={localStream && localStream.toURL()}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView style={styles.scrollView}>
          <View
            style={{
              flex: 1,
              width: '100%',
              backgroundColor: 'black',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {remoteVideo}
          </View>
        </ScrollView>
      </View>
      <View style={styles.bottomButtonsContainer}>
      <TouchableOpacity onPress={toggleMic}>
          <View style={styles.circularButtonWrapper}>
            {mic ? (
              <Feather name="mic" size={26} color="white" />
            ) : (
              <Feather name="mic-off" size={26} color="white" />
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleVideo}>
          <View style={styles.circularButtonWrapper}>
            {video ? (
              <Feather name="video" size={26} color="white" />
            ) : (
              <Feather name="video-off" size={26} color="white" />
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleCamera}>
          <View style={styles.circularButtonWrapper}>
            <MaterialCommunityIcons
              name="camera-switch-outline"
              size={26}
              color="white"
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={endCall}>
          <View style={[styles.circularButtonWrapper, styles.endCallWrapper]}>
            <Feather name="phone-call" size={26} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  endCallWrapper: {
    backgroundColor: 'red',
  },
  bottomButtonsContainer: {
    position: 'absolute',
    bottom: '8%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
  circularButtonWrapper: {
    borderRadius: 50,
    backgroundColor: COLORS.primary[400],
    padding: 17,
  },
  videosContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  rtcView: {
    width: 120,
    height: 180,
    backgroundColor: 'gray',
    zIndex: 100,
    position: 'absolute',
    right: 5,
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  rtcViewRemote: {
    width: SIZES.width,
    height: SIZES.height,
    backgroundColor: 'black',
  },
});
