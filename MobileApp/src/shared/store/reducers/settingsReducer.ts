import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  darkMode: false,
  firstTime: true,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    resetSettings: () => initialState,

    setFirstTime: (state, action) => {
      state.firstTime = action.payload;
    },
  },
});
export const {resetSettings, setFirstTime} = settingsSlice.actions;
export default settingsSlice.reducer;
