import React, {createContext, useContext, useState} from 'react';
import {Alert} from 'react-native';
import {
  mediaDevices,
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
} from 'react-native-webrtc';
import { SocketContext } from './SocketProvider';

const pc_config = {
  iceServers: [
    {
      urls: [
        'turn:13.250.13.83:3478?transport=udp',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
      username: 'YzYNCouZM1mhqhmseWk6',
      credential: 'YzYNCouZM1mhqhmseWk6',
    },
    // ... add more if needed
  ],
};

export const VideoCallContext = createContext({
  peerConnection: null,
  localStream: null,
  remoteStream: null,
  initialize: () => {},
  toggleMic: () => {},
  toggleVideo: () => {},
  toggleCamera: () => {},
  endCall: () => {},
  createOffer: () => {},
  createAnswer: () => {},
  onCall: false,
  callEnded: false,
  setOnCall: () => {},
  setCallEnded: () => {},
  roomId: '',
  callStatus: '',
  mic: true,
  video: true,
});

export const VideoCallProvider = props => {
  const soc = useContext(SocketContext);
  const [onCall, setOnCall] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  let roomId = '';
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection] = useState(new RTCPeerConnection(pc_config));
  const [callStatus, setCallStatus] = useState('');
  const [mic, setMic] = useState(true);
  const [video, setVideo] = useState(true);

  const sendToPeer = (messageType, payload) => {
    soc.emit(messageType, {
      roomId: roomId,
      payload,
    });
  };

  const startMedia = () => {
    return new Promise((resolve, reject) => {
      let isFront = true;
      mediaDevices.enumerateDevices().then(async sourceInfos => {
        let videoSourceId;
        for (let i = 0; i < sourceInfos.length; i++) {
          const sourceInfo = sourceInfos[i];
          if (
            sourceInfo.kind === 'videoinput' &&
            sourceInfo.facing === (isFront ? 'front' : 'environment')
          ) {
            videoSourceId = sourceInfo.deviceId;
          }
        }

        const constraints = {
          audio: true,
          video: {
            mandatory: {
              minWidth: 1280,
              minHeight: 720,
              minFrameRate: 30,
            },
            facingMode: isFront ? 'user' : 'environment',
            optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
          },
        };

        try {
          let success = await mediaDevices.getUserMedia(constraints);
          resolve(success);
        } catch (err) {
          reject(err);
        }
      });
    });
  };

  const initialize = () => {
    soc.on('connection-success', success => {});

    soc.on('offerOrAnswer', data => {
      setOnCall(true);
      setCallEnded(false);
      let sdp = data.payload;
      roomId = data.roomId;
      peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
      if (sdp.type === 'answer') return;
      Alert.alert(
        'New Call',
        'You have a new call from your doctor',
        [
          {
            text: 'Reject',
            onPress: () => {
              setOnCall(false);
              console.log('Rejected');
            },
            style: 'cancel',
          },
          {
            text: 'Accept',
            onPress: async () => {
              createAnswer();
              console.log('Accepted');
            },
          },
        ],
        {cancelable: false},
      );
    });

    soc.on('answered', sdp => {
      try {
        peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
      } catch (err) {
        console.log(err);
      }
    });

    soc.on('callEnded', data => {
      setCallEnded(true);
      setOnCall(false);
      endCall();
    });

    soc.on('candidate', candidate => {
      peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });

    peerConnection.onicecandidate = e => {
      if (e.candidate) {
        sendToPeer('candidate', e.candidate);
      }
    };

    peerConnection.onaddstream = e => {
      setRemoteStream(e.stream);
    };
  };

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

  const endCall = () => {
    try {
      peerConnection.getLocalStreams().forEach(stream => {
        stream.getTracks().forEach(track => {
          track.stop();
        });
      });
      peerConnection.getRemoteStreams().forEach(stream => {
        stream.getTracks().forEach(track => {
          track.stop();
        });
      });
    } catch (err) {
      console.log(err);
    }
    sendToPeer('callEnded', 'End');
    setCallEnded(true);
    setOnCall(false);
  };

  const createOffer = room => {
    setCallStatus('Calling');
    roomId = room;
    startMedia()
      .then(stream => {
        setLocalStream(stream);
        peerConnection.addStream(stream);
        peerConnection
          .createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          })
          .then(sdp => {
            peerConnection.setLocalDescription(sdp);
            sendToPeer('offerOrAnswer', sdp);
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {});
  };

  const createAnswer = () => {
    setCallStatus('Answered');
    startMedia()
      .then(stream => {
        setLocalStream(stream);
        peerConnection.addStream(stream);
        peerConnection
          .createAnswer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          })
          .then(sdp => {
            peerConnection.setLocalDescription(sdp);
            setOnCall(true);
            sendToPeer('offerOrAnswer', sdp);
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {});
  };

  return (
    <VideoCallContext.Provider
      value={{
        peerConnection,
        localStream,
        remoteStream,
        initialize,
        toggleMic,
        toggleVideo,
        toggleCamera,
        endCall,
        createOffer,
        createAnswer,
        onCall,
        setOnCall,
        callEnded,
        setCallEnded,
        roomId,
        mic,
        video,
        callStatus,
      }}>
      {props.children}
    </VideoCallContext.Provider>
  );
};
