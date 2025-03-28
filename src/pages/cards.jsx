import { useDispatch, useSelector } from "react-redux";
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

  // Jami narxni hisoblash
  const calculateTotalPrice = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  // Sotib olish tugmasi uchun funksiya
  const handleBuyNow = (item) => {
    if (!item) return;
    navigate("/checkout", { state: { product: item } });
  };

  // Mahsulotni o'chirish
  const handleRemoveItem = (itemId) => {
    if (window.confirm("Mahsulotni savatchadan o'chirishni istaysizmi?")) {
      dispatch(removeFromCart(itemId));
      setFeedbackMessage("");
    }
  };

  // Savatchani tozalash
  const handleClearCart = () => {
    if (window.confirm("Savatchani tozalashni istaysizmi?")) {
      dispatch(clearCart());
      setFeedbackMessage("");
    }
  };

  // Savatchaga qo'shish (1 tadan)
  const handleAddToCart = (item) => {
    const itemInCart = cartItems.find((cartItem) => cartItem.id === item.id);
    if (itemInCart) {
      setFeedbackMessage("Mahsulot allaqachon savatchada.");
    } else {
      dispatch(addToCart({ ...item, quantity: 1 }));
      setFeedbackMessage("Mahsulot savatchaga qo'shildi.");
    }
  };

  // Miqdorni oshirish (1 tadan)
  const handleIncreaseQuantity = (item) => {
    dispatch(addToCart({ ...item, quantity: 1 }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Asosiy savatcha qismi */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaShoppingCart className="text-indigo-600" />
                Savatchangiz
              </h2>

              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <FaShoppingCart className="text-gray-300 text-5xl mb-4" />
                  <p className="text-xl text-gray-500 font-medium mb-2">
                    Savatchangiz bo'sh
                  </p>
                  <p className="text-gray-400">
                    Xarid qilishni boshlash uchun mahsulot qo'shing
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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
                        className="flex flex-col md:flex-row gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="md:w-1/4">
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-40 object-cover rounded-lg"
                          />
                        </div>
                        <div className="md:w-3/4 flex flex-col">
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {item.title}
                            </h3>
                            <button
                              onClick={() => dispatch(toggleLike(item.id))}
                              className={`text-xl ${isLiked ? 'text-red-500' : 'text-gray-400'}`}
                            >
                              {isLiked ? <FaHeart /> : <FaRegHeart />}
                            </button>
                          </div>
                          <p className="text-gray-600 text-sm mt-1">
                            {item.description.slice(0, 80)}...
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <p className="text-lg font-bold text-indigo-600">
                              {item.price} so'm
                            </p>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => dispatch(decreaseQuantity(item.id))}
                                className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                              >
                                -
                              </button>
                              <span className="w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleIncreaseQuantity(item)}
                                className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="flex-1 py-2 bg-red-100 text-red-600 rounded-lg flex items-center justify-center gap-2 hover:bg-red-200 transition-colors"
                            >
                              <FaTrash /> O'chirish
                            </button>
                            <button
                              onClick={() => handleBuyNow(item)}
                              className="flex-1 py-2 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-200 transition-colors"
                            >
                              <FaShoppingCart /> Sotib olish
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

          {/* Jami hisob qismi */}
          {cartItems.length > 0 && (
            <div className="lg:w-1/3">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Buyurtma xulosasi
                </h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mahsulotlar</span>
                    <span className="text-gray-900">{cartItems.length} ta</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Jami miqdor</span>
                    <span className="text-gray-900">
                      {cartItems.reduce((sum, item) => sum + item.quantity, 0)} ta
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3"></div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Umumiy summa</span>
                    <span className="text-indigo-600">
                      {calculateTotalPrice()} so'm
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleBuyNow(cartItems[0])}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors shadow-md"
                >
                  Buyurtma berish
                </button>
                <button
                  onClick={handleClearCart}
                  className="w-full mt-3 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Savatchani tozalash
                </button>

                {feedbackMessage && (
                  <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
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