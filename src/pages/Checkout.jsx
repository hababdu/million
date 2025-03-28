import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  useEffect(() => {
    if (!location.state?.order) {
      toast.error('Order information not found');
      navigate('/');
      return;
    }
    setOrder(location.state.order);
  }, [location, navigate]);

  const handleConfirmPurchase = async () => {
    if (!user) {
      toast.error('Please log in to continue');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    if (!deliveryAddress) {
      toast.error('Please enter delivery address');
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

      if (!response.ok) throw new Error('Purchase confirmation failed');

      const data = await response.json();
      toast.success('Order confirmed successfully!');
      navigate('/order-confirmation', { state: { orderId: data.orderId } });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-8 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="font-medium">Back to shopping</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <h1 className="text-2xl font-bold text-white">Complete Your Purchase</h1>
            <p className="text-indigo-100 mt-1">
              Review your order details and finalize payment
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 p-6">
            {/* Left Column */}
            <div className="md:col-span-2 space-y-6">
              {/* Product Summary */}
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                  Order Summary
                </h2>
                <div className="flex items-start gap-4">
                  <img
                    src={order.thumbnail}
                    alt={order.title}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
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

              {/* Delivery Address */}
              <div className="bg-white p-5 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Delivery Information
                </h2>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Address
                </label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your full delivery address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                  required
                />
              </div>

              {/* Payment Method */}
              <div className="bg-white p-5 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Payment Method
                </h2>
                <div className="space-y-3">
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-indigo-500 bg-indigo-50'
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
                          Credit/Debit Card
                        </h3>
                        <p className="text-sm text-gray-500">
                          Pay with Visa, Mastercard, or other cards
                        </p>
                      </div>
                      <div className="ml-auto flex space-x-2">
                        <div className="h-8 w-12 bg-gray-200 rounded-md"></div>
                        <div className="h-8 w-12 bg-gray-200 rounded-md"></div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-indigo-500 bg-indigo-50'
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
                          Cash on Delivery
                        </h3>
                        <p className="text-sm text-gray-500">
                          Pay when you receive your order
                        </p>
                      </div>
                      <div className="ml-auto">
                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="md:col-span-1">
              <div className="bg-white p-5 rounded-xl border border-gray-200 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Order Total
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">
                      ${(order.totalPrice / order.quantity).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity</span>
                    <span className="text-gray-900">{order.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">$5.00</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-3">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">$2.50</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-3">
                    <span>Total</span>
                    <span className="text-indigo-600">
                      ${(parseFloat(order.totalPrice) + 7.5).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Order Note */}
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Your order will be processed within 24 hours. We'll send you a
                        confirmation email with tracking details.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Confirm Button */}
                <button
                  onClick={handleConfirmPurchase}
                  disabled={loading}
                  className={`w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-md transition-all ${
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
                      Processing...
                    </span>
                  ) : (
                    'Confirm Purchase'
                  )}
                </button>

                {/* Security Info */}
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
                    Secure SSL encrypted payment
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