import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  addToCart,
  removeFromCart,
  decreaseQuantity,
  clearCart,
} from "../redux/cartSlice";
import { toggleLike } from "../redux/likeSlice";
import { FaHeart, FaRegHeart, FaTrash, FaShoppingCart, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.cartItems);
  const likedProducts = useSelector((state) => state.likes.likedProducts) || [];
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const calculateTotalPrice = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const handleBuyNow = () => {
    if (cartItems.length === 0) return;

    const order = {
      products: cartItems,
      totalPrice: calculateTotalPrice(),
      totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    };

    navigate("/checkout", { state: { order } });
  };

  const handleRemoveItem = (itemId) => {
    if (window.confirm("Mahsulotni savatchadan o'chirishni istaysizmi?")) {
      dispatch(removeFromCart(itemId));
      setFeedbackMessage("Mahsulot savatchadan o'chirildi");
      setTimeout(() => setFeedbackMessage(""), 3000);
    }
  };

  const handleClearCart = () => {
    if (window.confirm("Savatchani tozalashni istaysizmi?")) {
      dispatch(clearCart());
      setFeedbackMessage("Savatcha tozalandi");
      setTimeout(() => setFeedbackMessage(""), 3000);
    }
  };

  const handleIncreaseQuantity = (item) => {
    dispatch(addToCart({ ...item, quantity: 1 }));
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between mb-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-gray-700 text-white"
        >
          <FaArrowLeft />
        </button>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FaShoppingCart className="text-white" />
          Savatcha
        </h2>
        <div className="w-8"></div> {/* Spacer for alignment */}
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Cart Section */}
          <div className="lg:w-2/3">
            <div className="bg-gray-800 rounded-xl shadow-md p-4 md:p-6">
              <div className="hidden md:flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <FaShoppingCart className="text-white" />
                  Savatchangiz
                </h2>
                {cartItems.length > 0 && (
                  <span className="bg-gray-700 text-indigo-400 px-3 py-1 rounded-full text-sm font-medium">
                    {cartItems.length} mahsulot
                  </span>
                )}
              </div>

              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 md:py-16">
                  <div className="relative mb-4 md:mb-6">
                    <FaShoppingCart className="text-indigo-400 text-5xl md:text-6xl" />
                    <div className="absolute -bottom-2 -right-2 bg-indigo-600 p-2 rounded-full">
                      <span className="text-white text-sm md:text-lg">0</span>
                    </div>
                  </div>
                  <p className="text-lg md:text-xl text-gray-300 font-medium mb-2">
                    Savatchangiz bo'sh
                  </p>
                  <p className="text-gray-400 mb-6 text-center max-w-md text-sm md:text-base">
                    Xarid qilishni boshlash uchun mahsulot qo'shing
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="px-5 py-2 md:px-6 md:py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-lg text-sm md:text-base"
                  >
                    Bosh sahifaga qaytish
                  </button>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {cartItems.map((item) => {
                    const isLiked = likedProducts.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row gap-3 md:gap-4 p-3 md:p-4 bg-gray-700 rounded-lg md:rounded-xl hover:shadow-sm transition-all"
                      >
                        <div className="sm:w-1/4">
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-32 md:h-40 object-cover rounded-lg shadow-sm"
                          />
                        </div>
                        <div className="sm:w-3/4 flex flex-col">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-base md:text-lg font-semibold text-white line-clamp-1">
                                {item.title}
                              </h3>
                              <p className="text-indigo-400 font-medium text-sm md:text-base">
                                {item.price.toLocaleString()} so'm
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                dispatch(toggleLike(item.id));
                                toast.success(
                                  isLiked
                                    ? "Mahsulot sevimlilardan olib tashlandi ❌"
                                    : "Mahsulot sevimlilarga qo'shildi ❤️",
                                  {
                                    style: {
                                      background: isLiked ? '#fef2f2' : '#f0fdf4',
                                      color: isLiked ? '#b91c1c' : '#166534',
                                      border: isLiked ? '1px solid #fecaca' : '1px solid #bbf7d0',
                                    },
                                    icon: isLiked ? '❌' : '❤️',
                                    position: 'top-right',
                                  }
                                );
                              }}
                              className={`text-lg md:text-xl p-1 md:p-2 rounded-full ${
                                isLiked ? 'text-red-500 bg-red-900/20' : 'text-gray-400 bg-gray-600'
                              } hover:bg-red-900/30 transition-colors`}
                            >
                              {isLiked ? <FaHeart /> : <FaRegHeart />}
                            </button>
                          </div>
                          <p className="text-gray-400 text-xs md:text-sm mt-1 md:mt-2 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="mt-3 md:mt-4 flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2 border border-gray-500 rounded-full px-2 md:px-3 py-1">
                              <button
                                onClick={() => dispatch(decreaseQuantity(item.id))}
                                className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full hover:bg-indigo-900/30 transition-colors text-gray-300"
                              >
                                -
                              </button>
                              <span className="w-6 md:w-8 text-center font-medium text-sm md:text-base">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleIncreaseQuantity(item)}
                                className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full hover:bg-indigo-900/30 transition-colors text-gray-300"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="flex items-center gap-1 md:gap-2 px-3 py-1 md:px-4 md:py-2 bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/30 transition-colors text-sm md:text-base"
                            >
                              <FaTrash size={12} /> O'chirish
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Section */}
          {cartItems.length > 0 && (
            <div className="lg:w-1/3">
              <div className="bg-gray-800 rounded-xl shadow-md p-4 md:p-6 sticky top-4 md:top-6">
                <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6 pb-3 md:pb-4 border-b border-gray-700">
                  Buyurtma xulosasi
                </h3>
                <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm md:text-base">Mahsulotlar soni:</span>
                    <span className="text-gray-300 font-medium text-sm md:text-base">
                      {cartItems.length} ta
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm md:text-base">Jami miqdor:</span>
                    <span className="text-gray-300 font-medium text-sm md:text-base">
                      {cartItems.reduce((sum, item) => sum + item.quantity, 0)} dona
                    </span>
                  </div>
                  <div className="border-t border-gray-700 my-2 md:my-3"></div>
                  <div className="flex justify-between">
                    <span className="text-gray-300 font-bold text-base md:text-lg">Umumiy summa:</span>
                    <span className="text-indigo-400 font-bold text-base md:text-lg">
                      {calculateTotalPrice().toLocaleString()} so'm
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleBuyNow}
                  className="w-full py-2 md:py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-lg flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  Buyurtma berish
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={handleClearCart}
                  className="w-full mt-2 md:mt-3 py-2 md:py-3 bg-gray-700 text-gray-300 font-medium rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  Savatchani tozalash
                  <FaTrash size={12} />
                </button>

                {feedbackMessage && (
                  <div className="mt-3 md:mt-4 p-2 md:p-3 bg-green-900/20 text-green-400 rounded-lg text-xs md:text-sm border border-green-800 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {feedbackMessage}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;