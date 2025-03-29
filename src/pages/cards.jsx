import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  addToCart,
  removeFromCart,
  decreaseQuantity,
  clearCart,
  applyDiscount,
} from "../redux/cartSlice";
import { toggleLike, addToCompare } from "../redux/likeSlice";
import { FaHeart, FaRegHeart, FaTrash, FaShoppingCart, FaArrowLeft, FaExchangeAlt, FaPercentage } from "react-icons/fa";
import { MdAccessTime, MdLocalOffer } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.cartItems);
  const likedProducts = useSelector((state) => state.likes.likedProducts) || [];
  const comparedProducts = useSelector((state) => state.likes.comparedProducts) || [];
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [showQuickEdit, setShowQuickEdit] = useState(null);
  const [quickQuantity, setQuickQuantity] = useState(1);

  // Yetkazib berish vaqtini hisoblash
  useEffect(() => {
    const calculateDeliveryDate = () => {
      const today = new Date();
      const deliveryDay = new Date(today);
      deliveryDay.setDate(today.getDate() + 3); // 3 kun keyin
      
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      setDeliveryDate(deliveryDay.toLocaleDateString('uz-UZ', options));
    };
    
    calculateDeliveryDate();
  }, []);

  // Tezkor miqdor o'zgartirish uchun
  const handleQuickEdit = (item) => {
    setShowQuickEdit(item.id);
    setQuickQuantity(item.quantity);
  };

  const applyQuickEdit = (item) => {
    if (quickQuantity > 0) {
      const difference = quickQuantity - item.quantity;
      if (difference > 0) {
        dispatch(addToCart({ ...item, quantity: difference }));
      } else {
        for (let i = 0; i < Math.abs(difference); i++) {
          dispatch(decreaseQuantity(item.id));
        }
      }
    }
    setShowQuickEdit(null);
  };

  // Promo-kodni qo'llash
  const handleApplyPromo = () => {
    if (promoCode.trim() === "") {
      toast.error("Promo-kodni kiriting!");
      return;
    }

    if (promoCode.toUpperCase() === "SALE10") {
      dispatch(applyDiscount(10)); // 10% chegirma
      setDiscountApplied(true);
      toast.success("10% chegirma qo'llandi!");
    } else {
      toast.error("Noto'g'ri promo-kod!");
    }
  };

  // Umumiy narxni hisoblash (chegirma bilan)
  const calculateTotalPrice = () => {
    const subtotal = cartItems.reduce((total, item) => {
      const itemPrice = item.discountedPrice || item.price;
      return total + itemPrice * item.quantity;
    }, 0);
    
    return subtotal.toFixed(2);
  };

  // Chegirmalarni hisoblash
  const calculateDiscounts = () => {
    return cartItems.reduce((total, item) => {
      if (item.discountedPrice) {
        return total + (item.price - item.discountedPrice) * item.quantity;
      }
      return total;
    }, 0).toFixed(2);
  };

  // Buyurtma berish
  const handleBuyNow = () => {
    if (cartItems.length === 0) {
      toast.error("Savatchangiz bo'sh!");
      return;
    }

    const order = {
      products: cartItems,
      totalPrice: calculateTotalPrice(),
      totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      discount: calculateDiscounts(),
      deliveryDate
    };

    navigate("/checkout", { state: { order } });
  };

  // Mahsulotni solishtirish uchun qo'shish
  const handleAddToCompare = (product) => {
    if (comparedProducts.length >= 3 && !comparedProducts.includes(product.id)) {
      toast.error("Siz faqat 3 ta mahsulotni solishtirishingiz mumkin!");
      return;
    }
    dispatch(addToCompare(product.id));
    toast.success(
      comparedProducts.includes(product.id) 
        ? "Mahsulot solishtirishdan olib tashlandi" 
        : "Mahsulot solishtirishga qo'shildi",
      {
        icon: comparedProducts.includes(product.id) ? '❌' : '🔍',
      }
    );
  };

  // Mahsulotni tez o'chirish
  const quickRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
    toast.success("Mahsulot savatchadan o'chirildi", {
      icon: '🗑️',
      position: 'bottom-right',
    });
  };

  // Savatchani tozalash
  const handleClearCart = () => {
    if (cartItems.length === 0) {
      toast.error("Savatcha allaqachon bo'sh");
      return;
    }

    if (window.confirm("Haqiqatan ham savatchani tozalamoqchimisiz? Barcha mahsulotlar o'chiriladi!")) {
      dispatch(clearCart());
      setFeedbackMessage("Savatcha tozalandi");
      setTimeout(() => setFeedbackMessage(""), 3000);
      toast.success("Savatcha tozalandi", {
        icon: '🗑️',
        position: 'bottom-right',
      });
    }
  };

  // Mahsulot miqdorini oshirish
  const handleIncreaseQuantity = (item) => {
    dispatch(addToCart({ ...item, quantity: 1 }));
  };

  // Avtomatik takliflar
  const getRecommendations = () => {
    if (cartItems.length === 0) return [];
    
    const category = cartItems[0].category;
    return [
      {
        id: 101,
        title: `${category} uchun aksessuar`,
        price: 49.99,
        thumbnail: "https://via.placeholder.com/150"
      },
      {
        id: 102,
        title: `${category} bilan birga ishlatiladigan mahsulot`,
        price: 29.99,
        thumbnail: "https://via.placeholder.com/150",
        discountedPrice: 24.99
      }
    ];
  };

  const recommendations = getRecommendations();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4 md:p-8">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between mb-4">
        <motion.button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaArrowLeft />
        </motion.button>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FaShoppingCart className="text-indigo-400" />
          Savatcha
        </h2>
        <div className="w-8"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Asosiy savatcha qismi */}
          <div className="lg:w-2/3">
            <motion.div 
              className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-4 md:p-6 border border-gray-700/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="hidden md:flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <FaShoppingCart className="text-indigo-400" />
                  Savatchangiz
                </h2>
                {cartItems.length > 0 && (
                  <motion.span 
                    className="bg-indigo-900/30 text-indigo-300 px-3 py-1 rounded-full text-sm font-medium border border-indigo-800/50"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    {cartItems.length} mahsulot
                  </motion.span>
                )}
              </div>

              {cartItems.length === 0 ? (
                <motion.div 
                  className="flex flex-col items-center justify-center py-10 md:py-16"
                  variants={emptyCartVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="relative mb-4 md:mb-6">
                    <motion.div
                      animate={{ rotate: [-5, 5, -5] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    >
                      <FaShoppingCart className="text-indigo-400 text-5xl md:text-6xl" />
                    </motion.div>
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
                  <motion.button
                    onClick={() => navigate("/")}
                    className="px-5 py-2 md:px-6 md:py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-lg text-sm md:text-base"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Bosh sahifaga qaytish
                  </motion.button>
                </motion.div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  <AnimatePresence>
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.id}
                        className="flex flex-col sm:flex-row gap-3 md:gap-4 p-3 md:p-4 bg-gray-700/50 rounded-lg md:rounded-xl hover:shadow-sm transition-all border border-gray-600/30 hover:border-indigo-500/30"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        whileHover={{ scale: 1.01 }}
                      >
                        {/* Mahsulot rasmi */}
                        <div className="sm:w-1/4 relative">
                          <motion.img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-32 md:h-40 object-cover rounded-lg shadow-sm"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          />
                          {item.discountedPrice && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md flex items-center">
                              <FaPercentage size={10} className="mr-1" />
                              {Math.round((1 - item.discountedPrice / item.price) * 100)}%
                            </div>
                          )}
                        </div>
                        
                        {/* Mahsulot ma'lumotlari */}
                        <div className="sm:w-3/4 flex flex-col">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-base md:text-lg font-semibold text-white line-clamp-1">
                                {item.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                {item.discountedPrice ? (
                                  <>
                                    <span className="text-indigo-300 font-medium text-sm md:text-base">
                                      {item.discountedPrice.toLocaleString()} so'm
                                    </span>
                                    <span className="text-gray-400 text-xs line-through">
                                      {item.price.toLocaleString()} so'm
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-indigo-300 font-medium text-sm md:text-base">
                                    {item.price.toLocaleString()} so'm
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <motion.button
                                onClick={() => handleAddToCompare(item)}
                                className={`text-lg p-1 md:p-2 rounded-full ${
                                  comparedProducts.includes(item.id) 
                                    ? 'text-blue-400 bg-blue-900/30' 
                                    : 'text-gray-400 bg-gray-600/30'
                                } hover:bg-blue-900/40 transition-colors`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Solishtirish"
                              >
                                <FaExchangeAlt size={14} />
                              </motion.button>
                              <motion.button
                                onClick={() => {
                                  dispatch(toggleLike(item.id));
                                  toast.success(
                                    likedProducts.includes(item.id)
                                      ? "Mahsulot sevimlilardan olib tashlandi ❌"
                                      : "Mahsulot sevimlilarga qo'shildi ❤️",
                                    {
                                      position: 'top-right',
                                    }
                                  );
                                }}
                                className={`text-lg p-1 md:p-2 rounded-full ${
                                  likedProducts.includes(item.id) 
                                    ? 'text-red-400 bg-red-900/30' 
                                    : 'text-gray-400 bg-gray-600/30'
                                } hover:bg-red-900/40 transition-colors`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Sevimlilar"
                              >
                                {likedProducts.includes(item.id) ? <FaHeart /> : <FaRegHeart />}
                              </motion.button>
                            </div>
                          </div>
                          
                          <p className="text-gray-400 text-xs md:text-sm mt-1 md:mt-2 line-clamp-2">
                            {item.description}
                          </p>
                          
                          <div className="mt-3 md:mt-4 flex items-center justify-between flex-wrap gap-2">
                            {showQuickEdit === item.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={quickQuantity}
                                  onChange={(e) => setQuickQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                  className="w-16 bg-gray-600 border border-gray-500 rounded-md px-2 py-1 text-white text-sm"
                                />
                                <button
                                  onClick={() => applyQuickEdit(item)}
                                  className="px-2 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                                >
                                  OK
                                </button>
                                <button
                                  onClick={() => setShowQuickEdit(null)}
                                  className="px-2 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
                                >
                                  Bekor qilish
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 border border-gray-500/50 rounded-full px-2 md:px-3 py-1 bg-gray-600/30">
                                  <motion.button
                                    onClick={() => dispatch(decreaseQuantity(item.id))}
                                    className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full hover:bg-indigo-900/30 transition-colors text-gray-300 hover:text-white"
                                    whileTap={{ scale: 0.8 }}
                                  >
                                    -
                                  </motion.button>
                                  <span 
                                    className="w-6 md:w-8 text-center font-medium text-sm md:text-base text-white cursor-pointer"
                                    onClick={() => handleQuickEdit(item)}
                                  >
                                    {item.quantity}
                                  </span>
                                  <motion.button
                                    onClick={() => handleIncreaseQuantity(item)}
                                    className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full hover:bg-indigo-900/30 transition-colors text-gray-300 hover:text-white"
                                    whileTap={{ scale: 0.8 }}
                                  >
                                    +
                                  </motion.button>
                                </div>
                                <button
                                  onClick={() => handleQuickEdit(item)}
                                  className="text-xs text-indigo-300 hover:text-indigo-200"
                                >
                                  Tez o'zgartirish
                                </button>
                              </div>
                            )}
                            
                            <div className="flex gap-2">
                              <motion.button
                                onClick={() => quickRemoveItem(item.id)}
                                className="flex items-center gap-1 md:gap-2 px-3 py-1 md:px-4 md:py-2 bg-red-900/30 text-red-300 rounded-lg hover:bg-red-900/40 transition-colors text-sm md:text-base border border-red-800/30"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                              >
                                <FaTrash size={12} /> O'chirish
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* Taklif qilingan mahsulotlar */}
                  {recommendations.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <MdLocalOffer className="text-yellow-400" />
                        Siz uchun tavsiya etamiz
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {recommendations.map((product) => (
                          <motion.div
                            key={product.id}
                            className="bg-gray-700/50 rounded-lg p-3 border border-gray-600/30 hover:border-indigo-500/30 transition-colors"
                            whileHover={{ y: -3 }}
                          >
                            <div className="flex gap-3">
                              <img 
                                src={product.thumbnail} 
                                alt={product.title}
                                className="w-16 h-16 object-cover rounded-md"
                              />
                              <div>
                                <h4 className="text-sm font-medium text-white line-clamp-1">{product.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  {product.discountedPrice ? (
                                    <>
                                      <span className="text-indigo-300 text-sm">
                                        {product.discountedPrice.toLocaleString()} so'm
                                      </span>
                                      <span className="text-gray-400 text-xs line-through">
                                        {product.price.toLocaleString()} so'm
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-indigo-300 text-sm">
                                      {product.price.toLocaleString()} so'm
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    dispatch(addToCart({ ...product, quantity: 1 }));
                                    toast.success("Mahsulot savatchaga qo'shildi");
                                  }}
                                  className="mt-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded"
                                >
                                  Savatchaga qo'shish
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Buyurtma xulosasi */}
          {cartItems.length > 0 && (
            <div className="lg:w-1/3">
              <motion.div 
                className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-4 md:p-6 sticky top-4 md:top-6 border border-gray-700/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6 pb-3 md:pb-4 border-b border-gray-700/50">
                  Buyurtma xulosasi
                </h3>
                
                {/* Promo-kod kiritish */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-1">Promo-kod</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Promo-kodni kiriting"
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={discountApplied}
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={discountApplied}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        discountApplied 
                          ? 'bg-green-600/30 text-green-300 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {discountApplied ? 'Qo\'llandi' : 'Qo\'llash'}
                    </button>
                  </div>
                </div>
                
                {/* Yetkazib berish vaqti */}
                <div className="flex items-center gap-3 bg-gray-700/30 rounded-lg p-3 mb-4 border border-gray-600/30">
                  <MdAccessTime className="text-indigo-400 text-xl" />
                  <div>
                    <p className="text-xs text-gray-400">Yetkazib berish</p>
                    <p className="text-sm font-medium text-white">{deliveryDate}</p>
                  </div>
                </div>
                
                {/* Xisob-kitob */}
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
                  
                  {calculateDiscounts() > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span className="text-sm md:text-base">Chegirma:</span>
                      <span className="font-medium text-sm md:text-base">
                        -{calculateDiscounts().toLocaleString()} so'm
                      </span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-700/50 my-2 md:my-3"></div>
                  <div className="flex justify-between">
                    <span className="text-gray-300 font-bold text-base md:text-lg">Umumiy summa:</span>
                    <motion.span 
                      className="text-indigo-300 font-bold text-base md:text-lg"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {calculateTotalPrice().toLocaleString()} so'm
                    </motion.span>
                  </div>
                </div>

                {/* Buyurtma tugmalari */}
                <motion.button
                  onClick={handleBuyNow}
                  className="w-full py-2 md:py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-lg flex items-center justify-center gap-2 text-sm md:text-base"
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 5px 15px rgba(99, 102, 241, 0.3)"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Buyurtma berish
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </motion.button>
                
                <div className="flex gap-2 mt-2">
                  <motion.button
                    onClick={handleClearCart}
                    className="flex-1 py-2 md:py-3 bg-gray-700/50 text-gray-300 font-medium rounded-lg hover:bg-gray-600/50 transition-colors flex items-center justify-center gap-2 text-sm md:text-base border border-gray-600/50"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    Savatchani tozalash
                    <FaTrash size={12} />
                  </motion.button>
                  
                  <motion.button
                    onClick={() => navigate("/")}
                    className="flex-1 py-2 md:py-3 bg-gray-700/50 text-gray-300 font-medium rounded-lg hover:bg-gray-600/50 transition-colors flex items-center justify-center gap-2 text-sm md:text-base border border-gray-600/50"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    Xaridni davom ettirish
                  </motion.button>
                </div>

                {feedbackMessage && (
                  <motion.div 
                    className="mt-3 md:mt-4 p-2 md:p-3 bg-green-900/20 text-green-300 rounded-lg text-xs md:text-sm border border-green-800/50 flex items-center gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-green-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {feedbackMessage}
                  </motion.div>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Animation variants
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    x: -50,
    transition: { 
      duration: 0.2 
    } 
  }
};

const emptyCartVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      delay: 0.2,
      duration: 0.5 
    }
  }
};

export default Cart;