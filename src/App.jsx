import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // Import Toaster
import Layout from "./Layout/Layout";
import Home from "./pages/Home";
import Store from "./pages/Store";
import OrderHistory from "./pages/Order History"; // Ensure there are no spaces in file names
import Browse from "./pages/Browse";
import Likes from "./pages/Likes";
import Cards from "./pages/cards"; // Ensure correct casing in file names
import Profile from "./pages/Profile";
import Fulcontent from "./pages/Fulcontent";
import Register from "./pages/register";

function App() {
  return (
    <Router>
      <Toaster /> {/* Add Toaster here to enable toast notifications */}
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
          <Route path="/register" element={<Register />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
