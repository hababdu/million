import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchProducts } from "../redux/productSlice";
import { addViewedProduct } from '../redux/productSliceHistory';
import { toggleLike } from "../redux/likeSlice";
import { addToCart } from "../redux/cartSlice";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { toast } from "react-hot-toast";
import Mlogo from '../assets/mlogo.svg';
import { motion } from "framer-motion";

// Skeleton Loader for horizontal scrolling
const SkeletonLoader = () => (
  <div className="w-full">
    <div className="flex justify-between items-center py-2 px-1">
      <div className="w-20 h-4 bg-gray-700 rounded-full animate-pulse"></div>
      <div className="w-16 h-4 bg-gray-700 rounded-full animate-pulse"></div>
    </div>

    <div className="relative">
      <div className="flex space-x-4 overflow-x-auto hide-scrollbar">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex-shrink-0 w-28 h-50 md:w-48 md:h-64 rounded-xl shadow-sm overflow-hidden relative bg-gray-800 text-white">
            <div className="absolute top-2 right-2 w-6 h-6 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-full h-28 md:h-40 bg-gray-700 animate-pulse"></div>
            <div className="p-3">
              <div className="w-full h-4 bg-gray-700 rounded-full animate-pulse mb-2"></div>
              <div className="w-3/4 h-3 bg-gray-700 rounded-full animate-pulse mb-3"></div>
              <div className="flex items-center mt-1">
                <div className="w-10 h-3 bg-gray-700 rounded-full animate-pulse mr-2"></div>
                <div className="w-12 h-4 bg-gray-700 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

function Home() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { products, error } = useSelector((state) => state.products);
  const { likedProducts } = useSelector((state) => state.likes);
  const { cartItems } = useSelector((state) => state.cart);

  const [categoryProducts, setCategoryProducts] = useState({});
  const [shuffledProducts, setShuffledProducts] = useState({});
  const [categories, setCategories] = useState([]);
  
  const category = location.state?.category;

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (products.length > 0) {
      const groupedProducts = {};
      products.forEach(product => {
        if (!groupedProducts[product.category]) {
          groupedProducts[product.category] = [];
        }
        groupedProducts[product.category].push(product);
      });
      
      const shuffled = {};
      Object.keys(groupedProducts).forEach(cat => {
        shuffled[cat] = shuffleArray(groupedProducts[cat]);
      });
      
      setCategoryProducts(groupedProducts);
      setShuffledProducts(shuffled);
      setCategories(Object.keys(groupedProducts));
    }
  }, [products]);

  useEffect(() => {
    if (category) {
      setTimeout(() => {
        const element = document.getElementById(category);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 300);
    }
  }, [category]);

  const handleMoreClick = (category) => {
    navigate("/browse", { state: { category } });
  };

  const handleNavi = (product) => {
    dispatch(addViewedProduct(product));
    navigate("/full", { state: { product } });
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    const isInCart = cartItems.some(item => item.id === product.id);
    
    if (isInCart) {
      toast.error("This product is already in your cart");
      return;
    }

    dispatch(addToCart({
      id: product.id,
      title: product.title,
      price: product.price * (1 - product.discountPercentage / 100),
      thumbnail: product.thumbnail,
      quantity: 1
    }));
    
    toast.success(
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-2"
      >
        <FaShoppingCart className="text-green-400" />
        <span>{product.title} added to cart!</span>
      </motion.div>,
      { duration: 1500 }
    );
  };

  const handleLikeToggle = (e, productId) => {
    e.stopPropagation();
    dispatch(toggleLike(productId));
    
    const isLiked = likedProducts.includes(productId);
    toast.success(
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-2"
      >
        {isLiked ? (
          <>
            <FaHeart className="text-red-500" />
            <span>Added to favorites</span>
          </>
        ) : (
          <>
            <FaHeart className="text-gray-300" />
            <span>Removed from favorites</span>
          </>
        )}
      </motion.div>,
      { duration: 1500 }
    );
  };

  return (
    <div className="mx-auto text-white px-4 py-6 max-w-7xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Mahsulotlar</h1>

      {!products || products.length === 0 ? (
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonLoader key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-400 bg-red-900/30 inline-block px-4 py-2 rounded-lg">{error}</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.keys(shuffledProducts).map((category) => (
            <div key={category} className="w-full" id={category}>
              <div className="flex justify-between items-center mb-4 px-2">
                <h2 className="text-lg md:text-xl font-bold text-white capitalize">
                  {category}
                </h2>
                <button
                  onClick={() => handleMoreClick(category)}
                  className="text-sm px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded-full transition-colors"
                >
                  Barchasi →
                </button>
              </div>
              
              <div className="relative">
                <div className="grid grid-cols-2 sm:grid-cols-3 overflow-auto md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {shuffledProducts[category].slice(0, 10).map((product) => {
                    const isInCart = cartItems.some(item => item.id === product.id);
                    const isLiked = likedProducts.includes(product.id);
                    const discountedPrice = (product.price * (1 - product.discountPercentage / 100)).toFixed(2);
                    
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="group relative rounded-xl shadow-md overflow-hidden bg-gray-800 hover:bg-gray-700 transition-all duration-300"
                      >
                        <div className="absolute top-3 right-3 z-10 flex flex-col space-y-2">
                          <button
                            onClick={(e) => handleLikeToggle(e, product.id)}
                            className="p-1.5 bg-gray-900/50 rounded-full backdrop-blur-sm"
                          >
                            <FaHeart
                              className={`text-lg ${
                                isLiked ? "text-red-500" : "text-gray-300 hover:text-red-400"
                              } transition-colors`}
                            />
                          </button>
                          <button
                            onClick={(e) => handleAddToCart(e, product)}
                            className={`p-1.5 bg-gray-900/50 rounded-full backdrop-blur-sm ${
                              isInCart ? "text-green-400" : "text-gray-300 hover:text-green-400"
                            } transition-colors`}
                            disabled={isInCart}
                          >
                            <FaShoppingCart className="text-lg" />
                          </button>
                        </div>

                        {product.discountPercentage > 0 && (
                          <span className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                            -{product.discountPercentage}%
                          </span>
                        )}

                        <div 
                          className="w-full h-40 md:h-48 overflow-hidden cursor-pointer"
                          onClick={() => handleNavi(product)}
                        >
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <div 
                          className="p-3 cursor-pointer"
                          onClick={() => handleNavi(product)}
                        >
                          <h3 className="text-sm font-medium text-gray-100 line-clamp-2 mb-1">
                            {product.title}
                          </h3>
                          <div className="flex items-center mb-2">
                            <p className="text-gray-400 line-through text-xs mr-2">
                              ${product.price}
                            </p>
                            <p className="text-green-400 font-semibold text-sm">
                              ${discountedPrice}
                            </p>
                          </div>
                      
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="rounded-full p-1 bg-gray-700 mr-2">
                                <img src={Mlogo} className="w-3 h-3" alt="logo" />
                              </div>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={`text-xs ${
                                      i < Math.round(product.rating) 
                                        ? "text-yellow-400" 
                                        : "text-gray-500"
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
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;