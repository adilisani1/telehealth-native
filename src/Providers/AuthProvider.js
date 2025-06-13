import React, {createContext, useState} from 'react';

const defaultUser = {
  _id: '',
  phone: '',
  name: '',
  dob: '',
  gender: '',
  money: -1,
  selectedPhone: 0,
};

export const AuthContext = createContext([defaultUser, () => {}]);

export const AuthProvider = props => {
  const [user, setUser] = useState(defaultUser);
  return (
    <AuthContext.Provider value={[user, setUser]}>
      {props.children}
    </AuthContext.Provider>
  );
};
