import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: JSON.parse(localStorage.getItem("cartItems")) || [],
  likedProducts: JSON.parse(localStorage.getItem("likedProducts")) || [],
  totalAmount: 0,
};

const updateLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
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
    
      updateLocalStorage("cartItems", state.cartItems);
      
      // Yangi totalAmount ni hisoblash
      state.totalAmount = state.cartItems.reduce(
        (total, item) => total + (item.discountedPrice || item.price) * item.quantity,
        0
      );
    },
    
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((item) => item.id !== action.payload);
      updateLocalStorage("cartItems", state.cartItems);
      
      // Yangi totalAmount ni hisoblash
      state.totalAmount = state.cartItems.reduce(
        (total, item) => total + (item.discountedPrice || item.price) * item.quantity,
        0
      );
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
      updateLocalStorage("cartItems", state.cartItems);
      
      // Yangi totalAmount ni hisoblash
      state.totalAmount = state.cartItems.reduce(
        (total, item) => total + (item.discountedPrice || item.price) * item.quantity,
        0
      );
    },

    increaseQuantity: (state, action) => {
      const item = state.cartItems.find((item) => item.id === action.payload);
      if (item) {
        item.quantity += 1;
      }
      updateLocalStorage("cartItems", state.cartItems);
      
      // Yangi totalAmount ni hisoblash
      state.totalAmount = state.cartItems.reduce(
        (total, item) => total + (item.discountedPrice || item.price) * item.quantity,
        0
      );
    },

    clearCart: (state) => {
      state.cartItems = [];
      state.totalAmount = 0;
      updateLocalStorage("cartItems", []);
    },
    
    toggleLike: (state, action) => {
      const productId = action.payload;
      const index = state.likedProducts.indexOf(productId);
      
      if (index === -1) {
        // Mahsulot yo'q, qo'shamiz
        state.likedProducts.push(productId);
      } else {
        // Mahsulot bor, o'chiramiz
        state.likedProducts.splice(index, 1);
      }
      
      updateLocalStorage("likedProducts", state.likedProducts);
    },
    
    // Barcha sevimlilarni tozalash
    clearLikes: (state) => {
      state.likedProducts = [];
      updateLocalStorage("likedProducts", []);
    },
  },
});

export const { 
  addToCart, 
  removeFromCart, 
  decreaseQuantity, 
  increaseQuantity,
  clearCart,
  toggleLike,
  clearLikes
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart.cartItems;
export const selectTotalAmount = (state) => state.cart.totalAmount;
export const selectLikedProducts = (state) => state.cart.likedProducts;

export default cartSlice.reducer;