import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // Toast xabarnomalari
import Layout from "./Layout/Layout";
import Home from "./pages/Home";
import Store from "./pages/Store";
import OrderHistory from "./pages/Order History";
import Browse from "./pages/Browse";
import Likes from "./pages/Likes";
import Cards from "./pages/cards";
import Profile from "./pages/Profile";
import Fulcontent from "./pages/Fulcontent";
import Register from "./pages/register"; // Register faylini qo'shdik
import Login from "./pages/Login"; // Login faylini ham qo'shdik

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} /> {/* Toast umumiy Router uchun */}
      <Routes>
        {/* Login va Register sahifalari Layout'ga bog‘liq emas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Asosiy sahifalar Layout ichida */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/store" element={<Store />} />
                <Route path="/order" element={<OrderHistory />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/cart" element={<Cards />} />
                <Route path="/likes" element={<Likes />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/full" element={<Fulcontent />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
