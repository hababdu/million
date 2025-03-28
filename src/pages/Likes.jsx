import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toggleLike } from "../redux/likeSlice";
import axios from "axios";
import { FaHeart, FaRegHeart, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FiShoppingBag } from "react-icons/fi";

const SkeletonLoader = () => (
  <div className="rounded-lg shadow-sm overflow-hidden relative animate-pulse bg-gray-800">
    <div className="w-full h-48 bg-gray-700"></div>
    <div className="p-3">
      <div className="h-6 bg-gray-600 mb-2"></div>
      <div className="h-4 bg-gray-600 mb-2"></div>
      <div className="h-4 bg-gray-600 mb-2 w-1/2"></div>
    </div>
  </div>
);

function Likes() {
  const dispatch = useDispatch();
  const likedProducts = useSelector((state) => state.likes.likedProducts);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

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
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <FiShoppingBag className="text-indigo-400 text-3xl mr-3" />
          <h2 className="text-3xl font-bold text-gray-100">Sevimli Mahsulotlar</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonLoader key={index} />
            ))}
          </div>
        ) : likedItems.length === 0 ? (
          <div className="bg-gray-800 rounded-xl shadow-sm p-8 text-center">
            <FaHeart className="mx-auto text-gray-500 text-5xl mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">Sevimli mahsulotlar yo'q</h3>
            <p className="text-gray-400">Siz hali hech qanday mahsulotni sevimlilarga qo'shmagansiz</p>
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
                  className="relative bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-700"
                >
                  {/* Like button */}
                  <button
                    onClick={() => confirmUnlike(product)}
                    className={`absolute top-3 right-3 z-10 p-2 rounded-full ${isLiked ? 'bg-red-900/30 text-red-400' : 'bg-gray-700 text-gray-400'} hover:bg-red-900/50 transition-colors`}
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
                    <h2 className="text-sm font-semibold text-gray-100 line-clamp-1 mb-1">
                      {product.title}
                    </h2>
                    <p className="text-xs text-gray-400 mb-2">{product.brand}</p>
                    
                    {/* Price and discount */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-indigo-400 font-bold text-sm">
                        ${discountedPrice}
                      </span>
                      <span className="text-xs text-gray-500 line-through">
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
                      <span className="text-xs text-gray-400 ml-1">
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
            <div className="bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-100">O'chirishni tasdiqlash</h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <FaTimes />
                </button>
              </div>
              <p className="text-gray-300 mb-6">
                "{selectedProduct.title}" ni sevimlilardan o'chirmoqchimisiz?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-600 rounded-lg text-gray-200 hover:bg-gray-700 transition-colors"
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