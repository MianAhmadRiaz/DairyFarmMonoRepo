import { combineReducers, configureStore } from '@reduxjs/toolkit';
import persistStore from 'redux-persist/es/persistStore';
import persistedSettingsReducer from './settingsSlice';
import persistedUserReducer from './userSlice';
import persistedAppReducer from './appSlice';
import sidebarReducer from './sidebarSlice';


const rootReducer = combineReducers({
  
  app: persistedAppReducer,
  user: persistedUserReducer,
  settings: persistedSettingsReducer ,// Add settings reducer
   sidebar: sidebarReducer
});

// Create store
const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false // Needed for redux-persist
    }),
  devTools: process.env.NODE_ENV !== 'production'
});

// Create persistor
const persistor = persistStore(store);
export type RootState = ReturnType<typeof rootReducer>;

export { store, persistor };


