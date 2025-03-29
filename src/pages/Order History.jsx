import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearViewedProducts, removeViewedProduct } from "../redux/productSliceHistory";
import { toggleDarkMode } from "../redux/themeSlice";
import Modal from '../components/Madal';
import { FaTrash, FaEye, FaHistory, FaSun, FaMoon } from "react-icons/fa";

function OrderHistory() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const viewedProducts = useSelector((state) => state.productHistory.viewedProducts);
  const darkMode = useSelector((state) => state.theme.darkMode);

  const [isModalOpen, setModalOpen] = useState(false);
  const [productToRemove, setProductToRemove] = useState(null);

  const handleRemoveProduct = (productId) => {
    setProductToRemove(productId);
    setModalOpen(true);
  };

  const confirmRemoveProduct = () => {
    dispatch(removeViewedProduct(productToRemove));
    setModalOpen(false);
  };

  return (
    <div className={`min-h-screen py-8  sm:px-6 lg:px-8 transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <FaHistory className={`text-3xl ${
              darkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <h1 className={`text-3xl font-bold ${
              darkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              Ko'rilgan Mahsulotlar
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Theme toggle button */}
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className={`p-2 rounded-lg ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              }`}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <FaSun className="text-yellow-300" /> : <FaMoon className="text-gray-600" />}
            </button>

            {viewedProducts.length > 0 && (
              <button
                onClick={() => dispatch(clearViewedProducts())}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                } text-white`}
              >
                <FaTrash />
                <span>Ro'yxatni tozalash</span>
              </button>
            )}
          </div>
        </div>

        {viewedProducts.length === 0 ? (
          <div className={`rounded-xl shadow-sm p-8 text-center ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <FaEye className={`mx-auto text-5xl mb-4 ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <h3 className={`text-xl font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Ko'rilgan mahsulotlar yo'q
            </h3>
            <p className={`${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Siz hali hech qanday mahsulotni ko'rmagansiz.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {viewedProducts.map((product, index) => (
              <div 
                key={index} 
                className={`rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className="relative">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => handleRemoveProduct(product.id)}
                    className={`absolute top-2 right-2 p-2 rounded-full transition-colors duration-200 ${
                      darkMode ? 'bg-gray-700/80 hover:bg-gray-600' : 'bg-gray-200/80 hover:bg-gray-300'
                    }`}
                    title="O'chirish"
                  >
                    <FaTrash className={`${
                      darkMode ? 'text-red-400' : 'text-red-500'
                    }`} />
                  </button>
                </div>
                
                <div className="p-4">
                  <h3 className={`text-lg font-semibold mb-1 line-clamp-1 ${
                    darkMode ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    {product.title}
                  </h3>
                  <div className="flex justify-between items-center mt-3">
                    <span className={`font-bold ${
                      darkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {product.price}$
                    </span>
                    <button 
                      className={`text-sm font-medium ${
                        darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                      }`}
                      onClick={() => navigate('/full', { state: { product } })}
                      title="Batafsil"
                    >
                      <FaEye className="inline-block mr-1" />
                      Batafsil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal komponenti */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={confirmRemoveProduct}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}

export default OrderHistory;