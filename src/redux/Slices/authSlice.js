import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userId: '', // Set the default theme here (false = Light Theme, true = Dark Theme),
  User: {}
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.User = action.payload;
    },
    setUserId: (state, action) => {
      state.userId = action.payload
    },
   
  },
});

export const { setUser, setUserId } = authSlice.actions;
export default authSlice.reducer;
