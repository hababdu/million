import React, { useEffect, useRef, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchProducts, increaseLimit } from "../redux/productSlice";
import { addViewedProduct } from "../redux/productSliceHistory";
import { toggleLike } from "../redux/likeSlice";
import { addToCart } from "../redux/cartSlice";
import { FaHeart, FaShoppingCart, FaSearch, FaFilter } from "react-icons/fa";
import { toast } from 'react-hot-toast';
import Mlogo from "../assets/mlogo.svg";

const Browse = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const observer = useRef();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
    const darkMode = useSelector((state) => state.theme.darkMode);
  

  const { 
    products, 
    loading, 
    error, 
    limit 
  } = useSelector((state) => state.products);
  
  const { likedProducts } = useSelector((state) => state.likes);
  const { cartItems } = useSelector((state) => state.cart);

  // Mahsulotlarni yuklash
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Kategoriya va filtrlar bo'yicha mahsulotlarni saralash
  const filteredProducts = useCallback(() => {
    let result = [...products];
    
    // Asosiy kategoriya bo'yicha filtr
    if (location.state?.category) {
      result = result.filter(p => p.category === location.state.category);
    }
    
    // Qidiruv bo'yicha filtr
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }
    
    // Kategoriya filtrlari
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }
    
    // Narx oralig'i bo'yicha filtr
    result = result.filter(p => 
      p.price >= priceRange[0] && p.price <= priceRange[1]
    );
    
    return result;
  }, [products, location.state?.category, searchQuery, selectedCategories, priceRange]);

  // Mahsulot sahifasiga o'tish
  const handleProductClick = (product) => {
    dispatch(addViewedProduct(product));
    navigate("/full", { state: { product } });
  };

  // Savatchaga qo'shish
  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    
    dispatch(addToCart({
      id: product.id,
      title: product.title,
      price: product.price * (1 - product.discountPercentage / 100),
      thumbnail: product.thumbnail,
      quantity: 1,
      discountPercentage: product.discountPercentage
    }));
    
    toast.success(`${product.title} savatchaga qo'shildi`, {
      position: "top-right",
      style: {
        backgroundColor: '#4B5563',
        color: 'white',
      }
    });
  };

  // Sevimlilarga qo'shish/olib tashlash
  const handleToggleLike = (e, productId) => {
    e.stopPropagation();
    dispatch(toggleLike(productId));
    
    const isLiked = likedProducts.includes(productId);
    toast[isLiked ? 'error' : 'success'](
      isLiked ? "Sevimlilardan olib tashlandi" : "Sevimlilarga qo'shildi",
      { position: "top-right" }
    );
  };

  // Cheksiz yuklash uchun Intersection Observer
  const lastProductRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && filteredProducts().length >= limit) {
          dispatch(increaseLimit());
        }
      }, { threshold: 0.5 });
      
      if (node) observer.current.observe(node);
    },
    [loading, dispatch, limit, filteredProducts]
  );

  // Kategoriyalarni olish
  const categories = [...new Set(products.map(p => p.category))];

  // Kategoriyani tanlash/o'chirish
  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className={`  sm:px-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen transition-colors duration-300`}>
    {/* Header and filtering */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <h1 className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
        {location.state?.category 
          ? `${location.state.category} mahsulotlari` 
          : "Barcha mahsulotlar"}
      </h1>
      
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full sm:w-auto">
        {/* Search panel */}
        <div className="relative w-full sm:w-56 md:w-64">
          <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Qidirish..."
            className={`w-full pl-10 pr-4 py-2 ${darkMode ? 'bg-gray-800 placeholder-gray-400' : 'bg-white border border-gray-200 placeholder-gray-500'} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Filter button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white border border-gray-200 hover:bg-gray-100'} rounded-lg transition self-end sm:self-auto`}
          aria-label="Filter products"
        >
          <FaFilter className={darkMode ? "text-white" : "text-gray-700"} />
        </button>
      </div>
    </div>
  
    {/* Filters panel */}
    {showFilters && (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'} p-4 rounded-lg mb-6 animate-fadeIn shadow-md`}>
        <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Filtrlar</h3>
        
        {/* Price range */}
        <div className="mb-4">
          <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Narx oralig'i: ${priceRange[0]} - ${priceRange[1]}
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
            <input
              type="range"
              min="0"
              max="1000"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
              className={`w-full ${darkMode ? 'range-dark' : 'range-light'}`}
            />
            <input
              type="range"
              min="0"
              max="1000"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className={`w-full ${darkMode ? 'range-dark' : 'range-light'}`}
            />
          </div>
        </div>
        
        {/* Categories */}
        <div>
          <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Kategoriyalar</h4>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategories.includes(category)
                    ? 'bg-purple-600 text-white'
                    : darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    )}
  
    {/* Error and loading states */}
    {error && (
      <div className={`text-center p-4 rounded-lg ${darkMode ? 'bg-gray-800 text-red-400' : 'bg-red-100 text-red-700'}`}>
        {error}
      </div>
    )}
    
    {!loading && filteredProducts().length === 0 && (
      <div className={`text-center p-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Hech qanday mahsulot topilmadi
      </div>
    )}
  
    {/* Products grid */}
    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
      {filteredProducts()
        .slice(0, limit)
        .map((product, index) => {
          const isInCart = cartItems.some(item => item.id === product.id);
          
          return (
            <div
              key={product.id}
              ref={index === filteredProducts().slice(0, limit).length - 1 ? lastProductRef : null}
              className={`relative ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} transition-all duration-300 rounded-xl overflow-hidden shadow-lg group cursor-pointer border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
              onClick={() => handleProductClick(product)}
            >
              {/* Product image */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Discount percentage */}
                {product.discountPercentage > 0 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {Math.round(product.discountPercentage)}% OFF
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex flex-col space-y-2">
                  {/* Favorite button */}
                  <button
                    onClick={(e) => handleToggleLike(e, product.id)}
                    className={`p-2 ${darkMode ? 'bg-gray-900 bg-opacity-70 hover:bg-opacity-100' : 'bg-white bg-opacity-70 hover:bg-opacity-100'} rounded-full transition shadow`}
                    aria-label={likedProducts.includes(product.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <FaHeart
                      className={
                        likedProducts.includes(product.id)
                          ? "text-red-500"
                          : darkMode 
                            ? "text-gray-300 hover:text-red-500"
                            : "text-gray-500 hover:text-red-500"
                      }
                    />
                  </button>
                  
                  {/* Cart button */}
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className={`p-2 rounded-full transition shadow ${
                      isInCart
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : darkMode 
                          ? 'bg-gray-900 bg-opacity-70 hover:bg-opacity-100'
                          : 'bg-white bg-opacity-70 hover:bg-opacity-100'
                    }`}
                    aria-label={isInCart ? "Remove from cart" : "Add to cart"}
                  >
                    <FaShoppingCart
                      className={
                        isInCart
                          ? "text-white"
                          : darkMode 
                            ? "text-gray-300 hover:text-white"
                            : "text-gray-500 hover:text-purple-600"
                      }
                    />
                  </button>
                </div>
              </div>
              
              {/* Product info */}
              <div className="p-3 sm:p-4">
                <h3 className={`font-semibold text-base sm:text-lg mb-1 line-clamp-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {product.title}
                </h3>
                
                <div className="flex flex-col items-start justify-between">
                  {/* Prices */}
                  <div>
                    <span className={`${darkMode ? 'text-purple-400' : 'text-purple-600'} font-bold text-sm sm:text-base`}>
                      ${(product.price * (1 - product.discountPercentage / 100)).toFixed(2)}
                    </span>
                    {product.discountPercentage > 0 && (
                      <span className={`ml-2 text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} line-through`}>
                        ${product.price}
                      </span>
                    )}
                  </div>
                  
                  {/* Rating */}
                  <div className="flex  flex-col items-start">
                    <span className="text-yellow-400 text-xs sm:text-sm mr-1">
                      {product.rating.toFixed(1)}
                    </span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-xs ${
                            i < Math.round(product.rating)
                              ? 'text-yellow-400'
                              : darkMode 
                                ? 'text-gray-500'
                                : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Brand logo */}
                <div className="mt-2 sm:mt-3 flex justify-end">
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} p-1 rounded-full shadow`}>
                    <img src={Mlogo} className="w-4 h-4 sm:w-5 sm:h-5" alt="brand" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  
    {/* Loading indicator */}
    {loading && (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )}
</div>
  );
};

export default Browse;