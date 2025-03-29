import { createSlice } from '@reduxjs/toolkit';

// LocalStorage'dan ma'lumotlarni o'qib olish
const loadFromLocalStorage = (key) => {
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState === null) return [];
    return JSON.parse(serializedState);
  } catch (e) {
    console.warn(`Failed to load ${key} from localStorage`, e);
    return [];
  }
};

// LocalStorage'ga ma'lumotlarni yozish
const saveToLocalStorage = (key, state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(key, serializedState);
  } catch (e) {
    console.warn(`Failed to save ${key} to localStorage`, e);
  }
};

// Boshlang'ich holatni LocalStorage'dan yuklash
const initialState = {
  likedProducts: loadFromLocalStorage('likedProducts'),
  comparedProducts: loadFromLocalStorage('comparedProducts'),
  maxCompareItems: 3, // Solishtirish uchun maksimal mahsulotlar soni
};

const likeSlice = createSlice({
  name: 'likes',
  initialState,
  reducers: {
    // Sevimlilarga qo'shish/o'chirish
    toggleLike: (state, action) => {
      const productId = action.payload;
      const index = state.likedProducts.indexOf(productId);
      
      if (index === -1) {
        state.likedProducts.push(productId);
      } else {
        state.likedProducts.splice(index, 1);
      }
      
      // LocalStorage'ga saqlash
      saveToLocalStorage('likedProducts', state.likedProducts);
    },
    
    // Solishtirish uchun qo'shish/o'chirish
    addToCompare: (state, action) => {
      const productId = action.payload;
      const index = state.comparedProducts.indexOf(productId);
      
      if (index === -1) {
        if (state.comparedProducts.length < state.maxCompareItems) {
          state.comparedProducts.push(productId);
        }
      } else {
        state.comparedProducts.splice(index, 1);
      }
      
      // LocalStorage'ga saqlash
      saveToLocalStorage('comparedProducts', state.comparedProducts);
    },
    
    // Barcha sevimlilarni tozalash
    clearAllLikes: (state) => {
      state.likedProducts = [];
      localStorage.removeItem('likedProducts');
    },
    
    // Barcha solishtirishlar ro'yxatini tozalash
    clearAllCompares: (state) => {
      state.comparedProducts = [];
      localStorage.removeItem('comparedProducts');
    },
    
    // Max solishtirishlar sonini o'zgartirish
    setMaxCompareItems: (state, action) => {
      const newMax = action.payload;
      if (newMax >= 1 && newMax <= 5) { // 1-5 oralig'ida cheklash
        state.maxCompareItems = newMax;
        
        // Agar yangi maksimal son hozirgi ro'yxatdan kichik bo'lsa, ortiqcha elementlarni o'chirish
        if (state.comparedProducts.length > newMax) {
          state.comparedProducts = state.comparedProducts.slice(0, newMax);
          saveToLocalStorage('comparedProducts', state.comparedProducts);
        }
      }
    },
    
    // LocalStorage'dan qayta yuklash
    reloadFromStorage: (state) => {
      state.likedProducts = loadFromLocalStorage('likedProducts');
      state.comparedProducts = loadFromLocalStorage('comparedProducts');
    }
  }
});

// Action creatorlar
export const { 
  toggleLike, 
  addToCompare, 
  clearAllLikes, 
  clearAllCompares, 
  setMaxCompareItems,
  reloadFromStorage
} = likeSlice.actions;

// Selectorlar
export const selectLikedProducts = (state) => state.likes.likedProducts;
export const selectComparedProducts = (state) => state.likes.comparedProducts;
export const selectMaxCompareItems = (state) => state.likes.maxCompareItems;
export const selectIsProductLiked = (productId) => (state) => 
  state.likes.likedProducts.includes(productId);
export const selectIsProductCompared = (productId) => (state) => 
  state.likes.comparedProducts.includes(productId);

export default likeSlice.reducer;