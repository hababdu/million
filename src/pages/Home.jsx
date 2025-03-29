import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchProducts } from "../redux/productSlice";
import { addViewedProduct } from '../redux/productSliceHistory';
import { toggleLike } from "../redux/likeSlice";
import { addToCart } from "../redux/cartSlice";
import { FaHeart, FaShoppingCart, FaSearch, FaFilter, FaSort, FaTimes } from "react-icons/fa";
import { toast } from "react-hot-toast";
import Mlogo from '../assets/mlogo.svg';
import { motion, AnimatePresence } from "framer-motion";

const SORT_OPTIONS = [
  { value: "default", label: "Standart tartib" },
  { value: "price-asc", label: "Arzon ➝ Qimmat" },
  { value: "price-desc", label: "Qimmat ➝ Arzon" },
  { value: "rating", label: "Reyting bo'yicha" },
  { value: "discount", label: "Chegirma foizi" },
];

const SkeletonLoader = () => (
  <motion.div 
    initial={{ opacity: 0.5 }}
    animate={{ opacity: 1 }}
    transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
    className="w-full"
  >
    {/* Skeleton content remains the same */}
  </motion.div>
);

function Home() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { products, error } = useSelector((state) => state.products);
  const { likedProducts } = useSelector((state) => state.likes);
  const { cartItems } = useSelector((state) => state.cart);

  // State for filters and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortOption, setSortOption] = useState("default");
  const [activeTab, setActiveTab] = useState("all");
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Komponentning yuqorisiga (useEffect ichiga)
useEffect(() => {
  const handleClickOutside = (event) => {
    if (showSortMenu && !event.target.closest('.sort-menu-container')) {
      setShowSortMenu(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [showSortMenu]);

// DIV elementiga class qo'shish
<div className="relative sort-menu-container">
  
</div>
  // Fetch products on mount
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Process and filter products
  const processedProducts = useMemo(() => {
    let result = [...products];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    // Apply price filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Apply sorting
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
        // Default sorting (maybe by popularity or newest)
        break;
    }

    // Group by category
    const grouped = {};
    result.forEach(product => {
      if (!grouped[product.category]) {
        grouped[product.category] = [];
      }
      grouped[product.category].push(product);
    });

    return grouped;
  }, [products, searchQuery, selectedCategories, priceRange, sortOption]);

  // Get all unique categories
  const allCategories = useMemo(() => {
    return [...new Set(products.map(p => p.category))];
  }, [products]);

  // Navigation handlers
  const handleProductClick = (product) => {
    dispatch(addViewedProduct(product));
    navigate("/full", { state: { product } });
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    dispatch(addToCart({
      id: product.id,
      title: product.title,
      price: product.price * (1 - product.discountPercentage / 100),
      thumbnail: product.thumbnail,
      quantity: 1
    }));
    toast.success(`${product.title} savatchaga qo'shildi`);
  };

  const handleLikeToggle = (e, productId) => {
    e.stopPropagation();
    dispatch(toggleLike(productId));
  };

  // Toggle category selection
  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setPriceRange([0, 2000]);
    setSelectedCategories([]);
    setSortOption("default");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto text-white px-4 py-6 max-w-7xl"
    >
      {/* Header with search and filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <motion.h1 className="text-2xl sm:text-3xl font-bold text-white">
          Mahsulotlar
        </motion.h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-grow">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Mahsulot qidirish..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            )}
          </div>
          
          {/* Filter and sort buttons */}
          <div className="flex gap-2">
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaFilter />
              <span className="hidden sm:inline">Filtrlar</span>
            </motion.button>
            
            <div className="relative">
  <motion.button
    className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => setShowSortMenu(!showSortMenu)} // Menyuni ochish/yopish
  >
    <FaSort />
    <span className="hidden sm:inline">Tartiblash</span>
  </motion.button>
  
  {/* AnimatePresence bilan menyuning ochilish/yopilish animatsiyasi */}
  <AnimatePresence>
    {showSortMenu && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute right-0 mt-1 w-48 bg-gray-800 rounded-lg shadow-xl z-10"
      >
        {SORT_OPTIONS.map(option => (
          <button
            key={option.value}
            onClick={() => {
              setSortOption(option.value);
              setShowSortMenu(false); // Tanlagandan so'ng menyuni yopish
            }}
            className={`w-full text-left px-4 py-2 hover:bg-gray-700 ${
              sortOption === option.value ? 'text-purple-400' : 'text-white'
            }`}
          >
            {option.label}
          </button>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
</div>
          </div>
        </div>
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-800 rounded-lg mb-6 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Filtrlar</h3>
                <button 
                  onClick={resetFilters}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  Barchasini tozalash
                </button>
              </div>
              
              {/* Price range filter */}
              <div className="mb-6">
                <label className="block mb-2">
                  Narx oraligi: ${priceRange[0]} - ${priceRange[1]}
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="10"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="10"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* Categories filter */}
              <div>
                <h4 className="font-medium mb-2">Kategoriyalar</h4>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map(category => (
                    <motion.button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedCategories.includes(category)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {category}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category tabs */}
      <div className="flex overflow-x-auto scrollbar-hide mb-6">
        <motion.button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 font-medium whitespace-nowrap ${
            activeTab === "all" ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'
          }`}
          whileHover={{ scale: 1.05 }}
        >
          Barchasi
        </motion.button>
        
        {Object.keys(processedProducts).map(category => (
          <motion.button
            key={category}
            onClick={() => setActiveTab(category)}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === category ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'
            }`}
            whileHover={{ scale: 1.05 }}
          >
            {category}
          </motion.button>
        ))}
      </div>

      {/* Products grid */}
      {error ? (
        <div className="text-center py-8">
          <p className="text-red-400">{error}</p>
        </div>
      ) : Object.keys(processedProducts).length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Hech qanday mahsulot topilmadi</p>
          <button 
            onClick={resetFilters}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
          >
            Filtrlarni tozalash
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {(activeTab === "all" ? Object.keys(processedProducts) : [activeTab]).map(category => (
            <motion.div 
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold capitalize">{category}</h2>
                <button
                  onClick={() => navigate('/browse', { state: { category } })}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  Barchasini ko'rish →
                </button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {processedProducts[category].slice(0, 10).map(product => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    isInCart={cartItems.some(item => item.id === product.id)}
                    isLiked={likedProducts.includes(product.id)}
                    onProductClick={handleProductClick}
                    onAddToCart={handleAddToCart}
                    onLikeToggle={handleLikeToggle}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// Separate ProductCard component for better performance
const ProductCard = React.memo(({ product, isInCart, isLiked, onProductClick, onAddToCart, onLikeToggle }) => {
  const discountedPrice = (product.price * (1 - product.discountPercentage / 100)).toFixed(2);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="group relative rounded-xl shadow-md overflow-hidden bg-gray-800 hover:bg-gray-700"
      onClick={() => onProductClick(product)}
    >
      {/* Product image */}
      <div className="relative h-40 md:h-48 overflow-hidden">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Discount badge */}
        {product.discountPercentage > 0 && (
          <motion.span 
            className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            -{Math.round(product.discountPercentage)}%
          </motion.span>
        )}
        
        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex flex-col space-y-2">
          <motion.button
            onClick={(e) => onLikeToggle(e, product.id)}
            className="p-1.5 bg-gray-900/50 rounded-full backdrop-blur-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaHeart className={isLiked ? "text-red-500" : "text-gray-300"} />
          </motion.button>
          
          <motion.button
            onClick={(e) => onAddToCart(e, product)}
            className={`p-1.5 rounded-full backdrop-blur-sm ${
              isInCart ? "bg-green-500/80" : "bg-gray-900/50"
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaShoppingCart className={isInCart ? "text-white" : "text-gray-300"} />
          </motion.button>
        </div>
      </div>
      
      {/* Product info */}
      <div className="p-3">
        <h3 className="text-sm font-medium line-clamp-2 mb-1">{product.title}</h3>
        
        <div className="flex items-center mb-2">
          {product.discountPercentage > 0 && (
            <p className="text-gray-400 line-through text-xs mr-2">
              ${product.price}
            </p>
          )}
          <p className="text-green-400 font-semibold text-sm">
            ${discountedPrice}
          </p>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="rounded-full p-1 bg-gray-700 mr-2">
              <img src={Mlogo} className="w-3 h-3" alt="brand" />
            </div>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-xs ${
                    i < Math.round(product.rating) ? "text-yellow-400" : "text-gray-500"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          <span className="text-xs text-gray-400">
            {product.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </motion.div>
  );
});

export default Home;