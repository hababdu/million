import { configureStore } from "@reduxjs/toolkit";
import { 
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER 
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import likeReducer from "./likeSlice";
import cartReducer from "./cartSlice"; 
import productReducer from './productSlice';
import productHistoryReducer from './productSliceHistory';
import authReducer from './authSlice';
import themeReducer from "./themeSlice";

// Auth uchun persist config
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'isAuthenticated']
};

// Cart uchun persist config
const cartPersistConfig = {
  key: 'cart',
  storage
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);

// Store ni yaratish
const store = configureStore({
  reducer: {
    likes: likeReducer,
    cart: persistedCartReducer,
    products: productReducer,
    productHistory: productHistoryReducer,
    auth: persistedAuthReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Persistor ni yaratish
const persistor = persistStore(store);

// Eksport qilish - IKKALA EXPORT HAM KERAK
export { store, persistor };