import AsyncStorage from '@react-native-async-storage/async-storage';
import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {persistReducer, persistStore} from 'redux-persist';
import settingsReducer from './reducers/settingsReducer';
import userReducer from './reducers/userReducer';
import authReducer from './reducers/authReducer';

// declare var window: any;
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};
const reducers = combineReducers({
  user: userReducer,
  settings: settingsReducer,
  auth: authReducer,
});
const persistedReducers = persistReducer(persistConfig, reducers);

const middlewares: any[] = [];

if (__DEV__) {
  const createDebugger = require('redux-flipper').default;
  middlewares.push(createDebugger());
}

export const store = configureStore({
  reducer: persistedReducers,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }).concat(middlewares),
});

export const persistedStore = persistStore(store);
export type RootState = ReturnType<typeof reducers>;
