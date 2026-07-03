import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Use localStorage for persistence
import { UserState } from '../utils/types';

const initialState: UserState = {
  authToken: '', // Default theme
  user: null, // Default language
  rememberMe: false,
  isSoftwareAdmin: false,
  selectedModule: 'herd'
};

// Create the slice
const userSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setAuthToken: (state, action) => {
      state.authToken = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setRememberMe: (state, action) => {
      state.rememberMe = action.payload;
    },

    setSoftwareAdmin: (state, action) => {
      state.isSoftwareAdmin = action.payload;
    },

    onLogout: state => {
      state.authToken = '';
      state.user = null;
      state.isSoftwareAdmin = false;
      state.selectedModule = 'herd';
    },
    setSelectedModule: (
      state,
      action: PayloadAction<
        | 'herd'
        | 'stock'
        | 'milking'
        | 'employee'
        | 'feeding'
        | 'accounts'
        | 'admin'
      >
    ) => {
      state.selectedModule = action.payload;
    }
  }
});

// Extract actions
export const {
  onLogout,
  setAuthToken,
  setUser,
  setRememberMe,
  setSoftwareAdmin,
  setSelectedModule
} = userSlice.actions;

// Configure persistence
const persistConfig = {
  key: 'user',
  storage
};

const persistedUserReducer = persistReducer(persistConfig, userSlice.reducer);

export default persistedUserReducer;
