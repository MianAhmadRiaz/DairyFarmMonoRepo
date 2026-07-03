import {createSlice} from '@reduxjs/toolkit';

const initialState: any = {
  rememberMe: false,
  accessToken: null,
  fcmToken: null,
};

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthState: () => initialState,
    setRememberMe: (auth, action) => {
      auth.rememberMe = action.payload;
    },
    setAccessToken: (auth, action) => {
      auth.accessToken = action.payload;
    },
    setFcmToken: (auth, action) => {
      auth.fcmToken = action.payload;
    },
  },
});

export const {resetAuthState, setAccessToken, setFcmToken} = slice.actions;
export default slice.reducer;
