// likeSlice.js
import { createSlice } from '@reduxjs/toolkit';

const likeSlice = createSlice({
  name: 'likes',
  initialState: {
    likedProducts: [],
    comparedProducts: []
  },
  reducers: {
    toggleLike: (state, action) => {
      const productId = action.payload;
      if (state.likedProducts.includes(productId)) {
        state.likedProducts = state.likedProducts.filter(id => id !== productId);
      } else {
        state.likedProducts.push(productId);
      }
    },
    addToCompare: (state, action) => {
      const productId = action.payload;
      if (state.comparedProducts.includes(productId)) {
        state.comparedProducts = state.comparedProducts.filter(id => id !== productId);
      } else {
        if (state.comparedProducts.length < 3) {
          state.comparedProducts.push(productId);
        }
      }
    }
  }
});

export const { toggleLike, addToCompare } = likeSlice.actions;
export default likeSlice.reducer;