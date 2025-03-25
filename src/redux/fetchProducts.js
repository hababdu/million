import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Mahsulotlarni API dan olish uchun thunk yaratamiz
export const fetchProducts = createAsyncThunk("products/fetchProducts", async () => {
    const response = await fetch(`https://dummyjson.com/products?limit=${194}`);
  
    const data = await response.json();
    return data.products;
});

const initialState = {
  searchQuery: "",
  searchHistory: [], // Qidiruv tarixini saqlash uchun
  products: [], // Barcha mahsulotlar
  filteredProducts: [], // Filtrlangan mahsulotlar
  loading: false,
  error: null,
  limit: 8, // Sahifada ko‘rsatiladigan mahsulotlar limiti
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.filteredProducts = state.products.filter((product) =>
        product.title.toLowerCase().includes(action.payload.toLowerCase())
      );
      
      // Tarixga faqat yangi va bo‘sh bo‘lmagan qidiruv so‘zlarini qo‘shamiz
      if (action.payload.trim() && !state.searchHistory.includes(action.payload)) {
        state.searchHistory = [action.payload, ...state.searchHistory].slice(0, 10); // Eng ko‘pi bilan 10 ta tarix saqlanadi
      }
    },
    filterByCategory: (state, action) => {
      if (action.payload === "Barchasi") {
        state.filteredProducts = state.products;
      } else {
        state.filteredProducts = state.products.filter((product) => product.category === action.payload);
      }
    },
    increaseLimit: (state) => {
      state.limit += 8;
    },
    clearSearchHistory: (state) => {
      state.searchHistory = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        state.filteredProducts = action.payload; // Dastlab barcha mahsulotlarni ko‘rsatamiz
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = "Ma'lumot yuklashda xatolik yuz berdi!";
      });
  },
});

export const { setSearchQuery, filterByCategory, increaseLimit, clearSearchHistory } = productSlice.actions;
export default productSlice.reducer;
