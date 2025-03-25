import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  likedProducts: JSON.parse(localStorage.getItem("likedProducts")) || [],
};

const likeSlice = createSlice({
  name: "likes",
  initialState,
  reducers: {
    toggleLike: (state, action) => {
      const productId = action.payload;
      if (state.likedProducts.includes(productId)) {
        state.likedProducts = state.likedProducts.filter((id) => id !== productId);
      } else {
        state.likedProducts.push(productId);
      }
      localStorage.setItem("likedProducts", JSON.stringify(state.likedProducts));
    },
  },
});

export const { toggleLike } = likeSlice.actions;
export default likeSlice.reducer;
