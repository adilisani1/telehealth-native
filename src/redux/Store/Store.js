import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
} from 'redux-persist';

import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthSlice from '../Slices/authSlice';
import ThemeSlice from '../Slices/Theme';


const persistConfig = {
  key: 'root',
  storage: AsyncStorage, // Use AsyncStorage for persistence
  whitelist: ['auth', 'theme'] // Specify the slices you want to persist
};

const rootReducer = combineReducers({
      auth: AuthSlice,
      theme: ThemeSlice
})

const persistedReducer = persistReducer(persistConfig, rootReducer);


export const Store = configureStore({
  reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
          immutableCheck: false,
          serializableCheck: false,
      }),
});


export const persistor = persistStore(Store);
