import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: JSON.parse(localStorage.getItem("cartItems")) || [],
  likedProducts: JSON.parse(localStorage.getItem("likedProducts")) || [],
  totalAmount: JSON.parse(localStorage.getItem("totalAmount")) || 0,
};

const updateLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const calculateTotalAmount = (cartItems) => {
  return cartItems.reduce(
    (total, item) => total + (item.discountedPrice || item.price) * item.quantity,
    0
  );
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const existingItem = state.cartItems.find((item) => item.id === product.id);
    
      if (existingItem) {
        existingItem.quantity += product.quantity || 1;
      } else {
        state.cartItems.push({ 
          ...product,
          quantity: product.quantity || 1,
          discountedPrice: null // Initialize discountedPrice
        });
      }
    
      state.totalAmount = calculateTotalAmount(state.cartItems);
      updateLocalStorage("cartItems", state.cartItems);
      updateLocalStorage("totalAmount", state.totalAmount);
    },
    
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((item) => item.id !== action.payload);
      state.totalAmount = calculateTotalAmount(state.cartItems);
      updateLocalStorage("cartItems", state.cartItems);
      updateLocalStorage("totalAmount", state.totalAmount);
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
      state.totalAmount = calculateTotalAmount(state.cartItems);
      updateLocalStorage("cartItems", state.cartItems);
      updateLocalStorage("totalAmount", state.totalAmount);
    },

    increaseQuantity: (state, action) => {
      const item = state.cartItems.find((item) => item.id === action.payload);
      if (item) {
        item.quantity += 1;
      }
      state.totalAmount = calculateTotalAmount(state.cartItems);
      updateLocalStorage("cartItems", state.cartItems);
      updateLocalStorage("totalAmount", state.totalAmount);
    },

    clearCart: (state) => {
      state.cartItems = [];
      state.totalAmount = 0;
      updateLocalStorage("cartItems", []);
      updateLocalStorage("totalAmount", 0);
    },
    
    toggleLike: (state, action) => {
      const productId = action.payload;
      const index = state.likedProducts.indexOf(productId);
      
      if (index === -1) {
        state.likedProducts.push(productId);
      } else {
        state.likedProducts.splice(index, 1);
      }
      
      updateLocalStorage("likedProducts", state.likedProducts);
    },
    
    clearLikes: (state) => {
      state.likedProducts = [];
      updateLocalStorage("likedProducts", []);
    },

    applyDiscount: (state, action) => {
      const discountPercentage = action.payload;
      
      state.cartItems = state.cartItems.map(item => ({
        ...item,
        discountedPrice: item.price * (1 - discountPercentage / 100)
      }));
      
      state.totalAmount = calculateTotalAmount(state.cartItems);
      updateLocalStorage("cartItems", state.cartItems);
      updateLocalStorage("totalAmount", state.totalAmount);
    },

    removeDiscount: (state) => {
      state.cartItems = state.cartItems.map(item => ({
        ...item,
        discountedPrice: null
      }));
      
      state.totalAmount = calculateTotalAmount(state.cartItems);
      updateLocalStorage("cartItems", state.cartItems);
      updateLocalStorage("totalAmount", state.totalAmount);
    }
  },
});

export const { 
  addToCart, 
  removeFromCart, 
  decreaseQuantity, 
  increaseQuantity,
  clearCart,
  toggleLike,
  clearLikes,
  applyDiscount,
  removeDiscount
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart.cartItems;
export const selectTotalAmount = (state) => state.cart.totalAmount;
export const selectLikedProducts = (state) => state.cart.likedProducts;
export const selectDiscountedItems = (state) => 
  state.cart.cartItems.filter(item => item.discountedPrice !== null);

export default cartSlice.reducer;