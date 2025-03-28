import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeftIcon,
  CheckIcon,
  MapPinIcon, // LocationMarkerIcon o'rniga MapPinIcon ishlatildi
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
    district: '',
    postalCode: '',
    country: 'Uzbekistan',
    paymentMethod: 'card',
    deliveryMethod: 'standard',
    saveInfo: false,
    location: {
      lat: null,
      lng: null,
      address: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [cities] = useState([
    'Toshkent', 
    'Samarqand', 
    'Buxoro', 
    'Andijon', 
    'Namangan',
    'Fargʻona',
    'Qarshi',
    'Nukus',
    'Xiva',
    'Urganch'
  ]);

  // Shaharga qarab tumanlarni yuklash
  useEffect(() => {
    if (formData.city) {
      const cityDistricts = {
        'Toshkent': ['Mirzo Ulugʻbek', 'Yunusobod', 'Chilonzor', 'Shayxontohur', 'Olmazor'],
        'Samarqand': ['Samarqand shahar', 'Kattaqoʻrgʻon', 'Urgut', 'Narpay'],
        'Buxoro': ['Buxoro shahar', 'Kogon', 'Olot', 'Romitan'],
        'Andijon': ['Andijon shahar', 'Xonabod', 'Asaka', 'Shahrixon'],
        'Namangan': ['Namangan shahar', 'Chortoq', 'Chust', 'Pop'],
        'Fargʻona': ['Fargʻona shahar', 'Margʻilon', 'Quva', 'Qoʻqon'],
        'Qarshi': ['Qarshi shahar', 'Shahrisabz', 'Kitob', 'Koson'],
        'Nukus': ['Nukus shahar', 'Taxtakoʻpir', 'Chimboy', 'Kegeyli'],
        'Xiva': ['Xiva shahar', 'Bogʻot', 'Gurlan', 'Hazorasp'],
        'Urganch': ['Urganch shahar', 'Xonqa', 'Shovot', 'Yangiariq']
      };
      
      setDistricts(cityDistricts[formData.city] || []);
    }
  }, [formData.city]);

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
    
    if (name === 'number') {
      setCardDetails(prev => ({
        ...prev,
        [name]: formatCardNumber(value)
      }));
    } else {
      setCardDetails(prev => ({
        ...prev,
        [name]: value
      }));
    }
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

  const detectLocation = () => {
    setIsDetectingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=uz`
            );
            const data = await response.json();
            
            const address = data.address || {};
            const fullAddress = [
              address.road,
              address.house_number,
              address.neighbourhood,
              address.city_district
            ].filter(Boolean).join(', ');

            setFormData(prev => ({
              ...prev,
              location: {
                lat: latitude,
                lng: longitude,
                address: fullAddress || data.display_name
              },
              address: fullAddress || data.display_name,
              city: address.city || address.town || address.state || prev.city,
              district: address.city_district || address.suburb || prev.district,
              postalCode: address.postcode || prev.postalCode
            }));
            
            toast.success('Joylashuv muvaffaqiyatli aniqlandi!');
          } catch (error) {
            toast.error('Manzilni olishda xatolik yuz berdi');
          } finally {
            setIsDetectingLocation(false);
          }
        },
        (error) => {
          setIsDetectingLocation(false);
          toast.error('Joylashuvni aniqlash muvaffaqiyatsiz tugadi');
        },
        { 
          timeout: 10000,
          maximumAge: 60000,
          enableHighAccuracy: true 
        }
      );
    } else {
      setIsDetectingLocation(false);
      toast.error('Brauzeringiz joylashuvni qo‘llab-quvvatlamaydi');
    }
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const orderData = {
        ...order,
        customerInfo: formData,
        paymentMethod: formData.paymentMethod,
        orderDate: new Date().toISOString(),
        orderId: `ORD-${Math.floor(Math.random() * 1000000)}`,
        status: 'processing',
        deliveryAddress: {
          fullAddress: formData.address,
          city: formData.city,
          district: formData.district,
          postalCode: formData.postalCode,
          country: formData.country,
          coordinates: formData.location
        }
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
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'district'];
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Ism*
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Familiya*
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Elektron pochta*
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Telefon raqam*
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+998"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Viloyat/Shahar*
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      required
                    >
                      <option value="">Tanlang</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Tuman*
                    </label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      required
                      disabled={!formData.city}
                    >
                      <option value="">Tanlang</option>
                      {districts.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      To'liq manzil*
                    </label>
                    <div className="flex gap-2 mb-2">
                      <button
                        type="button"
                        onClick={detectLocation}
                        disabled={isDetectingLocation}
                        className={`flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg ${
                          isDetectingLocation ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                        } transition`}
                      >
                        <MapPinIcon className="h-4 w-4" /> {/* LocationMarkerIcon o'rniga MapPinIcon */}
                        {isDetectingLocation ? 'Aniqlanmoqda...' : 'Joylashuvni aniqlash'}
                      </button>
                    </div>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Ko'cha nomi, uy raqami, kvartira, mo'ljal"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      rows="3"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Pochta indeksi
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Mo'ljal (qo'shimcha)
                      </label>
                      <input
                        type="text"
                        name="landmark"
                        value={formData.landmark}
                        onChange={handleInputChange}
                        placeholder="Masalan, metro bekati, do'kon nomi"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <div></div>
                  <button
                    onClick={() => setActiveStep(2)}
                    className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition"
                    disabled={!formData.firstName || !formData.lastName || !formData.email || 
                             !formData.phone || !formData.address || !formData.city || !formData.district}
                  >
                    Davom etish
                  </button>
                </div>
              </div>
            )}

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

                <div className="space-y-4 mb-6">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="card"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600"
                    />
                    <label htmlFor="card" className="ml-3 flex items-center">
                      <CreditCardIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-300">Kredit karta</span>
                    </label>
                  </div>

                  {formData.paymentMethod === 'card' && (
                    <div className="bg-gray-700 p-4 rounded-lg space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Karta raqami*
                        </label>
                        <input
                          type="text"
                          name="number"
                          value={cardDetails.number}
                          onChange={handleCardChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                          className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Karta egasining ismi*
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={cardDetails.name}
                          onChange={handleCardChange}
                          placeholder="John Doe"
                          className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Amal qilish muddati*
                          </label>
                          <input
                            type="text"
                            name="expiry"
                            value={cardDetails.expiry}
                            onChange={handleCardChange}
                            placeholder="MM/YY"
                            maxLength="5"
                            className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            CVV*
                          </label>
                          <input
                            type="text"
                            name="cvv"
                            value={cardDetails.cvv}
                            onChange={handleCardChange}
                            placeholder="123"
                            maxLength="3"
                            className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="cash"
                      name="paymentMethod"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600"
                    />
                    <label htmlFor="cash" className="ml-3 flex items-center">
                      <BanknotesIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-300">Yetkazib berishda naqd pul</span>
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="click"
                      name="paymentMethod"
                      value="click"
                      checked={formData.paymentMethod === 'click'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600"
                    />
                    <label htmlFor="click" className="ml-3 flex items-center">
                      <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-300">Click</span>
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="payme"
                      name="paymentMethod"
                      value="payme"
                      checked={formData.paymentMethod === 'payme'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600"
                    />
                    <label htmlFor="payme" className="ml-3 flex items-center">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-300">Payme</span>
                    </label>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <TruckIcon className="h-5 w-5 text-purple-400 mr-2" />
                    Yetkazib berish usuli
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="standard"
                        name="deliveryMethod"
                        value="standard"
                        checked={formData.deliveryMethod === 'standard'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600"
                      />
                      <label htmlFor="standard" className="ml-3">
                        <span className="text-gray-300">Standart yetkazish (3-5 ish kuni)</span>
                        <span className="block text-sm text-gray-400">$5.00</span>
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="express"
                        name="deliveryMethod"
                        value="express"
                        checked={formData.deliveryMethod === 'express'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600"
                      />
                      <label htmlFor="express" className="ml-3">
                        <span className="text-gray-300">Tezkor yetkazish (1-2 ish kuni)</span>
                        <span className="block text-sm text-gray-400">$10.00</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center mb-6">
                  <input
                    type="checkbox"
                    id="saveInfo"
                    name="saveInfo"
                    checked={formData.saveInfo}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded"
                  />
                  <label htmlFor="saveInfo" className="ml-3 text-sm text-gray-400">
                    Kelajakdagi buyurtmalar uchun ushbu maʼlumotlarni saqlang
                  </label>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setActiveStep(1)}
                    className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition"
                  >
                    Orqaga
                  </button>
                  <button
                    onClick={() => setActiveStep(3)}
                    className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition"
                    disabled={formData.paymentMethod === 'card' && 
                             (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv)}
                  >
                    Davom etish
                  </button>
                </div>
              </div>
            )}

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
                    <p className="text-gray-400">{formData.district}, {formData.city}, {formData.postalCode}, {formData.country}</p>
                    <p className="text-gray-400 mt-3">{formData.phone}</p>
                    <p className="text-gray-400">{formData.email}</p>
                    {formData.location.lat && (
                      <div className="mt-3 flex items-center text-sm text-gray-400">
                        <MapPinIcon className="h-4 w-4 mr-1" /> {/* LocationMarkerIcon o'rniga MapPinIcon */}
                        <span>
                          Joylashuv: {formData.location.lat?.toFixed(6)}, {formData.location.lng?.toFixed(6)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <CreditCardIcon className="h-5 w-5 text-purple-400 mr-2" />
                    To'lov usuli
                  </h3>
                  <div className="bg-gray-700 p-5 rounded-lg">
                    {formData.paymentMethod === 'card' && (
                      <>
                        <p className="font-medium">Kredit karta</p>
                        <p className="text-gray-400 mt-1">•••• •••• •••• {cardDetails.number.slice(-4)}</p>
                        <p className="text-gray-400">{cardDetails.name}</p>
                      </>
                    )}
                    {formData.paymentMethod === 'cash' && (
                      <p className="font-medium">Yetkazib berishda naqd pul</p>
                    )}
                    {formData.paymentMethod === 'click' && (
                      <p className="font-medium">Click orqali to'lash</p>
                    )}
                    {formData.paymentMethod === 'payme' && (
                      <p className="font-medium">Payme orqali to'lash</p>
                    )}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <TruckIcon className="h-5 w-5 text-purple-400 mr-2" />
                    Yetkazib berish usuli
                  </h3>
                  <div className="bg-gray-700 p-5 rounded-lg">
                    {formData.deliveryMethod === 'standard' && (
                      <p className="font-medium">Standart yetkazish (3-5 ish kuni)</p>
                    )}
                    {formData.deliveryMethod === 'express' && (
                      <p className="font-medium">Tezkor yetkazish (1-2 ish kuni)</p>
                    )}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Buyurtma tarkibi</h3>
                  <div className="bg-gray-700 rounded-lg overflow-hidden">
                    {order.products.map((product) => (
                      <div key={product.id} className="p-4 border-b border-gray-600 flex justify-between">
                        <div className="flex items-center">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-16 h-16 object-cover rounded mr-4"
                          />
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-gray-400 text-sm">Soni: {product.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${formatPrice(product.price * product.quantity)}</p>
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

          <div className="lg:w-1/3">
            <div className="bg-gray-800 rounded-xl p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-6">Buyurtma xulosasi</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">Mahsulotlar</span>
                  <span>${formatPrice(order.totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Yetkazish</span>
                  <span>${formatPrice(order.shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Solik</span>
                  <span>${formatPrice(order.tax)}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-4 mb-6">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Jami</span>
                  <span>${formatPrice(order.grandTotal)}</span>
                </div>
              </div>
              
              <div className="bg-purple-900 bg-opacity-30 border border-purple-700 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-purple-400 mt-0.5 mr-2" />
                  <div>
                    <p className="font-medium text-purple-300">Kafolatli xavfsizlik</p>
                    <p className="text-sm text-purple-400 mt-1">
                      Barcha to'lovlar shifrlangan va xavfsiz. Karta ma'lumotlaringiz hech qachon saqlanmaydi.
                    </p>
                  </div>
                </div>
              </div>
              
              {activeStep === 3 && (
                <div className="bg-green-900 bg-opacity-30 border border-green-700 rounded-lg p-4">
                  <div className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-400 mt-0.5 mr-2" />
                    <div>
                      <p className="font-medium text-green-300">Buyurtma tayyor</p>
                      <p className="text-sm text-green-400 mt-1">
                        "Buyurtmani tasdiqlash" tugmasini bosish orqali siz bizning Foydalanish shartlarimiz va Maxfiylik siyosatimizga rozilik bildirasiz.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;