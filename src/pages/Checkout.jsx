import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeftIcon,
  CheckIcon,
  MapPinIcon,
  CreditCardIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // Initialize with safe default values
  const [order, setOrder] = useState(() => {
    const defaultOrder = {
      products: [],
      totalPrice: 0,
      shipping: 5.00,
      tax: 2.50,
      grandTotal: 7.50
    };
    
    if (location.state?.order) {
      return {
        ...defaultOrder,
        ...location.state.order,
        grandTotal: (parseFloat(location.state.order.totalPrice || 0) + 7.50).toFixed(2)
      };
    }
    return defaultOrder;
  });
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Uzbekistan',
    paymentMethod: 'card',
    deliveryMethod: 'standard',
    saveInfo: false
  });
  
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  useEffect(() => {
    if (!location.state?.order) {
      toast.error('Buyurtma maʼlumotlari topilmadi');
      navigate('/cart');
    }
  }, [location, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches?.[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    return parts.length ? parts.join(' ') : value;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const orderData = {
        ...order,
        customerInfo: formData,
        paymentMethod: formData.paymentMethod,
        orderDate: new Date().toISOString(),
        orderId: `ORD-${Math.floor(Math.random() * 1000000)}`,
        status: 'processing'
      };

      toast.success('Buyurtma muvaffaqiyatli tasdiqlandi!');
      navigate('/order-confirmation', { 
        state: { order: orderData } 
      });
    } catch (error) {
      toast.error(`Buyurtma tasdiqlanmadi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast.error('Iltimos, barcha kerakli maydonlarni toʻliq kiriting');
      return false;
    }

    if (formData.paymentMethod === 'card') {
      const cardFields = ['number', 'name', 'expiry', 'cvv'];
      const missingCardFields = cardFields.filter(field => !cardDetails[field]);
      
      if (missingCardFields.length > 0) {
        toast.error('Iltimos, karta maʼlumotlarini toʻliq kiriting');
        return false;
      }

      if (cardDetails.number.replace(/\s/g, '').length < 16) {
        toast.error('Karta raqami notoʻgʻri kiritilgan');
        return false;
      }
    }

    return true;
  };

  const formatPrice = (price) => {
    return parseFloat(price || 0).toFixed(2);
  };

  if (!order.products?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
        <div className="text-center max-w-md">
          <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-4">
            Savatchangiz bo'sh
          </h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="font-medium">Orqaga</span>
        </button>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Buyurtmani yakunlang</h1>
          <p className="text-gray-400">To'lov ma'lumotlarini kiriting va buyurtmangizni tasdiqlang</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
                  {activeStep === 1 && (
                    <div className="bg-gray-800 rounded-xl p-6 mb-6">
                    <div className="flex items-center mb-6">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white mr-3">
                      1
                      </div>
                      <h2 className="text-xl font-semibold">
                      Yetkazib berish ma'lumotlari
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                      <label className="block text-sm text-gray-300 mb-2">Ism*</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                      </div>
                      <div>
                      <label className="block text-sm text-gray-300 mb-2">Familiya*</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                      </div>
                      <div>
                      <label className="block text-sm text-gray-300 mb-2">Telefon raqam*</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                      </div>
                      <div className="md:col-span-2">
                      <label className="block text-sm text-gray-300 mb-2">Manzil*</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                      </div>
                      <div>
                      <label className="block text-sm text-gray-300 mb-2">Shahar*</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                      <button
                      onClick={() => {
                        if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((position) => {
                          const { latitude, longitude } = position.coords;
                          toast.success(`Joylashuv aniqlangan: ${latitude}, ${longitude}`);
                        }, () => {
                          toast.error('Joylashuvni aniqlash muvaffaqiyatsiz tugadi');
                        });
                        } else {
                        toast.error('Brauzeringiz joylashuvni qo‘llab-quvvatlamaydi');
                        }
                      }}
                      className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition mr-4"
                      >
                      Joylashuvni aniqlash
                      </button>
                      <button
                      onClick={() => setActiveStep(2)}
                      className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition"
                      >
                      Davom etish
                      </button>
                    </div>
                    </div>
                  )}

                  {/* Step 2: Payment Method */}
            {activeStep === 2 && (
              <div className="bg-gray-800 rounded-xl p-6 mb-6">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white mr-3">
                    2
                  </div>
                  <h2 className="text-xl font-semibold">
                    To'lov usuli
                  </h2>
                </div>

                <div className="space-y-4 mb-8">
                  <div
                    className={`p-5 border rounded-xl cursor-pointer transition-all ${
                      formData.paymentMethod === 'card' ? 'border-purple-500 bg-gray-700' : 'border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => setFormData(prev => ({...prev, paymentMethod: 'card'}))}
                  >
                    <div className="flex items-center">
                      <div className={`h-6 w-6 rounded-full border flex items-center justify-center mr-4 ${
                        formData.paymentMethod === 'card' ? 'bg-purple-500 border-purple-500' : 'border-gray-400'
                      }`}>
                        {formData.paymentMethod === 'card' && <div className="h-3 w-3 rounded-full bg-white"></div>}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Kredit/Debet karta</h3>
                        <p className="text-sm text-gray-400 mt-1">Visa, Mastercard yoki boshqa kartalar</p>
                      </div>
                      <div className="flex space-x-2">
                        <div className="h-8 w-12 bg-blue-900 rounded-md flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-300">VISA</span>
                        </div>
                        <div className="h-8 w-12 bg-yellow-900 rounded-md flex items-center justify-center">
                          <span className="text-xs font-bold text-yellow-300">MC</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-5 border rounded-xl cursor-pointer transition-all ${
                      formData.paymentMethod === 'cash' ? 'border-purple-500 bg-gray-700' : 'border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => setFormData(prev => ({...prev, paymentMethod: 'cash'}))}
                  >
                    <div className="flex items-center">
                      <div className={`h-6 w-6 rounded-full border flex items-center justify-center mr-4 ${
                        formData.paymentMethod === 'cash' ? 'bg-purple-500 border-purple-500' : 'border-gray-400'
                      }`}>
                        {formData.paymentMethod === 'cash' && <div className="h-3 w-3 rounded-full bg-white"></div>}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Yetkazib berishda naqd pul</h3>
                        <p className="text-sm text-gray-400 mt-1">Buyurtmani olganingizda to'lang</p>
                      </div>
                      <div className="h-8 w-8 bg-green-900 rounded-full flex items-center justify-center">
                        <CurrencyDollarIcon className="h-4 w-4 text-green-300" />
                      </div>
                    </div>
                  </div>
                </div>

                {formData.paymentMethod === 'card' && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4">Karta maʼlumotlari</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Karta raqami*</label>
                        <input
                          type="text"
                          name="number"
                          value={formatCardNumber(cardDetails.number)}
                          onChange={handleCardChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-300 mb-2">Amal qilish muddati*</label>
                          <input
                            type="text"
                            name="expiry"
                            value={cardDetails.expiry}
                            onChange={handleCardChange}
                            placeholder="MM/YY"
                            maxLength="5"
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-300 mb-2">CVV*</label>
                          <input
                            type="text"
                            name="cvv"
                            value={cardDetails.cvv}
                            onChange={handleCardChange}
                            placeholder="123"
                            maxLength="3"
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Karta egasi*</label>
                        <input
                          type="text"
                          name="name"
                          value={cardDetails.name}
                          onChange={handleCardChange}
                          placeholder="Ism Familiya"
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={() => setActiveStep(1)}
                    className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition"
                  >
                    Orqaga
                  </button>
                  <button
                    onClick={() => setActiveStep(3)}
                    className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition"
                  >
                    Davom etish
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Order Review */}
            {activeStep === 3 && (
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white mr-3">
                    3
                  </div>
                  <h2 className="text-xl font-semibold">
                    Buyurtmani tasdiqlash
                  </h2>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <MapPinIcon className="h-5 w-5 text-purple-400 mr-2" />
                    Yetkazib berish ma'lumotlari
                  </h3>
                  <div className="bg-gray-700 p-5 rounded-lg">
                    <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                    <p className="text-gray-400 mt-1">{formData.address}</p>
                    <p className="text-gray-400">{formData.city}, {formData.postalCode}, {formData.country}</p>
                    <p className="text-gray-400 mt-3">{formData.phone}</p>
                    <p className="text-gray-400">{formData.email}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    {formData.paymentMethod === 'card' ? (
                      <CreditCardIcon className="h-5 w-5 text-purple-400 mr-2" />
                    ) : (
                      <BanknotesIcon className="h-5 w-5 text-purple-400 mr-2" />
                    )}
                    To'lov usuli
                  </h3>
                  <div className="bg-gray-700 p-5 rounded-lg">
                    <p className="font-medium">
                      {formData.paymentMethod === 'card' ? 'Kredit/Debet karta' : 'Yetkazib berishda naqd pul'}
                    </p>
                    {formData.paymentMethod === 'card' && cardDetails.number && (
                      <p className="text-gray-400 mt-1">•••• •••• •••• {cardDetails.number.slice(-4)}</p>
                    )}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <TruckIcon className="h-5 w-5 text-purple-400 mr-2" />
                    Yetkazib berish
                  </h3>
                  <div className="bg-gray-700 p-5 rounded-lg">
                    <p className="font-medium">Standart yetkazib berish</p>
                    <p className="text-gray-400 mt-1">2-3 ish kuni ichida</p>
                    <p className="text-gray-400">${formatPrice(order.shipping)}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Buyurtma tafsilotlari</h3>
                  <div className="space-y-4">
                    {order.products.map((product) => (
                      <div key={product.id} className="flex items-start gap-4 p-4 bg-gray-700 rounded-lg">
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-600"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{product.title}</h3>
                          <div className="flex justify-between mt-1">
                            <span className="text-gray-400 text-sm">
                              {product.quantity} × ${formatPrice(product.discountedPrice || product.price)}
                            </span>
                            <span className="font-medium">
                              ${formatPrice((product.discountedPrice || product.price) * product.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setActiveStep(2)}
                    className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition"
                  >
                    Orqaga
                  </button>
                  <button
                    onClick={handleSubmitOrder}
                    disabled={loading}
                    className={`px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition ${
                      loading ? 'opacity-80 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Tasdiqlanmoqda...
                      </span>
                    ) : (
                      "Buyurtmani tasdiqlash"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-gray-800 rounded-xl p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-6">Buyurtma xulosasi</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">Mahsulotlar</span>
                  <span>{order.products.length} ta</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Jami miqdor</span>
                  <span>
                    {order.products.reduce((sum, item) => sum + (item.quantity || 1), 0)} ta
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Yetkazib berish</span>
                  <span>${formatPrice(order.shipping)}</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-700">
                  <span className="text-gray-400">Soliq</span>
                  <span>${formatPrice(order.tax)}</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-700 text-lg font-semibold">
                  <span>Jami</span>
                  <span className="text-purple-400">${formatPrice(order.grandTotal)}</span>
                </div>
              </div>

              <div className="bg-purple-900 bg-opacity-20 border-l-4 border-purple-500 p-4 rounded-r-lg mb-6">
                <div className="flex">
                  <ShieldCheckIcon className="h-5 w-5 text-purple-400 mr-2 mt-0.5" />
                  <p className="text-sm text-purple-200">
                    Xavfsiz SSL shifrlangan to'lov. Shaxsiy maʼlumotlaringiz hech qachon uchinchi shaxslar bilan boʻlishilmaydi.
                  </p>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                <p className="mb-2">Buyurtma berish orqali siz bizning <a href="#" className="text-purple-400 hover:underline">Foydalanish shartlari</a> va <a href="#" className="text-purple-400 hover:underline">Maxfiylik siyosati</a>mizga rozilik bildirasiz.</p>
                <p>Buyurtmangiz 24 soat ichida qayta ishlanadi va sizga tasdiqlash xabari yuboriladi.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;