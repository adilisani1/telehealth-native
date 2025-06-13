import React, {createContext, useState} from 'react';

const dummySocket = {
  emit: (...args) => console.log('[DummySocket] emit:', ...args),
  on: (...args) => console.log('[DummySocket] on:', ...args),
  off: (...args) => console.log('[DummySocket] off:', ...args),
};

export const SocketContext = createContext(dummySocket);

export const SocketProvider = ({children}) => {
  const [soc] = useState(dummySocket);
  return (
    <SocketContext.Provider value={soc}>{children}</SocketContext.Provider>
  );
};
