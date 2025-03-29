import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toggleLike } from "../redux/likeSlice";
import axios from "axios";
import { FaHeart, FaRegHeart, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FiShoppingBag } from "react-icons/fi";

const SkeletonLoader = ({ darkMode }) => (
  <div className={`rounded-lg shadow-sm overflow-hidden relative animate-pulse ${
    darkMode ? 'bg-gray-700' : 'bg-gray-200'
  }`}>
    <div className={`w-full h-48 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
    <div className="p-3">
      <div className={`h-6 ${darkMode ? 'bg-gray-600' : 'bg-gray-400'} mb-2`}></div>
      <div className={`h-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-400'} mb-2`}></div>
      <div className={`h-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-400'} mb-2 w-1/2`}></div>
    </div>
  </div>
);

function Likes() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux statelarini olish
  const likedProducts = useSelector((state) => state.likes.likedProducts);
  const darkMode = useSelector((state) => state.theme.darkMode);
  
  // Local statelar
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    axios
      .get("https://dummyjson.com/products?limit=194")
      .then((response) => {
        setProducts(response.data.products);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  }, []);

  const likedItems = products.filter((product) =>
    likedProducts.includes(product.id)
  );

  const confirmUnlike = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleUnlike = () => {
    if (selectedProduct) {
      dispatch(toggleLike(selectedProduct.id));
      setShowModal(false);
      setSelectedProduct(null);
    }
  };

  const handleNavi = (product) => {
    navigate("/full", { state: { product } });
  };


  return (
    <div className={` min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Sarlavha va tema tugmasi */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <FiShoppingBag className={`text-3xl mr-3 ${
              darkMode ? 'text-indigo-400' : 'text-indigo-600'
            }`} />
            <h2 className={`text-3xl font-bold ${
              darkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>
              Sevimli Mahsulotlar
            </h2>
          </div>
         
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonLoader key={index} darkMode={darkMode} />
            ))}
          </div>
        ) : likedItems.length === 0 ? (
          <div className={`rounded-xl shadow-sm p-8 text-center ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <FaHeart className={`mx-auto text-5xl mb-4 ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <h3 className={`text-xl font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Sevimli mahsulotlar yo'q
            </h3>
            <p className={`${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Siz hali hech qanday mahsulotni sevimlilarga qo'shmagansiz
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {likedItems.map((product) => {
              const isLiked = likedProducts.includes(product.id);
              const discountedPrice = (
                product.price * (1 - product.discountPercentage / 100)
              ).toFixed(2);

              return (
                <div
                  key={product.id}
                  className={`relative rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden ${
                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  } border`}
                >
                  {/* Like button */}
                  <button
                    onClick={() => confirmUnlike(product)}
                    className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-colors ${
                      isLiked
                        ? darkMode
                          ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                          : 'bg-red-100 text-red-500 hover:bg-red-200'
                        : darkMode
                          ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {isLiked ? <FaHeart /> : <FaRegHeart />}
                  </button>

                  {/* Product image */}
                  <div 
                    onClick={() => handleNavi(product)}
                    className="cursor-pointer"
                  >
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>

                  {/* Product details */}
                  <div 
                    onClick={() => handleNavi(product)}
                    className="p-4 cursor-pointer"
                  >
                    <h2 className={`text-sm font-semibold line-clamp-1 mb-1 ${
                      darkMode ? 'text-gray-100' : 'text-gray-800'
                    }`}>
                      {product.title}
                    </h2>
                    <p className={`text-xs mb-2 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {product.brand}
                    </p>
                    
                    {/* Price and discount */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-bold text-sm ${
                        darkMode ? 'text-indigo-400' : 'text-indigo-600'
                      }`}>
                        ${discountedPrice}
                      </span>
                      <span className={`text-xs line-through ${
                        darkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        ${product.price}
                      </span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center">
                      <div className="flex text-yellow-400 text-xs">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>
                            {i < Math.round(product.rating) ? '★' : '☆'}
                          </span>
                        ))}
                      </div>
                      <span className={`text-xs ml-1 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        ({product.rating})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Confirmation Modal */}
        {showModal && selectedProduct && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
            <div className={`rounded-xl shadow-xl p-6 w-full max-w-md border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-semibold ${
                  darkMode ? 'text-gray-100' : 'text-gray-800'
                }`}>
                  O'chirishni tasdiqlash
                </h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className={darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}
                >
                  <FaTimes />
                </button>
              </div>
              <p className={`mb-6 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                "{selectedProduct.title}" ni sevimlilardan o'chirmoqchimisiz?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 border rounded-lg transition-colors ${
                    darkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleUnlike}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  O'chirish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Likes;