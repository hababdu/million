import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, CheckIcon, MapPinIcon } from '@heroicons/react/24/outline';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    if (!location.state?.order) {
      toast.error('Buyurtma ma\'lumotlari topilmadi');
      navigate('/');
      return;
    }
    setOrder(location.state.order);
  }, [location, navigate]);

  const handleConfirmPurchase = async () => {
    if (!user) {
      toast.error('Davom etish uchun tizimga kiring');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    if (!deliveryAddress) {
      toast.error('Yetkazib berish manzilini kiriting');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://your-api-endpoint.com/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          productId: order.id,
          quantity: order.quantity,
          totalPrice: order.totalPrice,
          paymentMethod,
          deliveryAddress,
        }),
      });

      if (!response.ok) throw new Error('Buyurtmani tasdiqlash muvaffaqiyatsiz');

      const data = await response.json();
      toast.success('Buyurtma muvaffaqiyatli tasdiqlandi!');
      navigate('/order-confirmation', { state: { orderId: data.orderId } });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const detectLocation = () => {
    setLocationLoading(true);
    
    if (!navigator.geolocation) {
      toast.error("Brauzeringiz joylashuvni aniqlashni qo'llab-quvvatlamaydi");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          
          const data = await response.json();
          
          if (data.address) {
            const address = `
              ${data.address.road || ''} ${data.address.house_number || ''},
              ${data.address.city || data.address.town || data.address.village || ''},
              ${data.address.country || ''}
            `.trim();
            
            setDeliveryAddress(address);
            toast.success("Joylashuv muvaffaqiyatli aniqlandi");
          }
        } catch (error) {
          toast.error("Manzilni olishda xatolik yuz berdi");
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        toast.error(`Joylashuvni aniqlashda xatolik: ${error.message}`);
        setLocationLoading(false);
      }
    );
  };

  if (!order) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-8 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="font-medium">Xaridni davom ettirish</span>
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Sarlavha */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <h1 className="text-2xl font-bold text-white">Buyurtmani yakunlang</h1>
            <p className="text-indigo-100 mt-1">
              Buyurtma tafsilotlarini ko'rib chiqing va to'lovni amalga oshiring
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 p-6">
            {/* Chap ustun */}
            <div className="md:col-span-2 space-y-6">
              {/* Mahsulot xulosasi */}
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                  Buyurtma xulosasi
                </h2>
                <div className="flex items-start gap-4">
                  <img
                    src={order.thumbnail}
                    alt={order.title}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200 shadow-sm"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{order.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-600 text-sm">
                        {order.quantity} × ${(order.totalPrice / order.quantity).toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                        {order.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Yetkazib berish manzili */}
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Yetkazib berish ma'lumotlari
                  </h2>
                  <button
                    onClick={detectLocation}
                    disabled={locationLoading}
                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    {locationLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Aniqlanmoqda...
                      </>
                    ) : (
                      <>
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        Joylashuvni aniqlash
                      </>
                    )}
                  </button>
                </div>
                
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yetkazib berish manzili
                </label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="To'liq yetkazib berish manzilini kiriting"
                  className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  rows="3"
                  required
                />
              </div>

              {/* To'lov usuli */}
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  To'lov usuli
                </h2>
                <div className="space-y-3">
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-indigo-500 bg-indigo-50 shadow-md'
                        : 'border-gray-300 hover:border-indigo-300'
                    }`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <div className="flex items-center">
                      <div
                        className={`flex-shrink-0 h-5 w-5 rounded-full border flex items-center justify-center ${
                          paymentMethod === 'card'
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-gray-400'
                        }`}
                      >
                        {paymentMethod === 'card' && (
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">
                          Kredit/Debet karta
                        </h3>
                        <p className="text-sm text-gray-500">
                          Visa, Mastercard yoki boshqa kartalar bilan to'lash
                        </p>
                      </div>
                      <div className="ml-auto flex space-x-2">
                        <div className="h-8 w-12 bg-blue-100 rounded-md flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-800">VISA</span>
                        </div>
                        <div className="h-8 w-12 bg-yellow-100 rounded-md flex items-center justify-center">
                          <span className="text-xs font-bold text-yellow-800">MC</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-indigo-500 bg-indigo-50 shadow-md'
                        : 'border-gray-300 hover:border-indigo-300'
                    }`}
                    onClick={() => setPaymentMethod('cash')}
                  >
                    <div className="flex items-center">
                      <div
                        className={`flex-shrink-0 h-5 w-5 rounded-full border flex items-center justify-center ${
                          paymentMethod === 'cash'
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-gray-400'
                        }`}
                      >
                        {paymentMethod === 'cash' && (
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">
                          Yetkazib berishda naqd pul
                        </h3>
                        <p className="text-sm text-gray-500">
                          Buyurtmani olganingizda to'lang
                        </p>
                      </div>
                      <div className="ml-auto">
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-green-800">$</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* O'ng ustun - Buyurtma xulosasi */}
            <div className="md:col-span-1">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-lg sticky top-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Buyurtma jami
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mahsulot narxi</span>
                    <span className="text-gray-900">
                      ${(order.totalPrice / order.quantity).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Miqdori</span>
                    <span className="text-gray-900">{order.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Yetkazib berish</span>
                    <span className="text-gray-900">$5.00</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-3">
                    <span className="text-gray-600">Soliq</span>
                    <span className="text-gray-900">$2.50</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-3">
                    <span>Jami</span>
                    <span className="text-indigo-600">
                      ${(parseFloat(order.totalPrice) + 7.5).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Buyurtma eslatmasi */}
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Buyurtmangiz 24 soat ichida qayta ishlanadi. Biz sizga kuzatuv tafsilotlari bilan tasdiqlash xabarini yuboramiz.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tasdiqlash tugmasi */}
                <button
                  onClick={handleConfirmPurchase}
                  disabled={loading}
                  className={`w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-md transition-all ${
                    loading ? 'opacity-80 cursor-not-allowed' : 'hover:shadow-lg'
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
                      Jarayonda...
                    </span>
                  ) : (
                    'Buyurtmani tasdiqlash'
                  )}
                </button>

                {/* Xavfsizlik ma'lumoti */}
                <div className="mt-4 flex items-center justify-center text-center">
                  <svg
                    className="h-5 w-5 text-gray-400 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span className="text-xs text-gray-500">
                    Xavfsiz SSL shifrlangan to'lov
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;