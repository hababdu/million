import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA9b09FVmIUqMTGv-oOyuJwT7ZmW7fQVjc",
  authDomain: "million-4955f.firebaseapp.com",
  projectId: "million-4955f",
  storageBucket: "million-4955f.appspot.com", // xato bor edi, to'g'rilandi
  messagingSenderId: "765622659702",
  appId: "1:765622659702:web:09c254db7ce85545be4d57",
  measurementId: "G-KBLVGNS9CZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // ❗ AUTH OBYEKTI YARATILDI
const googleProvider = new GoogleAuthProvider();

// ✅ TO‘G‘RI EKSPORT QILINGAN
export { auth, googleProvider };
export default app;
