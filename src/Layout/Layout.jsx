import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSearchQuery } from "../redux/productSlice";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  HomeIcon,
  ShoppingBagIcon,
  ClockIcon,
  ShoppingCartIcon,
  UserIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import logo from "../assets/logo.svg";

function Layout({ children }) {
  const likedProducts = useSelector((state) => state.likes.likedProducts);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const searchQuery = useSelector((state) => state.products.searchQuery);
  const products = useSelector((state) => state.products.products);
  const [searchVisible, setSearchVisible] = useState(false);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const [categories, setCategories] = useState([]);

  const filteredProducts = products.filter((product) =>
    (product.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (product.category?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const handleNavi = (product) => {
    navigate("/full", { state: { product } });
    setSearchVisible(false);
    dispatch(setSearchQuery(""));
  };

  const clearSearch = () => {
    dispatch(setSearchQuery(''));
  };

  const handleCategoryClick = (category) => {
    if (location.pathname !== "/") {
      navigate("/", { state: { category } });
    } else {
      const element = document.getElementById(category);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  useEffect(() => {
    const uniqueCategories = [...new Set(products.map(product => product.category))];
    setCategories(uniqueCategories);
  }, [products]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 fixed top-0 left-0 w-full z-50 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col">
            {/* Top Row - Logo, Navigation, Icons */}
            <div className="flex justify-between items-center">
              {/* Logo */}
              <Link to="/" className="flex items-center">
                <img src={logo} alt="Logo" className="h-10 md:h-12" />
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-lg transition ${location.pathname === "/" ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-gray-700"}`}
                >
                  Home
                </Link>
                <Link
                  to="/browse"
                  className={`px-3 py-2 rounded-lg transition ${location.pathname === "/browse" ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-gray-700"}`}
                >
                  Browse
                </Link>
                <Link
                  to="/cart"
                  className={`px-3 py-2 rounded-lg transition relative ${location.pathname === "/cart" ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-gray-700"}`}
                >
                  Store
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {cartItems.length}
                    </span>
                  )}
                </Link>
                <Link
                  to="/order"
                  className={`px-3 py-2 rounded-lg transition ${location.pathname === "/order" ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-gray-700"}`}
                >
                  Orders
                </Link>
                <Link
                  to="/profile"
                  className={`px-3 py-2 rounded-lg transition ${location.pathname === "/profile" ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-gray-700"}`}
                >
                  Profile
                </Link>
              </nav>

              {/* Desktop Search and Icons */}
              <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
                <div className="relative">
                  <div className="flex items-center">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="bg-gray-700 text-white px-4 py-2 rounded-full w-40 lg:w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={searchQuery}
                      onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                    />
                    {searchQuery && (
                      <XMarkIcon
                        className="h-5 w-5 ml-2 text-gray-400 cursor-pointer hover:text-white"
                        onClick={clearSearch}
                      />
                    )}
                  </div>

                  {searchQuery && filteredProducts.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-gray-700 rounded-lg shadow-xl mt-1 max-h-96 overflow-y-auto">
                      <div className="p-3">
                        {categories.map((category) => {
                          const categoryProducts = filteredProducts.filter(
                            (product) => product.category === category
                          );
                          if (categoryProducts.length === 0) return null;
                          
                          return (
                            <div key={category} className="mb-4 last:mb-0">
                              <h4 className="text-purple-400 font-semibold mb-2 px-2">{category}</h4>
                              <div className="space-y-2">
                                {categoryProducts.map((product) => (
                                  <div
                                    key={product.id}
                                    onClick={() => handleNavi(product)}
                                    className="flex items-center p-2 hover:bg-gray-600 rounded-lg cursor-pointer transition"
                                  >
                                    <img
                                      src={product.thumbnail}
                                      alt={product.title}
                                      className="w-10 h-10 object-cover rounded-md"
                                    />
                                    <div className="ml-3">
                                      <p className="text-white font-medium">{product.title}</p>
                                      <p className="text-sm text-gray-300">
                                        ${(product.price * (1 - product.discountPercentage / 100)).toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to="/likes"
                  className={`p-2 rounded-full ${location.pathname === "/likes" ? "bg-purple-600" : "hover:bg-gray-700"} bg-gray-600 transition relative`}
                >
                  <HeartIcon className="h-6 w-6 text-red-500" />
                  {likedProducts.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {likedProducts.length}
                    </span>
                  )}
                </Link>

                <Link
                  to="/cart"
                  className={`p-2 rounded-full relative bg-gray-600 ${location.pathname === "/cart" ? "bg-purple-600" : "hover:bg-gray-700"} transition`}
                >
                  <ShoppingCartIcon className="h-6 w-6 text-white" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {cartItems.length}
                    </span>
                  )}
                </Link>
              </div>

              {/* Mobile Icons */}
              <div className="flex items-center space-x-4 md:hidden">
                <button
                  onClick={() => setSearchVisible(!searchVisible)}
                  className="p-2"
                >
                  <MagnifyingGlassIcon className="h-6 w-6 text-white" />
                </button>
                <Link to="/likes" className="p-2 relative">
                  <HeartIcon className="h-6 w-6 text-red-500" />
                  {likedProducts.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                      {likedProducts.length}
                    </span>
                  )}
                </Link>
                <Link to="/cart" className="p-2 relative">
                  <ShoppingCartIcon className="h-6 w-6 text-white" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                      {cartItems.length}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Mobile Search */}
            {searchVisible && (
              <div className="mt-3 md:hidden">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={searchQuery}
                    onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                  />
                  <XMarkIcon
                    className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-white"
                    onClick={() => setSearchVisible(false)}
                  />
                </div>

                {searchQuery && filteredProducts.length > 0 && (
                  <div className="mt-2 bg-gray-700 rounded-lg p-3 max-h-64 overflow-y-auto">
                    {categories.map((category) => {
                      const categoryProducts = filteredProducts.filter(
                        (product) => product.category === category
                      );
                      if (categoryProducts.length === 0) return null;
                      
                      return (
                        <div key={category} className="mb-4 last:mb-0">
                          <h4 className="text-purple-400 font-semibold mb-2 px-2">{category}</h4>
                          <div className="space-y-2">
                            {categoryProducts.map((product) => (
                              <div
                                key={product.id}
                                onClick={() => handleNavi(product)}
                                className="flex items-center p-2 hover:bg-gray-600 rounded-lg cursor-pointer transition"
                              >
                                <img
                                  src={product.thumbnail}
                                  alt={product.title}
                                  className="w-10 h-10 object-cover rounded-md"
                                />
                                <div className="ml-3">
                                  <p className="text-white font-medium">{product.title}</p>
                                  <p className="text-sm text-gray-300">
                                    ${(product.price * (1 - product.discountPercentage / 100)).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Categories */}
            <div className="mt-3 overflow-x-auto whitespace-nowrap scrollbar-hide">
              <div className="inline-flex space-x-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className="px-4 py-1.5 bg-gray-700 text-white text-sm rounded-full hover:bg-purple-600 transition"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-32 pb-16 md:pb-0 px-4 container mx-auto">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 flex justify-around py-3 z-40 md:hidden">
        <Link
          to="/"
          className={`flex flex-col items-center p-2 rounded-lg ${location.pathname === "/" ? "text-purple-400" : "text-gray-300"}`}
        >
          <HomeIcon className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link
          to="/browse"
          className={`flex flex-col items-center p-2 rounded-lg ${location.pathname === "/browse" ? "text-purple-400" : "text-gray-300"}`}
        >
          <ShoppingBagIcon className="h-6 w-6" />
          <span className="text-xs mt-1">Browse</span>
        </Link>
        <Link
          to="/cart"
          className={`flex flex-col items-center p-2 rounded-lg relative ${location.pathname === "/cart" ? "text-purple-400" : "text-gray-300"}`}
        >
          <ShoppingCartIcon className="h-6 w-6" />
          {cartItems.length > 0 && (
            <span className="absolute -top-1 right-2 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
              {cartItems.length}
            </span>
          )}
          <span className="text-xs mt-1">Cart</span>
        </Link>
        <Link
          to="/order"
          className={`flex flex-col items-center p-2 rounded-lg ${location.pathname === "/order" ? "text-purple-400" : "text-gray-300"}`}
        >
          <ClockIcon className="h-6 w-6" />
          <span className="text-xs mt-1">Orders</span>
        </Link>
        <Link
          to="/profile"
          className={`flex flex-col items-center p-2 rounded-lg ${location.pathname === "/profile" ? "text-purple-400" : "text-gray-300"}`}
        >
          <UserIcon className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  );
}

export default Layout;