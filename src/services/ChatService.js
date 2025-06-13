
let dummyMessages = [
  {
    id: '1',
    text: 'Hello, doctor, I need help.',
    time: '10:13',
    sender: 'user',
  },
  {
    id: '2',
    text: 'I’m here for you. What symptoms are you experiencing?',
    time: '10:14',
    sender: 'doctor',
  },
];

export const startConsultation = (
  soc,
  userPhone,
  doctorPhone,
  newConsultation = false,
) => {
  //server room 
  if (soc && soc.emit) {
    soc.emit('joinServer', {
      roomId: `${userPhone}_${doctorPhone}`,
      phone: userPhone,
    });
    if (newConsultation) {
      sendMessage(
        soc,
        userPhone,
        doctorPhone,
        `Consultation started at ${new Date().toLocaleTimeString()}`,
        true,
      );
      console.log(`Joined room ${userPhone}_${doctorPhone}`);
    }
  } else {
    // No socket
    console.log(`[DUMMY] Joined room ${userPhone}_${doctorPhone}`);
  }
};

export const sendMessage = (
  soc,
  userPhone,
  doctorPhone,
  message,
  system = false,
) => {
  const msgObj = {
    id: Math.random().toString(),
    text: message,
    time: new Date().toLocaleTimeString().slice(0, 5),
    sender: system ? 'system' : 'user',
    system,
  };
  dummyMessages = [msgObj, ...dummyMessages];
  // socket emit
  if (soc && soc.emit) {
    soc.emit('message', {
      roomId: `${userPhone}_${doctorPhone}`,
      payload: msgObj,
    });
  } else {
    console.log(`[DUMMY] Sent message:`, msgObj);
  }
  return msgObj;
};

export const fetchAllMessages = (userPhone, doctorPhone) => {
  // Here, just return all dummy messages
  return Promise.resolve([...dummyMessages]);
};
