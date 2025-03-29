import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSearchQuery } from "../redux/productSlice";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toggleDarkMode } from "../redux/themeSlice";
import '../index.css';
import {
  HomeIcon,
  ShoppingBagIcon,
  ClockIcon,
  ShoppingCartIcon,
  UserIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/solid";
import logo from "../assets/logo.svg";

function Layout({ children }) {
  // Redux state
  const likedProducts = useSelector((state) => state.likes.likedProducts);
  const searchQuery = useSelector((state) => state.products.searchQuery);
  const products = useSelector((state) => state.products.products);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const darkMode = useSelector((state) => state.theme.darkMode);

  // Router hooks
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Component state
  const [searchVisible, setSearchVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ 
    x: typeof window !== 'undefined' ? window.innerWidth - 100 : 0, 
    y: 100 
  });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [clickStartTime, setClickStartTime] = useState(0);
  const [clickStartPosition, setClickStartPosition] = useState({ x: 0, y: 0 });

  // Filter products based on search query
  const filteredProducts = products.filter((product) =>
    (product.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (product.category?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  // Check if mobile view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setPosition({
          x: window.innerWidth - 80,
          y: window.innerHeight - 180
        });
      } else {
        setPosition({
          x: window.innerWidth - 100,
          y: 100
        });
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get unique categories
  useEffect(() => {
    const uniqueCategories = [...new Set(products.map(product => product.category))];
    setCategories(uniqueCategories);
  }, [products]);

  // Handle navigation to product page
  const handleNavi = useCallback((product) => {
    navigate("/full", { state: { product } });
    setSearchVisible(false);
    dispatch(setSearchQuery(""));
  }, [navigate, dispatch]);

  // Clear search query
  const clearSearch = useCallback(() => {
    dispatch(setSearchQuery(''));
    setSearchVisible(false);
  }, [dispatch]);

  // Handle category click
  const handleCategoryClick = useCallback((category) => {
    if (location.pathname !== "/") {
      navigate("/", { state: { category } });
    } else {
      const element = document.getElementById(category);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    setSearchVisible(false);
  }, [navigate, location.pathname]);

  // Theme toggle handler
  const toggleTheme = useCallback(() => {
    dispatch(toggleDarkMode());
  }, [dispatch]);

  // Draggable cart functions
  const handleDragStart = useCallback((clientX, clientY) => {
    setIsDragging(true);
    setClickStartTime(Date.now());
    setClickStartPosition({ x: clientX, y: clientY });
    setDragOffset({
      x: clientX - position.x,
      y: clientY - position.y
    });
  }, [position.x, position.y]);

  const handleMouseDown = useCallback((e) => {
    handleDragStart(e.clientX, e.clientY);
    e.preventDefault();
  }, [handleDragStart]);

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  }, [handleDragStart]);

  const handleMove = useCallback((clientX, clientY) => {
    if (!isDragging) return;
    
    const newX = clientX - dragOffset.x;
    const newY = clientY - dragOffset.y;
    
    // Keep within viewport bounds
    const boundedX = Math.max(10, Math.min(newX, window.innerWidth - 60));
    const boundedY = Math.max(10, Math.min(newY, window.innerHeight - 60));
    
    setPosition({ x: boundedX, y: boundedY });
  }, [isDragging, dragOffset.x, dragOffset.y]);

  const handleMouseMove = useCallback((e) => handleMove(e.clientX, e.clientY), [handleMove]);
  const handleTouchMove = useCallback((e) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  }, [handleMove]);

  const handleDragEnd = useCallback((clientX, clientY) => {
    if (!isDragging) return;
    
    const dragTime = Date.now() - clickStartTime;
    const dragDistance = Math.sqrt(
      Math.pow(clientX - clickStartPosition.x, 2) +
      Math.pow(clientY - clickStartPosition.y, 2)
    );
    
    // Consider it a click if drag was short in both time and distance
    if (dragTime < 300 && dragDistance < 10) {
      navigate('/cart');
    }
    
    setIsDragging(false);
  }, [isDragging, clickStartTime, clickStartPosition.x, clickStartPosition.y, navigate]);

  const handleMouseUp = useCallback((e) => {
    handleDragEnd(e.clientX, e.clientY);
  }, [handleDragEnd]);

  const handleTouchEnd = useCallback((e) => {
    if (e.touches.length === 0) {
      handleDragEnd(clickStartPosition.x, clickStartPosition.y);
    }
  }, [handleDragEnd, clickStartPosition.x, clickStartPosition.y]);

  // Event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} relative transition-colors duration-300`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white border-b border-gray-200'} fixed top-0 left-0 w-full z-40 shadow-lg transition-colors duration-300`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col">
            {/* Top Row - Logo, Navigation, Icons */}
            <div className="flex justify-between items-center">
              {/* Logo */}
              <Link to="/" className="flex items-center" onClick={() => setSearchVisible(false)}>
                <img src={logo } alt="Logo" className="h-10 md:h-12" />
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-lg transition ${location.pathname === "/" 
                    ? (darkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800') 
                    : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                  onClick={() => setSearchVisible(false)}
                >
                  Home
                </Link>
                <Link
                  to="/browse"
                  className={`px-3 py-2 rounded-lg transition ${location.pathname === "/browse" 
                    ? (darkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800') 
                    : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                  onClick={() => setSearchVisible(false)}
                >
                  Browse
                </Link>
                <Link
                  to="/cart"
                  className={`px-3 py-2 rounded-lg transition relative ${location.pathname === "/cart" 
                    ? (darkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800') 
                    : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                  onClick={() => setSearchVisible(false)}
                >
                  Cart
                  {cartItems.length > 0 && (
                    <span className={`absolute -top-1 -right-1 ${darkMode ? 'bg-red-500' : 'bg-red-400'} text-white text-xs w-5 h-5 flex items-center justify-center rounded-full`}>
                      {cartItems.length}
                    </span>
                  )}
                </Link>
                <Link
                  to="/order"
                  className={`px-3 py-2 rounded-lg transition ${location.pathname === "/order" 
                    ? (darkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800') 
                    : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                  onClick={() => setSearchVisible(false)}
                >
                  Orders
                </Link>
                <Link
                  to="/profile"
                  className={`px-3 py-2 rounded-lg transition ${location.pathname === "/profile" 
                    ? (darkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800') 
                    : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`}
                  onClick={() => setSearchVisible(false)}
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
                      className={`${darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-900 placeholder-gray-500'} px-4 py-2 rounded-full w-40 lg:w-64 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      value={searchQuery}
                      onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                    />
                    {searchQuery && (
                      <XMarkIcon
                        className={`h-5 w-5 ml-2 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} cursor-pointer`}
                        onClick={clearSearch}
                      />
                    )}
                  </div>

                  {searchQuery && filteredProducts.length > 0 && (
                    <div className={`absolute top-full left-0 w-full ${darkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'} rounded-lg shadow-xl mt-1 max-h-96 overflow-y-auto scrollbar-custom z-50`}>
                      <div className="p-3">
                        {categories.map((category) => {
                          const categoryProducts = filteredProducts.filter(
                            (product) => product.category === category
                          );
                          if (categoryProducts.length === 0) return null;
                          
                          return (
                            <div key={category} className="mb-4 last:mb-0">
                              <h4 className={`${darkMode ? 'text-purple-400' : 'text-purple-600'} font-semibold mb-2 px-2`}>{category}</h4>
                              <div className="space-y-2">
                                {categoryProducts.map((product) => (
                                  <div
                                    key={product.id}
                                    onClick={() => handleNavi(product)}
                                    className={`flex items-center p-2 rounded-lg cursor-pointer transition ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                                  >
                                    <img
                                      src={product.thumbnail}
                                      alt={product.title}
                                      className="w-10 h-10 object-cover rounded-md"
                                    />
                                    <div className="ml-3">
                                      <p className={`${darkMode ? 'text-white' : 'text-gray-900'} font-medium`}>{product.title}</p>
                                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
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
                  className={`p-2 rounded-full relative ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition`}
                  onClick={() => setSearchVisible(false)}
                >
                  <HeartIcon className="h-6 w-6 text-red-500" />
                  {likedProducts.length > 0 && (
                    <span className={`absolute -top-1 -right-1 ${darkMode ? 'bg-red-500' : 'bg-red-400'} text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center`}>
                      {likedProducts.length}
                    </span>
                  )}
                </Link>
                 {/* Theme Toggle */}
                 <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition`}
                  aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {darkMode ? (
                    <SunIcon className="h-5 w-5 text-yellow-300" />
                  ) : (
                    <MoonIcon className="h-5 w-5 text-gray-700" />
                  )}
                </button>
              </div>

              {/* Mobile Icons */}
              <div className="flex items-center space-x-4 md:hidden">
                <button
                  onClick={toggleTheme}
                  className="p-2"
                  aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {darkMode ? (
                    <SunIcon className="h-6 w-6 text-yellow-300" />
                  ) : (
                    <MoonIcon className="h-6 w-6 text-gray-700" />
                  )}
                </button>

                <button
                  onClick={() => setSearchVisible(!searchVisible)}
                  className="p-2"
                >
                  <MagnifyingGlassIcon className={`h-6 w-6 ${darkMode ? 'text-white' : 'text-gray-700'}`} />
                </button>
                <Link to="/likes" className="p-2 relative" onClick={() => setSearchVisible(false)}>
                  <HeartIcon className="h-6 w-6 text-red-500" />
                  {likedProducts.length > 0 && (
                    <span className={`absolute -top-1 -right-1 ${darkMode ? 'bg-red-500' : 'bg-red-400'} text-white text-xs w-4 h-4 flex items-center justify-center rounded-full`}>
                      {likedProducts.length}
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
                    className={`w-full ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-900 placeholder-gray-500'} px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    value={searchQuery}
                    onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                  />
                  <XMarkIcon
                    className={`h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} cursor-pointer`}
                    onClick={() => setSearchVisible(false)}
                  />
                </div>

                {searchQuery && filteredProducts.length > 0 && (
                  <div className={`mt-2 ${darkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'} rounded-lg p-3 max-h-64 overflow-y-auto scrollbar-custom`}>
                    {categories.map((category) => {
                      const categoryProducts = filteredProducts.filter(
                        (product) => product.category === category
                      );
                      if (categoryProducts.length === 0) return null;
                      
                      return (
                        <div key={category} className="mb-4 last:mb-0">
                          <h4 className={`${darkMode ? 'text-purple-400' : 'text-purple-600'} font-semibold mb-2 px-2`}>{category}</h4>
                          <div className="space-y-2">
                            {categoryProducts.map((product) => (
                              <div
                                key={product.id}
                                onClick={() => handleNavi(product)}
                                className={`flex items-center p-2 rounded-lg cursor-pointer transition ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                              >
                                <img
                                  src={product.thumbnail}
                                  alt={product.title}
                                  className="w-10 h-10 object-cover rounded-md"
                                />
                                <div className="ml-3">
                                  <p className={`${darkMode ? 'text-white' : 'text-gray-900'} font-medium`}>{product.title}</p>
                                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-grow pt-15 pb-16 md:pb-0 px-4 container mx-auto ${darkMode ? 'bg-gray-900' : 'bg-white'} transition-colors duration-300`}>
        {children}
      </main>

      {/* Floating Cart Button */}
      <div 
        className={`fixed z-50 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} no-select`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transition: isDragging ? 'none' : 'left 0.2s, top 0.2s',
          touchAction: 'none',
          zIndex: 40
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="relative">
          <div 
            className={`p-4 rounded-full z-50 flex items-center justify-center 
              transition-all duration-500 shadow-lg hover:shadow-xl
              ${cartItems.length > 0 
                ? 'bg-gradient-to-br animate-gradient-x from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600' 
                : darkMode 
                  ? 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 hover:from-gray-700 hover:via-gray-800 hover:to-gray-900'
                  : 'bg-gradient-to-br from-gray-300 via-gray-200 to-gray-100 hover:from-gray-200 hover:via-gray-100 hover:to-gray-50'
              }`}
          >
            <ShoppingCartIcon className={`h-6 w-6 ${darkMode || cartItems.length > 0 ? 'text-white' : 'text-gray-700'}`} />
            {cartItems.length > 0 && (
              <span className={`absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-lg ${darkMode ? 'ring-2 ring-gray-800' : 'ring-2 ring-white'}`}>
                {cartItems.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t flex justify-around z-30 md:hidden transition-colors duration-300`}>
        <Link
          to="/"
          className={`flex flex-col items-center p-2 rounded-lg ${location.pathname === "/" 
            ? (darkMode ? 'text-purple-400' : 'text-purple-600') 
            : (darkMode ? 'text-gray-300' : 'text-gray-700')}`}
          onClick={() => setSearchVisible(false)}
        >
          <HomeIcon className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link
          to="/browse"
          className={`flex flex-col items-center p-2 rounded-lg ${location.pathname === "/browse" 
            ? (darkMode ? 'text-purple-400' : 'text-purple-600') 
            : (darkMode ? 'text-gray-300' : 'text-gray-700')}`}
          onClick={() => setSearchVisible(false)}
        >
          <ShoppingBagIcon className="h-6 w-6" />
          <span className="text-xs mt-1">Browse</span>
        </Link>
        <Link
          to="/order"
          className={`flex flex-col items-center p-2 rounded-lg ${location.pathname === "/order" 
            ? (darkMode ? 'text-purple-400' : 'text-purple-600') 
            : (darkMode ? 'text-gray-300' : 'text-gray-700')}`}
          onClick={() => setSearchVisible(false)}
        >
          <ClockIcon className="h-6 w-6" />
          <span className="text-xs mt-1">Orders</span>
        </Link>
        <Link
          to="/profile"
          className={`flex flex-col items-center p-2 rounded-lg ${location.pathname === "/profile" 
            ? (darkMode ? 'text-purple-400' : 'text-purple-600') 
            : (darkMode ? 'text-gray-300' : 'text-gray-700')}`}
          onClick={() => setSearchVisible(false)}
        >
          <UserIcon className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  );
}

export default Layout;