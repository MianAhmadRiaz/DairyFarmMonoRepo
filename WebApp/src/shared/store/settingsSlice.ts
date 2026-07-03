import { createSlice } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Use localStorage for persistence

const initialState = {
  theme: 'light', // Default theme
  language: 'en', // Default language
  notifications: true // Default notification setting
};

// Create the slice
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    toggleNotifications: state => {
      state.notifications = !state.notifications;
    }
  }
});

// Extract actions
export const { setTheme, setLanguage, toggleNotifications } =
  settingsSlice.actions;

// Configure persistence
const persistConfig = {
  key: 'settings',
  storage
};

const persistedSettingsReducer = persistReducer(
  persistConfig,
  settingsSlice.reducer
);

export default persistedSettingsReducer;
