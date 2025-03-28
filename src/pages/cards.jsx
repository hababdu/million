import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  addToCart,
  removeFromCart,
  decreaseQuantity,
  clearCart,
} from "../redux/cartSlice";
import { toggleLike } from "../redux/likeSlice";
import { FaHeart, FaRegHeart, FaTrash, FaShoppingCart } from "react-icons/fa";
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
    <div className="min-h-screen bg-gray-800  p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Cart Section */}
          <div className="lg:w-2/3 ">
            <div className="bg-gray-600 rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <FaShoppingCart className="text-white" />
                  Savatchangiz
                </h2>
                {cartItems.length > 0 && (
                  <span className="bg-gray-400 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                    {cartItems.length} mahsulot
                  </span>
                )}
              </div>

              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center  justify-center py-16">
                  <div className="relative mb-6">
                    <FaShoppingCart className="text-indigo-200 text-6xl" />
                    <div className="absolute -bottom-2 -right-2 bg-indigo-100 p-2 rounded-full">
                      <span className="text-indigo-700 text-lg">0</span>
                    </div>
                  </div>
                  <p className="text-xl text-gray-700 font-medium mb-2">
                    Savatchangiz bo'sh
                  </p>
                  <p className="text-gray-500 mb-6 text-center max-w-md">
                    Xarid qilishni boshlash uchun mahsulot qo'shing
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-700 to-indigo-600 text-white rounded-lg hover:from-indigo-800 hover:to-indigo-700 transition-all shadow-lg"
                  >
                    Bosh sahifaga qaytish
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => {
                    const isLiked = likedProducts.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col md:flex-row gap-4 p-4 bg-gray-800  rounded-xl hover:shadow-sm transition-all"
                      >
                        <div className="md:w-1/4">
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-40 object-cover rounded-lg shadow-sm"
                          />
                        </div>
                        <div className="md:w-3/4 flex flex-col">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold text-white">
                                {item.title}
                              </h3>
                              <p className="text-indigo-500 font-medium">
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
                              className={`text-xl p-2 rounded-full ${isLiked ? 'text-red-500 bg-red-50' : 'text-gray-400 bg-gray-50'
                                } hover:bg-red-100 transition-colors`}
                            >
                              {isLiked ? <FaHeart /> : <FaRegHeart />}
                            </button>
                          </div>
                          <p className="text-gray-300 text-sm mt-2 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 border border-white rounded-full px-3 py-1">
                              <button
                                onClick={() => dispatch(decreaseQuantity(item.id))}
                                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-indigo-50 transition-colors text-gray-600"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleIncreaseQuantity(item)}
                                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-indigo-50 transition-colors text-gray-600"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <FaTrash size={14} /> O'chirish
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
              <div className="bg-white rounded-2xl shadow-md p-6 sticky top-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">
                  Buyurtma xulosasi
                </h3>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mahsulotlar soni:</span>
                    <span className="text-gray-800 font-medium">
                      {cartItems.length} ta
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Jami miqdor:</span>
                    <span className="text-gray-800 font-medium">
                      {cartItems.reduce((sum, item) => sum + item.quantity, 0)} dona
                    </span>
                  </div>
                  <div className="border-t border-gray-200 my-3"></div>
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-800">Umumiy summa:</span>
                    <span className="text-indigo-700">
                      {calculateTotalPrice().toLocaleString()} so'm
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleBuyNow}
                  className="w-full py-3 bg-gradient-to-r from-indigo-700 to-indigo-600 text-white font-medium rounded-lg hover:from-indigo-800 hover:to-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  Buyurtma berish
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={handleClearCart}
                  className="w-full mt-3 py-3 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                >
                  Savatchani tozalash
                  <FaTrash size={14} />
                </button>

                {feedbackMessage && (
                  <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
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