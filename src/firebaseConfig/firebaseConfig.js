import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Firestore qo'shildi

const firebaseConfig = {
  apiKey: "AIzaSyA9b09FVmIUqMTGv-oOyuJwT7ZmW7fQVjc",
  authDomain: "million-4955f.firebaseapp.com",
  projectId: "million-4955f",
  storageBucket: "million-4955f.firebasestorage.app",
  messagingSenderId: "765622659702",
  appId: "1:765622659702:web:09c254db7ce85545be4d57",
  measurementId: "G-KBLVGNS9CZ"
};

// Firebase ilovasini ishga tushirish
const app = initializeApp(firebaseConfig);

// Autentifikatsiya xizmatlari
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Firestore (ma'lumotlar bazasi) xizmati
const db = getFirestore(app);

// Barcha kerakli xizmatlarni eksport qilish
export { auth, googleProvider, db }; // db qo'shildi
export default app;