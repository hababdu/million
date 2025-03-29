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
import { FaHeart, FaRegHeart, FaTrash, FaShoppingCart, FaArrowLeft, FaExchangeAlt, FaPercentage, FaPlus, FaMinus } from "react-icons/fa";
import { MdAccessTime, MdLocalOffer, MdPayment, MdSecurity } from "react-icons/md";
import { IoIosArrowForward } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.cartItems);
  const likedProducts = useSelector((state) => state.likes.likedProducts) || [];
  const comparedProducts = useSelector((state) => state.likes.comparedProducts) || [];
  const [promoCode, setPromoCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [showQuickEdit, setShowQuickEdit] = useState(null);
  const [quickQuantity, setQuickQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("items");
  const [selectedDelivery, setSelectedDelivery] = useState("standard");
  const [showRecommendations, setShowRecommendations] = useState(true);
  const darkMode = useSelector((state) => state.theme.darkMode);
  // Yetkazib berish vaqtini hisoblash
  useEffect(() => {
    const calculateDeliveryDate = () => {
      const today = new Date();
      const deliveryDay = new Date(today);
      deliveryDay.setDate(today.getDate() + (selectedDelivery === "express" ? 1 : 3));
      
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      setDeliveryDate(deliveryDay.toLocaleDateString('uz-UZ', options));
    };
    
    calculateDeliveryDate();
  }, [selectedDelivery]);

  // Tezkor miqdor o'zgartirish
  const handleQuickEdit = (item) => {
    setShowQuickEdit(item.id);
    setQuickQuantity(item.quantity);
  };

  const applyQuickEdit = (item) => {
    if (quickQuantity > 0 && quickQuantity !== item.quantity) {
      dispatch(addToCart({ ...item, quantity: quickQuantity }));
      toast.success(`Miqdor ${quickQuantity} ga o'zgartirildi`);
    }
    setShowQuickEdit(null);
  };

  // Promo-kodni qo'llash
  const handleApplyPromo = () => {
    if (promoCode.trim() === "") {
      toast.error("Iltimos promo-kodni kiriting!");
      return;
    }

    if (promoCode.toUpperCase() === "SALE10") {
      dispatch(applyDiscount(10));
      setDiscountApplied(true);
      toast.success("10% chegirma qo'llandi!");
    } else if (promoCode.toUpperCase() === "SALE20") {
      dispatch(applyDiscount(20));
      setDiscountApplied(true);
      toast.success("20% chegirma qo'llandi!");
    } else {
      toast.error("Noto'g'ri promo-kod!");
    }
  };

  // Narxlarni hisoblash
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const itemPrice = item.discountedPrice || item.price;
      return total + itemPrice * item.quantity;
    }, 0);
  };

  const calculateDiscounts = () => {
    return cartItems.reduce((total, item) => {
      if (item.discountedPrice) {
        return total + (item.price - item.discountedPrice) * item.quantity;
      }
      return total;
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const deliveryCost = selectedDelivery === "express" ? 25000 : 15000;
    return subtotal + deliveryCost;
  };

  // Buyurtma berish
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Savatchangiz bo'sh!");
      return;
    }

    const order = {
      products: cartItems,
      subtotal: calculateSubtotal(),
      discount: calculateDiscounts(),
      delivery: {
        type: selectedDelivery,
        cost: selectedDelivery === "express" ? 25000 : 15000,
        date: deliveryDate
      },
      total: calculateTotal(),
      createdAt: new Date().toISOString()
    };

    navigate("/checkout", { state: { order } });
  };

  // Mahsulotni solishtirishga qo'shish
  const handleAddToCompare = (product) => {
    if (comparedProducts.length >= 3 && !comparedProducts.includes(product.id)) {
      toast.error("Faqat 3 ta mahsulotni solishtirishingiz mumkin!");
      return;
    }
    dispatch(addToCompare(product.id));
    toast.success(
      comparedProducts.includes(product.id) 
        ? "Solishtirishdan olib tashlandi" 
        : "Solishtirishga qo'shildi"
    );
  };

  // Animatsiyalar uchun variantlar
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

  // Taklif qilingan mahsulotlar
  const getRecommendations = () => {
    if (cartItems.length === 0) return [];
    
    const categories = [...new Set(cartItems.map(item => item.category))];
    return categories.flatMap(category => [
      {
        id: `acc_${category}`,
        title: `${category} uchun aksessuar`,
        price: 49900,
        thumbnail: "https://via.placeholder.com/150?text=Aksessuar",
        category
      },
      {
        id: `comp_${category}`,
        title: `${category} bilan mos keladigan mahsulot`,
        price: 79900,
        discountedPrice: 69900,
        thumbnail: "https://via.placeholder.com/150?text=Mos+Mahsulot",
        category
      }
    ]).slice(0, 4);
  };

  const recommendations = getRecommendations();

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}  md:p-8 transition-colors duration-300`}>
    <div className="max-w-7xl mx-auto">
      {/* Sarlavha va navigatsiya */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate(-1)}
            className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
          >
            <FaArrowLeft className={darkMode ? "text-gray-300" : "text-gray-600"} />
          </button>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Savatcha</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className={`${darkMode ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800'} px-3 py-1 rounded-full text-sm`}>
            {cartItems.length} mahsulot
          </span>
        </div>
      </div>
  
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Asosiy savatcha qismi */}
        <div className="lg:w-2/3">
          <motion.div 
            className={`rounded-xl shadow-sm p-4 md:p-6 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Tab navigatsiyasi */}
            <div className={`flex border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} mb-6`}>
              <button
                onClick={() => setActiveTab("items")}
                className={`px-4 py-2 font-medium ${activeTab === "items" 
                  ? `${darkMode ? 'text-indigo-400 border-indigo-400' : 'text-indigo-600 border-indigo-600'} border-b-2` 
                  : darkMode ? 'text-gray-400' : 'text-gray-500'}`}
              >
                Mahsulotlar ({cartItems.length})
              </button>
              <button
                onClick={() => setActiveTab("later")}
                className={`px-4 py-2 font-medium ${activeTab === "later" 
                  ? `${darkMode ? 'text-indigo-400 border-indigo-400' : 'text-indigo-600 border-indigo-600'} border-b-2` 
                  : darkMode ? 'text-gray-400' : 'text-gray-500'}`}
              >
                Keyin sotib olish
              </button>
            </div>
  
            {cartItems.length === 0 ? (
              <motion.div 
                className="flex flex-col items-center justify-center py-16"
                variants={emptyCartVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="relative mb-6">
                  <motion.div
                    animate={{ rotate: [-5, 5, -5] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  >
                    <FaShoppingCart className={`${darkMode ? 'text-indigo-500' : 'text-indigo-400'} text-6xl`} />
                  </motion.div>
                  <div className={`absolute -bottom-2 -right-2 ${darkMode ? 'bg-indigo-700' : 'bg-indigo-600'} p-2 rounded-full`}>
                    <span className="text-white text-lg">0</span>
                  </div>
                </div>
                <p className={`text-xl ${darkMode ? 'text-white' : 'text-gray-700'} font-medium mb-2`}>
                  Savatchangiz bo'sh
                </p>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-6 text-center max-w-md`}>
                  Xarid qilishni boshlash uchun mahsulot qo'shing
                </p>
                <motion.button
                  onClick={() => navigate("/")}
                  className={`px-6 py-3 ${darkMode ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded-lg transition-all shadow-lg`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Bosh sahifaga qaytish
                </motion.button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      className={`flex flex-col sm:flex-row gap-4 p-4 rounded-lg hover:shadow-md transition-all border ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-indigo-500' : 'bg-white border-gray-200 hover:border-indigo-300'}`}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      whileHover={{ scale: 1.005 }}
                    >
                      {/* Mahsulot rasmi */}
                      <div className="sm:w-1/4 relative">
                        <motion.img
                          src={item.thumbnail}
                          alt={item.title}
                          className={`w-full h-40 object-contain rounded-lg p-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
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
                            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} line-clamp-1`}>
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              {item.discountedPrice ? (
                                <>
                                  <span className={`${darkMode ? 'text-indigo-400' : 'text-indigo-600'} font-medium`}>
                                    {item.discountedPrice.toLocaleString()} so'm
                                  </span>
                                  <span className={`text-sm line-through ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {item.price.toLocaleString()} so'm
                                  </span>
                                </>
                              ) : (
                                <span className={`${darkMode ? 'text-indigo-400' : 'text-indigo-600'} font-medium`}>
                                  {item.price.toLocaleString()} so'm
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <motion.button
                              onClick={() => handleAddToCompare(item)}
                              className={`p-2 rounded-full ${
                                comparedProducts.includes(item.id) 
                                  ? darkMode 
                                    ? 'text-blue-400 bg-blue-900' 
                                    : 'text-blue-600 bg-blue-100'
                                  : darkMode 
                                    ? 'text-gray-400 bg-gray-700' 
                                    : 'text-gray-500 bg-gray-100'
                              } ${darkMode ? 'hover:bg-blue-800' : 'hover:bg-blue-200'} transition-colors`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Solishtirish"
                            >
                              <FaExchangeAlt size={14} />
                            </motion.button>
                            <motion.button
                              onClick={() => dispatch(toggleLike(item.id))}
                              className={`p-2 rounded-full ${
                                likedProducts.includes(item.id) 
                                  ? darkMode 
                                    ? 'text-red-400 bg-red-900' 
                                    : 'text-red-500 bg-red-100'
                                  : darkMode 
                                    ? 'text-gray-400 bg-gray-700' 
                                    : 'text-gray-500 bg-gray-100'
                              } ${darkMode ? 'hover:bg-red-800' : 'hover:bg-red-200'} transition-colors`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Sevimlilar"
                            >
                              {likedProducts.includes(item.id) ? <FaHeart /> : <FaRegHeart />}
                            </motion.button>
                          </div>
                        </div>
                        
                        <p className={`text-sm mt-2 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.description}
                        </p>
                        
                        <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
                          {showQuickEdit === item.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                value={quickQuantity}
                                onChange={(e) => setQuickQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className={`w-16 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-700'} border rounded-md px-2 py-1 text-sm`}
                              />
                              <button
                                onClick={() => applyQuickEdit(item)}
                                className={`px-3 py-1 ${darkMode ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white text-sm rounded-md`}
                              >
                                Saqlash
                              </button>
                              <button
                                onClick={() => setShowQuickEdit(null)}
                                className={`px-3 py-1 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} text-sm rounded-md`}
                              >
                                Bekor qilish
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className={`flex items-center gap-2 border ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'} rounded-full px-3 py-1`}>
                                <motion.button
                                  onClick={() => dispatch(decreaseQuantity(item.id))}
                                  className={`w-6 h-6 flex items-center justify-center rounded-full ${darkMode ? 'hover:bg-indigo-800 text-gray-300 hover:text-white' : 'hover:bg-indigo-100 text-gray-600 hover:text-indigo-600'} transition-colors`}
                                  whileTap={{ scale: 0.8 }}
                                >
                                  <FaMinus size={12} />
                                </motion.button>
                                <span 
                                  className={`w-8 text-center font-medium ${darkMode ? 'text-white' : 'text-gray-700'} cursor-pointer`}
                                  onClick={() => handleQuickEdit(item)}
                                >
                                  {item.quantity}
                                </span>
                                <motion.button
                                  onClick={() => dispatch(addToCart({ ...item, quantity: 1 }))}
                                  className={`w-6 h-6 flex items-center justify-center rounded-full ${darkMode ? 'hover:bg-indigo-800 text-gray-300 hover:text-white' : 'hover:bg-indigo-100 text-gray-600 hover:text-indigo-600'} transition-colors`}
                                  whileTap={{ scale: 0.8 }}
                                >
                                  <FaPlus size={12} />
                                </motion.button>
                              </div>
                              <button
                                onClick={() => handleQuickEdit(item)}
                                className={`text-sm ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'} hover:underline`}
                              >
                                Tez o'zgartirish
                              </button>
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            <motion.button
                              onClick={() => dispatch(removeFromCart(item.id))}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border ${darkMode ? 'bg-red-900 hover:bg-red-800 text-red-200 border-red-800' : 'bg-red-100 hover:bg-red-200 text-red-600 border-red-200'}`}
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
                {showRecommendations && recommendations.length > 0 && (
                  <motion.div 
                    className={`mt-8 rounded-xl p-4 border ${darkMode ? 'bg-indigo-900 border-indigo-800' : 'bg-indigo-50 border-indigo-100'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className={`text-lg font-semibold flex items-center gap-2 ${darkMode ? 'text-indigo-200' : 'text-indigo-800'}`}>
                        <MdLocalOffer className={darkMode ? "text-indigo-400" : "text-indigo-600"} />
                        Siz uchun tavsiya etamiz
                      </h3>
                      <button 
                        onClick={() => setShowRecommendations(false)}
                        className={`text-sm ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}
                      >
                        Yopish
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {recommendations.map((product) => (
                        <motion.div
                          key={product.id}
                          className={`rounded-lg p-3 border ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-indigo-500' : 'bg-white border-gray-200 hover:border-indigo-300'} transition-colors`}
                          whileHover={{ y: -3 }}
                        >
                          <div className="flex gap-3">
                            <img 
                              src={product.thumbnail} 
                              alt={product.title}
                              className={`w-16 h-16 object-contain rounded-md p-1 border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                            />
                            <div className="flex-1">
                              <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'} line-clamp-1`}>{product.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                {product.discountedPrice ? (
                                  <>
                                    <span className={`text-sm font-medium ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                      {product.discountedPrice.toLocaleString()} so'm
                                    </span>
                                    <span className={`text-xs line-through ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                      {product.price.toLocaleString()} so'm
                                    </span>
                                  </>
                                ) : (
                                  <span className={`text-sm font-medium ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                    {product.price.toLocaleString()} so'm
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  dispatch(addToCart({ ...product, quantity: 1 }));
                                  toast.success("Savatchaga qo'shildi");
                                }}
                                className={`mt-2 text-xs ${darkMode ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-3 py-1 rounded`}
                              >
                                Qo'shish
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </div>
  
        {/* Buyurtma xulosasi */}
        {cartItems.length > 0 && (
          <div className="lg:w-1/3">
            <motion.div 
              className={`rounded-xl shadow-sm p-4 md:p-6 sticky top-4 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <h3 className={`text-xl font-bold mb-6 pb-4 border-b ${darkMode ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'}`}>
                Buyurtma xulosasi
              </h3>
              
              {/* Promo-kod */}
              <div className="mb-6">
                <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Promo-kod</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo-kodni kiriting"
                    className={`flex-1 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-transparent' 
                      : 'bg-gray-100 border-gray-300 text-gray-700 placeholder-gray-500 focus:ring-indigo-500 focus:border-transparent'}`}
                    disabled={discountApplied}
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={discountApplied}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      discountApplied 
                        ? darkMode 
                          ? 'bg-green-900 text-green-200 cursor-not-allowed' 
                          : 'bg-green-100 text-green-800 cursor-not-allowed'
                        : darkMode 
                          ? 'bg-indigo-700 hover:bg-indigo-600 text-white' 
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {discountApplied ? 'Qo\'llandi' : 'Qo\'llash'}
                  </button>
                </div>
                {!discountApplied && (
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Misol: <span className={`font-mono px-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>SALE10</span> yoki <span className={`font-mono px-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>SALE20</span>
                  </p>
                )}
              </div>
              
              {/* Yetkazib berish turi */}
              <div className="mb-6">
                <h4 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Yetkazib berish usuli</h4>
                <div className="space-y-2">
                  <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${darkMode 
                    ? 'border-gray-700 hover:border-indigo-500' 
                    : 'border-gray-200 hover:border-indigo-300'}`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      checked={selectedDelivery === "standard"}
                      onChange={() => setSelectedDelivery("standard")}
                      className={darkMode ? "text-indigo-500" : "text-indigo-600"}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Standart yetkazish</span>
                        <span className={darkMode ? "text-gray-400" : "text-gray-600"}>15,000 so'm</span>
                      </div>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>3 ish kunida yetkaziladi</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${darkMode 
                    ? 'border-gray-700 hover:border-indigo-500' 
                    : 'border-gray-200 hover:border-indigo-300'}`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      checked={selectedDelivery === "express"}
                      onChange={() => setSelectedDelivery("express")}
                      className={darkMode ? "text-indigo-500" : "text-indigo-600"}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tezkor yetkazish</span>
                        <span className={darkMode ? "text-gray-400" : "text-gray-600"}>25,000 so'm</span>
                      </div>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>1 ish kunida yetkaziladi</p>
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Yetkazib berish vaqti */}
              <div className={`flex items-center gap-3 rounded-lg p-3 mb-6 border ${darkMode 
                ? 'bg-blue-900 border-blue-800' 
                : 'bg-blue-50 border-blue-100'}`}
              >
                <MdAccessTime className={`text-xl ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                <div>
                  <p className={`text-xs ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>Taxminiy yetkazib berish sanasi:</p>
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-blue-800'}`}>{deliveryDate}</p>
                </div>
              </div>
              
              {/* Xisob-kitob */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Mahsulotlar:</span>
                  <span className={darkMode ? "text-gray-300" : "text-gray-800"}>
                    {calculateSubtotal().toLocaleString()} so'm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Yetkazish:</span>
                  <span className={darkMode ? "text-gray-300" : "text-gray-800"}>
                    {selectedDelivery === "express" ? "25,000" : "15,000"} so'm
                  </span>
                </div>
                
                {calculateDiscounts() > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Chegirma:</span>
                    <span className="font-medium">
                      -{calculateDiscounts().toLocaleString()} so'm
                    </span>
                  </div>
                )}
                
                <div className={`border-t my-3 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
                <div className="flex justify-between">
                  <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Umumiy summa:</span>
                  <motion.span 
                    className={`font-bold text-lg ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {calculateTotal().toLocaleString()} so'm
                  </motion.span>
                </div>
              </div>
  
              {/* Xavfsizlik ma'lumotlari */}
              <div className={`flex items-center gap-2 text-xs mb-6 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                <MdSecurity className={darkMode ? "text-green-400" : "text-green-500"} />
                <span>Xavfsiz to'lov tizimi. Ma'lumotlaringiz himoyalangan.</span>
              </div>
  
              {/* Buyurtma tugmalari */}
              <motion.button
                onClick={handleCheckout}
                className={`w-full py-3 ${darkMode 
                  ? 'bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500' 
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600'} text-white font-medium rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 mb-3`}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 5px 15px rgba(99, 102, 241, 0.3)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <MdPayment className="text-lg" />
                Buyurtma berish
                <IoIosArrowForward />
              </motion.button>
              
              <div className="flex gap-3">
                <motion.button
                  onClick={() => dispatch(clearCart())}
                  className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 border ${darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'}`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <FaTrash size={14} />
                  Tozalash
                </motion.button>
                
                <motion.button
                  onClick={() => navigate("/")}
                  className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 border ${darkMode 
                    ? 'bg-gray-800 hover:bg-gray-700 text-indigo-400 border-indigo-700' 
                    : 'bg-white hover:bg-gray-50 text-indigo-600 border-indigo-200'}`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Xaridni davom ettirish
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  </div>
  );
};

export default Cart;