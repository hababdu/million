import { createSlice } from "@reduxjs/toolkit";

const initialViewedProducts =
  JSON.parse(localStorage.getItem("viewedProducts")) || [];

const productHistorySlice = createSlice({
  name: "productHistory",
  initialState: {
    viewedProducts: initialViewedProducts,
  },
  reducers: {
    addViewedProduct(state, action) {
      const product = action.payload;
      
      // Agar mahsulot allaqachon ro‘yxatda bo‘lsa, uni olib tashlaymiz
      state.viewedProducts = state.viewedProducts.filter(p => p.id !== product.id);

      // Yangi mahsulotni oldinga qo‘shamiz
      state.viewedProducts.unshift(product);

      // Maksimal mahsulotlar sonini cheklash (20 ta)
      if (state.viewedProducts.length > 20) {
        state.viewedProducts.pop();
      }

      // localStorage'ga saqlash
      localStorage.setItem("viewedProducts", JSON.stringify(state.viewedProducts));
    },
    removeViewedProduct(state, action) {
      // Mahsulotni ID bo‘yicha o‘chirish
      state.viewedProducts = state.viewedProducts.filter(product => product.id !== action.payload);
      // localStorage'dan ham o'chirish
      localStorage.setItem("viewedProducts", JSON.stringify(state.viewedProducts));
    },
    clearViewedProducts(state) {
      state.viewedProducts = [];
      localStorage.removeItem("viewedProducts");
    },
  },
});

export const { addViewedProduct, removeViewedProduct, clearViewedProducts } = productHistorySlice.actions;
export default productHistorySlice.reducer;
