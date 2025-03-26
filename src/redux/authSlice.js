import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { auth, googleProvider } from "../firebaseConfig/firebaseConfig";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from "firebase/auth";

// 🔹 Ro‘yxatdan o‘tish funksiyasi
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 🔹 Email va parol bilan kirish funksiyasi
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 🔹 Google bilan kirish funksiyasi
export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (_, { rejectWithValue }) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 🔹 Chiqish funksiyasi
export const logout = createAsyncThunk(
  "auth/logout",
  async () => {
    await signOut(auth);
    return null;
  }
);

// 🔹 Redux Toolkit Slice
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ✅ Ro‘yxatdan o‘tish
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Email va parol bilan kirish
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Google bilan kirish
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Chiqish
     
  },
});

export default authSlice.reducer;
