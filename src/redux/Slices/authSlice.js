import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  userId: '',
  User: {},
  userType: '',
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.User = action.payload;
      state.isAuthenticated = true;
    },
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    setUserType: (state, action) => {
      state.userType = action.payload;
    },
    loginUser: (state, action) => {
      const {user, userType} = action.payload;
      state.User = user;
      state.userType = userType;
      state.userId = user._id || user.id;
      state.isAuthenticated = true;
      state.justLoggedIn = true;
    },
    logoutUser: state => {
      state.User = {};
      state.userType = '';
      state.userId = '';
      state.isAuthenticated = false;
      state.justLoggedIn = false;
    },
  },
});

export const {setUser, setUserId, setUserType, loginUser, logoutUser} =
  authSlice.actions;
export default authSlice.reducer;
