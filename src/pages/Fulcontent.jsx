import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { toast } from "react-hot-toast";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/solid";

// Helper function to calculate average rating
const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
  return (totalRating / reviews.length).toFixed(1);
};

// Calculate discounted price
const calculateDiscountPrice = (price, discountPercentage) =>
  (price - (price * discountPercentage) / 100).toFixed(2);

// Check if product is on sale
const isOnSale = (price, discountedPrice) => price > discountedPrice;

function FullProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [product, setProduct] = useState(location.state?.product || null);
  const [loading, setLoading] = useState(!product);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (!product) {
      setLoading(true);
      fetch(`https://dummyjson.com/products/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch product");
          return res.json();
        })
        .then((data) => {
          setProduct(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id, product]);

  const handleAddToCart = () => {
    const cartItem = { ...product, quantity };
    dispatch(addToCart(cartItem));
    toast.success(`${product.title} (${quantity} dona) savatchaga qo'shildi!`);
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.error("Iltimos, avval ro'yxatdan o'ting yoki tizimga kiring", {
        duration: 4000,
        position: "top-center",
      });
      navigate("/register", { 
        state: { 
          from: location.pathname,
          product: product 
        } 
      });
      return;
    }
    
    const order = { 
      ...product, 
      quantity,
      totalPrice: (calculateDiscountPrice(product.price, product.discountPercentage) * quantity).toFixed(2)
    };
    navigate("/checkout", { state: { order } });
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="text-center py-10">
      <p className="text-red-500 text-lg">❌ {error}</p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Qayta urinish
      </button>
    </div>
  );

  if (!product) return (
    <div className="text-center py-10">
      <p className="text-gray-500 text-lg">Mahsulot topilmadi</p>
    </div>
  );

  const discountedPrice = calculateDiscountPrice(product.price, product.discountPercentage);
  const averageRating = calculateAverageRating(product.reviews);
  const saleMessage = isOnSale(product.price, discountedPrice)
    ? "🏷️ Chegirma!"
    : "✅ Sotuvda";

  return (
    <div className="container mx-auto p-4 mb-15 bg-gray-50 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6"
      >
        <ArrowUturnLeftIcon className="h-5 w-5" />
        <span className="text-sm font-medium">Orqaga</span>
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          {product.title}
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Images */}
          <div className="lg:w-1/2">
            <div className="mb-4">
              <img
                src={product.images[selectedImage]}
                alt={product.title}
                className="w-full h-64 md:h-96 object-contain rounded-lg border border-gray-200"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${product.title} ${idx + 1}`}
                  className={`w-16 h-16 object-cover rounded border cursor-pointer ${selectedImage === idx ? 'border-blue-500' : 'border-gray-200'}`}
                  onClick={() => setSelectedImage(idx)}
                />
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:w-1/2">
            <div className="mb-6">
              <p className="text-gray-700 mb-4">{product.description}</p>
              
              <div className="flex items-center gap-4 mb-4">
                <span className="text-xl font-bold text-gray-900">
                  {discountedPrice} so'm
                </span>
                {product.discountPercentage > 0 && (
                  <span className="text-lg text-gray-500 line-through">
                    {product.price} so'm
                  </span>
                )}
                {product.discountPercentage > 0 && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                    {product.discountPercentage}% chegirma
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-lg ${i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-gray-600 text-sm">
                  ({averageRating} / 5.0)
                </span>
              </div>

              <div className="mb-4">
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  product.stock > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.stock > 0 ? `${product.stock} dona mavjud` : 'Qolmagan'}
                </span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                  {saleMessage}
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">Miqdor:</span>
                <div className="flex items-center border border-gray-300 rounded">
                  <button
                    onClick={decreaseQuantity}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-center w-12">
                    {quantity}
                  </span>
                  <button
                    onClick={increaseQuantity}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={handleBuyNow}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition"
              >
                Hoziroq sotib olish
              </button>
              <button
                onClick={handleAddToCart}
                className="flex-1 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-md transition"
              >
                Savatchaga qo'shish
              </button>
            </div>

            {/* Product Specifications */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Mahsulot xususiyatlari</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600"><span className="font-medium">Kategoriya:</span> {product.category}</p>
                  <p className="text-gray-600"><span className="font-medium">Brend:</span> {product.brand}</p>
                  <p className="text-gray-600"><span className="font-medium">Model:</span> {product.model || 'Mavjud emas'}</p>
                </div>
                <div>
                  <p className="text-gray-600"><span className="font-medium">Kafolat:</span> {product.warranty || '1 yil'}</p>
                  <p className="text-gray-600"><span className="font-medium">Yetkazib berish:</span> 2-3 ish kuni</p>
                  <p className="text-gray-600"><span className="font-medium">Qaytarish:</span> 14 kun ichida</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Fikrlar ({product.reviews.length})</h3>
            <div className="space-y-4">
              {product.reviews.map((review, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{review.reviewerName}</p>
                      <p className="text-gray-500 text-sm">
                        {new Date(review.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FullProduct;