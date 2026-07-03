import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  user: any;
  authToken: string;
}

const initialState: UserState = {
  user: null,
  authToken: ''
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
    },
    setAuthToken: (state, action: PayloadAction<string>) => {
      state.authToken = action.payload;
    }
  }
});

export const { setUser, setAuthToken } = userSlice.actions;
export default userSlice.reducer;
