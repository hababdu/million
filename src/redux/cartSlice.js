import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: JSON.parse(localStorage.getItem("cartItems")) || [],
  totalAmount: 0,
};

const updateLocalStorage = (cartItems) => {
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
        const product = action.payload;
        const existingItem = state.cartItems.find((item) => item.id === product.id);
      
        if (existingItem) {
          existingItem.quantity += product.quantity;
        } else {
          state.cartItems.push({ ...product });
        }
      
        localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
      },
      
    
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((item) => item.id !== action.payload);
      updateLocalStorage(state.cartItems);
    },

    decreaseQuantity: (state, action) => {
      const item = state.cartItems.find((item) => item.id === action.payload);
      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          state.cartItems = state.cartItems.filter((item) => item.id !== action.payload);
        }
      }
      updateLocalStorage(state.cartItems);
    },

    clearCart: (state) => {
      state.cartItems = [];
      updateLocalStorage([]);
    },
  },
});

export const { addToCart, removeFromCart, decreaseQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
