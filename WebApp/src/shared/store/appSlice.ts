import { createSlice } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Use localStorage for persistence

const initialState = {
  notifications: true // Default notification setting
};

// Create the slice
const appSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleNotifications: state => {
      state.notifications = !state.notifications;
    }
  }
});

// Extract actions
export const { toggleNotifications } = appSlice.actions;

// Configure persistence
const persistConfig = {
  key: 'settings',
  storage
};

const persistedAppReducer = persistReducer(persistConfig, appSlice.reducer);

export default persistedAppReducer;
