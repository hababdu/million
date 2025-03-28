import React, { useEffect, useState, useCallback } from "react";
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
  // Redux state
  const likedProducts = useSelector((state) => state.likes.likedProducts);
  const searchQuery = useSelector((state) => state.products.searchQuery);
  const products = useSelector((state) => state.products.products);
  const cartItems = useSelector((state) => state.cart.cartItems);

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
      setIsMobile(window.innerWidth < 768);
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
      // No touches means this is the final touch end
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
    <div className="flex flex-col min-h-screen bg-gray-900 text-white relative">
      {/* Header */}
      <header className="bg-gray-800 fixed top-0 left-0 w-full z-50 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col">
            {/* Top Row - Logo, Navigation, Icons */}
            <div className="flex justify-between items-center">
              {/* Logo */}
              <Link to="/" className="flex items-center" onClick={() => setSearchVisible(false)}>
                <img src={logo} alt="Logo" className="h-10 md:h-12" />
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-lg transition ${location.pathname === "/" ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-gray-700"}`}
                  onClick={() => setSearchVisible(false)}
                >
                  Home
                </Link>
                <Link
                  to="/browse"
                  className={`px-3 py-2 rounded-lg transition ${location.pathname === "/browse" ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-gray-700"}`}
                  onClick={() => setSearchVisible(false)}
                >
                  Browse
                </Link>
                <Link
                  to="/cart"
                  className={`px-3 py-2 rounded-lg transition relative ${location.pathname === "/cart" ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-gray-700"}`}
                  onClick={() => setSearchVisible(false)}
                >
                  Cart
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {cartItems.length}
                    </span>
                  )}
                </Link>
                <Link
                  to="/order"
                  className={`px-3 py-2 rounded-lg transition ${location.pathname === "/order" ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-gray-700"}`}
                  onClick={() => setSearchVisible(false)}
                >
                  Orders
                </Link>
                <Link
                  to="/profile"
                  className={`px-3 py-2 rounded-lg transition ${location.pathname === "/profile" ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-gray-700"}`}
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
                    <div className="absolute top-full left-0 w-full bg-gray-700 rounded-lg shadow-xl mt-1 max-h-96 overflow-y-auto scrollbar-custom">
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
                  className={`p-2 rounded-full relative ${location.pathname === "/likes" ? "bg-purple-600" : "hover:bg-gray-700"} bg-gray-600 transition`}
                  onClick={() => setSearchVisible(false)}
                >
                  <HeartIcon className="h-6 w-6 text-red-500" />
                  {likedProducts.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {likedProducts.length}
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
                <Link to="/likes" className="p-2 relative" onClick={() => setSearchVisible(false)}>
                  <HeartIcon className="h-6 w-6 text-red-500" />
                  {likedProducts.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                      {likedProducts.length}
                    </span>
                  )}
                </Link>
                <Link to="/cart" className="p-2 relative" onClick={() => setSearchVisible(false)}>
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
                  <div className="mt-2 bg-gray-700 rounded-lg p-3 max-h-64 overflow-y-auto scrollbar-custom">
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

      {/* Floating Cart Button (Desktop only) */}
      {!isMobile && (
        <div 
          className={`fixed z-40 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} no-select`}
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
              className={`p-4 rounded-full shadow-lg transition-all flex items-center justify-center ${
                cartItems.length > 0 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <ShoppingCartIcon className="h-6 w-6 text-white" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItems.length}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 flex justify-around py-3 z-40 md:hidden">
        <Link
          to="/"
          className={`flex flex-col items-center p-2 rounded-lg ${location.pathname === "/" ? "text-purple-400" : "text-gray-300"}`}
          onClick={() => setSearchVisible(false)}
        >
          <HomeIcon className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link
          to="/browse"
          className={`flex flex-col items-center p-2 rounded-lg ${location.pathname === "/browse" ? "text-purple-400" : "text-gray-300"}`}
          onClick={() => setSearchVisible(false)}
        >
          <ShoppingBagIcon className="h-6 w-6" />
          <span className="text-xs mt-1">Browse</span>
        </Link>
        <Link
          to="/cart"
          className={`flex flex-col items-center p-2 rounded-lg relative ${location.pathname === "/cart" ? "text-purple-400" : "text-gray-300"}`}
          onClick={() => setSearchVisible(false)}
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
          onClick={() => setSearchVisible(false)}
        >
          <ClockIcon className="h-6 w-6" />
          <span className="text-xs mt-1">Orders</span>
        </Link>
        <Link
          to="/profile"
          className={`flex flex-col items-center p-2 rounded-lg ${location.pathname === "/profile" ? "text-purple-400" : "text-gray-300"}`}
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