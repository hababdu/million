import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../redux/productSlice";
import { addViewedProduct } from '../redux/productSliceHistory';
import { toggleLike } from "../redux/likeSlice";
import { addToCart } from "../redux/cartSlice";
import { 
  FaHeart, 
  FaShoppingCart, 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaTimes,
  FaChevronRight,
  FaChevronLeft,
  FaStar
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Mlogo from '../assets/mlogo.svg';

const SORT_OPTIONS = [
  { value: "default", label: "Standart tartib" },
  { value: "price-asc", label: "Arzon ➝ Qimmat" },
  { value: "price-desc", label: "Qimmat ➝ Arzon" },
  { value: "rating", label: "Reyting bo'yicha" },
  { value: "discount", label: "Chegirma foizi" },
];

const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const ProductCard = React.memo(({ 
  product, 
  isInCart, 
  isLiked, 
  onProductClick, 
  onAddToCart, 
  onLikeToggle,
  darkMode 
}) => {
  const discountedPrice = (product.price * (1 - product.discountPercentage / 100)).toFixed(2);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className={`group relative rounded-xl shadow-lg overflow-hidden flex flex-col h-full ${
        darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
      } border ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      } transition-all duration-300 cursor-pointer`}
      onClick={() => onProductClick(product)}
    >
      {/* Image container with fixed aspect ratio */}
      <div className="relative pt-[75%] overflow-hidden"> {/* 4:3 aspect ratio */}
        <img
          src={product.thumbnail}
          alt={product.title}
          className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {product.discountPercentage > 0 && (
          <motion.span 
            className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            -{Math.round(product.discountPercentage)}%
          </motion.span>
        )}
        
        <div className="absolute top-2 right-2 flex flex-col space-y-2">
          <motion.button
            onClick={(e) => onLikeToggle(e, product.id)}
            className={`p-2 rounded-full backdrop-blur-sm ${
              darkMode ? 'bg-gray-900/30' : 'bg-white/70'
            } shadow-md`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaHeart className={isLiked ? "text-red-500" : darkMode ? "text-gray-300" : "text-gray-600"} />
          </motion.button>
          
          <motion.button
            onClick={(e) => onAddToCart(e, product)}
            className={`p-2 rounded-full backdrop-blur-sm ${
              isInCart 
                ? "bg-green-500/80" 
                : darkMode 
                  ? "bg-gray-900/30" 
                  : "bg-white/70"
            } shadow-md`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaShoppingCart className={isInCart ? "text-white" : darkMode ? "text-gray-300" : "text-gray-600"} />
          </motion.button>
        </div>
      </div>
      
      {/* Content section with consistent height */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className={`text-md font-semibold line-clamp-2 mb-2 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {product.title}
        </h3>
        
        <div className="flex items-center mb-3">
          {product.discountPercentage > 0 && (
            <p className={`${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            } line-through text-sm mr-2`}>
              ${product.price}
            </p>
          )}
          <p className={`${
            darkMode ? 'text-green-400' : 'text-green-600'
          } font-bold text-md`}>
            ${discountedPrice}
          </p>
        </div>
        
        <div className="flex justify-between items-center mt-auto">
          <div className="flex items-center">
            <div className={`rounded-full p-1 ${
              darkMode ? 'bg-gray-700' : 'bg-gray-100'
            } mr-2`}>
              <img src={Mlogo} className="w-4 h-4" alt="brand" />
            </div>
            <div className="flex items-center">
              <FaStar className="text-yellow-400 mr-1 text-sm" />
              <span className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {product.rating.toFixed(1)}
              </span>
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
          }`}>
            {product.stock} dona
          </span>
        </div>
      </div>
    </motion.div>
  );
});

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { products, loading, error } = useSelector((state) => state.products);
  const { likedProducts } = useSelector((state) => state.likes);
  const { cartItems } = useSelector((state) => state.cart);
  const darkMode = useSelector((state) => state.theme.darkMode);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortOption, setSortOption] = useState("default");
  const [activeTab, setActiveTab] = useState("all");
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Scroll functions for categories
  const scrollContainerRef = React.useRef(null);
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const allCategories = useMemo(() => {
    return shuffleArray([...new Set(products.map(p => p.category))]);
  }, [products]);

  const processedProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortOption) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "discount":
        result.sort((a, b) => b.discountPercentage - a.discountPercentage);
        break;
      default:
        break;
    }

    const grouped = {};
    result.forEach(product => {
      if (!grouped[product.category]) {
        grouped[product.category] = [];
      }
      grouped[product.category].push(product);
    });

    return grouped;
  }, [products, searchQuery, selectedCategories, priceRange, sortOption]);

  const handleProductClick = useCallback((product) => {
    dispatch(addViewedProduct(product));
    navigate("/full", { state: { product } });
  }, [dispatch, navigate]);

  const handleAddToCart = useCallback((e, product) => {
    e.stopPropagation();
    dispatch(addToCart({
      id: product.id,
      title: product.title,
      price: product.price * (1 - product.discountPercentage / 100),
      thumbnail: product.thumbnail,
      quantity: 1
    }));
    toast.success(`${product.title} savatchaga qo'shildi`, {
      position: 'top-right',
      style: {
        background: darkMode ? '#1F2937' : '#fff',
        color: darkMode ? '#fff' : '#000',
      }
    });
  }, [dispatch, darkMode]);

  const handleLikeToggle = useCallback((e, productId) => {
    e.stopPropagation();
    dispatch(toggleLike(productId));
    if (!likedProducts.includes(productId)) {
      toast.success('Sevimlilarga qo\'shildi', {
        position: 'top-right',
        style: {
          background: darkMode ? '#1F2937' : '#fff',
          color: darkMode ? '#fff' : '#000',
        }
      });
    }
  }, [dispatch, likedProducts, darkMode]);

  const toggleCategory = useCallback((category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setPriceRange([0, 2000]);
    setSelectedCategories([]);
    setSortOption("default");
    setActiveTab("all");
    toast.success('Barcha filtrlarni tozalandi', {
      position: 'top-right',
      style: {
        background: darkMode ? '#1F2937' : '#fff',
        color: darkMode ? '#fff' : '#000',
      }
    });
  }, [darkMode]);

  if (loading) {
    return (
      <div className={`min-h-screen py-12 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className={`rounded-xl shadow-md overflow-hidden ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className={`h-48 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
                <div className="p-4">
                  <div className={`h-4 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} mb-2 animate-pulse w-3/4`}></div>
                  <div className={`h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} mb-3 animate-pulse w-1/2`}></div>
                  <div className="flex justify-between">
                    <div className={`h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse w-1/4`}></div>
                    <div className={`h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse w-1/4`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`p-6 rounded-lg shadow-lg text-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Xatolik yuz berdi</h2>
          <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>
          <button
            onClick={() => dispatch(fetchProducts())}
            className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-purple-600 hover:bg-purple-500' : 'bg-purple-600 hover:bg-purple-700'} text-white`}
          >
            Qayta urinish
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen mx-auto px-4 py-8 max-w-7xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
    >
      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <motion.h1 
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}
        >
          {searchQuery ? `"${searchQuery}" bo'yicha qidiruv` : 'Barcha mahsulotlar'}
        </motion.h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <input
              type="text"
              placeholder="Mahsulot qidirish..."
              className={`w-full pl-10 pr-4 py-2.5 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${darkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'} shadow-sm`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <FaTimes />
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} rounded-lg transition shadow-sm`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaFilter className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
              <span className={`hidden sm:inline ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Filtrlar</span>
            </motion.button>
            
            <div className="relative sort-menu-container">
              <motion.button
                className={`flex items-center gap-2 px-4 py-2.5 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} rounded-lg transition shadow-sm`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSortMenu(!showSortMenu)}
              >
                <FaSort className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                <span className={`hidden sm:inline ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {SORT_OPTIONS.find(opt => opt.value === sortOption)?.label || 'Tartiblash'}
                </span>
              </motion.button>
              
              <AnimatePresence>
                {showSortMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute right-0 mt-1 w-56 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl z-10 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    {SORT_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortOption(option.value);
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'} ${sortOption === option.value ? (darkMode ? 'bg-gray-700 text-purple-400' : 'bg-gray-100 text-purple-600') : (darkMode ? 'text-white' : 'text-gray-900')} flex items-center justify-between`}
                      >
                        {option.label}
                        {sortOption === option.value && (
                          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg mb-8 overflow-hidden shadow-md`}
          >
            <div className="p-5">
              <div className="flex justify-between items-center mb-5">
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Filtrlar</h3>
                <div className="flex gap-3">
                  <button 
                    onClick={resetFilters}
                    className={`text-sm px-3 py-1 rounded-md ${darkMode ? 'text-purple-400 hover:bg-gray-700' : 'text-purple-600 hover:bg-gray-100'}`}
                  >
                    Tozalash
                  </button>
                  <button 
                    onClick={() => setShowFilters(false)}
                    className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>
                    Narx oraligi: <span className="font-bold">${priceRange[0]} - ${priceRange[1]}</span>
                  </label>
                  <div className="px-2">
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      step="10"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full mb-2 accent-purple-600"
                    />
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      step="10"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full accent-purple-600"
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>$0</span>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>$2000</span>
                  </div>
                </div>
                
                <div>
                  <h4 className={`font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Kategoriyalar</h4>
                  <div className="flex flex-wrap gap-2">
                    {allCategories.map(category => (
                      <motion.button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`px-3 py-1.5 rounded-full text-sm ${selectedCategories.includes(category) ? 'bg-purple-600 text-white' : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')} shadow-sm`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {category}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories Scroll */}
      <div className="relative mb-8">
        <div className="absolute left-0 top-0 bottom-0 flex items-center z-10">
          <button
            onClick={scrollLeft}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'} shadow-md`}
          >
            <FaChevronLeft />
          </button>
        </div>
        
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-hide gap-2 px-8 py-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
          
          <motion.button
            onClick={() => setActiveTab("all")}
            className={`px-5 py-2 font-medium whitespace-nowrap rounded-full ${activeTab === "all" ? (darkMode ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white') : (darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100')} shadow-sm flex-shrink-0`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Barchasi
          </motion.button>
          
          {allCategories.map(category => (
            <motion.button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`px-5 py-2 font-medium whitespace-nowrap rounded-full ${activeTab === category ? (darkMode ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white') : (darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100')} shadow-sm flex-shrink-0`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
          ))}
        </div>
        
        <div className="absolute right-0 top-0 bottom-0 flex items-center z-10">
          <button
            onClick={scrollRight}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'} shadow-md`}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* Products Display */}
      {Object.keys(processedProducts).length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className={`inline-block p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Hech qanday mahsulot topilmadi</h3>
            <p className={`mb-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Siz qidirgan mahsulotlar mavjud emas yoki filtr shartlariga mos kelmadi
            </p>
            <button 
              onClick={resetFilters}
              className={`px-5 py-2.5 rounded-lg ${darkMode ? 'bg-purple-600 hover:bg-purple-500' : 'bg-purple-600 hover:bg-purple-700'} text-white font-medium`}
            >
              Filtrlarni tozalash
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-12">
          {(activeTab === "all" ? Object.keys(processedProducts) : [activeTab]).map(category => (
            <motion.section 
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="category-section"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold capitalize ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {category}
                </h2>
                <button
                  onClick={() => navigate('/browse', { state: { category } })}
                  className={`flex items-center text-sm ${
                    darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
                  } font-medium`}
                >
                  Barchasini ko'rish <FaChevronRight className="ml-1" />
                </button>
              </div>
              
              {/* Horizontally scrollable product cards */}
              <div className="relative">
                <button 
                  onClick={() => document.getElementById(`product-scroll-${category}`).scrollBy({ left: -300, behavior: 'smooth' })}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full ${
                    darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'
                  } shadow-md`}
                >
                  <FaChevronLeft className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                </button>
                
                <div 
                  id={`product-scroll-${category}`}
                  className="flex overflow-x-auto scrollbar-hide space-x-6 pb-4 -mx-4 px-4"
                  style={{ scrollSnapType: 'x mandatory' }}
                >
                  {processedProducts[category].slice(0, 10).map(product => (
                    <div 
                      key={product.id} 
                      className="flex-shrink-0 w-64"
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      <ProductCard 
                        product={product}
                        isInCart={cartItems.some(item => item.id === product.id)}
                        isLiked={likedProducts.includes(product.id)}
                        onProductClick={handleProductClick}
                        onAddToCart={handleAddToCart}
                        onLikeToggle={handleLikeToggle}
                        darkMode={darkMode}
                      />
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => document.getElementById(`product-scroll-${category}`).scrollBy({ left: 300, behavior: 'smooth' })}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full ${
                    darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'
                  } shadow-md`}
                >
                  <FaChevronRight className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                </button>
              </div>
            </motion.section>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default Home;