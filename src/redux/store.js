import { configureStore } from "@reduxjs/toolkit";
import likeReducer from "./likeSlice";
import cartReducer from "./cartSlice"; 
import productReducer from './productSlice';
import productHistoryReducer from './productSliceHistory'; // ✅ Nomi to‘g‘rilandi

const store = configureStore({
  reducer: {
    likes: likeReducer,
    cart: cartReducer, 
    products: productReducer,
    productHistory: productHistoryReducer // ✅ Aniq nom qo‘shildi
  },
});

export default store;
