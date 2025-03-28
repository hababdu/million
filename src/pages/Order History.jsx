import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearViewedProducts, removeViewedProduct } from "../redux/productSliceHistory";
import Modal from '../components/Madal';
import { FaTrash, FaEye, FaHistory } from "react-icons/fa";

function OrderHistory() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const viewedProducts = useSelector((state) => state.productHistory.viewedProducts);

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
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <FaHistory className="text-blue-400 text-3xl" />
            <h1 className="text-3xl font-bold text-gray-100">Ko'rilgan Mahsulotlar</h1>
          </div>
          
          {viewedProducts.length > 0 && (
            <button
              onClick={() => dispatch(clearViewedProducts())}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
            >
              <FaTrash />
              <span>Ro'yxatni tozalash</span>
            </button>
          )}
        </div>

        {viewedProducts.length === 0 ? (
          <div className="bg-gray-800 rounded-xl shadow-sm p-8 text-center">
            <FaEye className="mx-auto text-gray-500 text-5xl mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">Ko'rilgan mahsulotlar yo'q</h3>
            <p className="text-gray-400">Siz hali hech qanday mahsulotni ko'rmagansiz.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {viewedProducts.map((product, index) => (
              <div 
                key={index} 
                className="bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-700"
              >
                <div className="relative">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => handleRemoveProduct(product.id)}
                    className="absolute top-2 right-2 p-2 bg-gray-700/80 hover:bg-gray-600 rounded-full transition-colors duration-200"
                    title="O'chirish"
                  >
                    <FaTrash className="text-red-400" />
                  </button>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-100 mb-1 line-clamp-1">{product.title}</h3>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-blue-400 font-bold">{product.price}$</span>
                    <button 
                      className="text-sm text-blue-400 hover:text-blue-300 font-medium"
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
          className=" bg-gray-900 text-white"
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={confirmRemoveProduct}
        />
      </div>
    </div>
  );
}

export default OrderHistory;