import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { toast } from "react-hot-toast";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
// Reytingni hisoblash algoritmi
const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
  return (totalRating / reviews.length).toFixed(2);
};

// Chegirmali narxni hisoblash
const calculateDiscountPrice = (price, discountPercentage) =>
  (price - (price * discountPercentage) / 100).toFixed(2);

// Aktsiya mavjudligini tekshirish
const isOnSale = (price, discountedPrice) => price > discountedPrice;

function FullProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(location.state?.product || null);
  const [loading, setLoading] = useState(!product);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product) {
      setLoading(true);
      fetch(`https://dummyjson.com/products/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Serverdan ma'lumot olishda xatolik");
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

  // Check if the product is available before accessing its properties
  if (loading)
    return <p className="text-center text-gray-500">⏳ Yuklanmoqda...</p>;
  if (error)
    return <p className="text-center text-red-500">❌ Xatolik: {error}</p>;
  if (!product)
    return <p className="text-center text-gray-500">Mahsulot topilmadi</p>;

  const averageRating = calculateAverageRating(product.reviews);
  const discountedPrice = calculateDiscountPrice(
    product.price,
    product.discountPercentage
  );
  const saleMessage = isOnSale(product.price, discountedPrice)
    ? "🚨 Limited time offer!"
    : "✅ In stock";

  const handleAddToCart = () => {
    const cartItem = { ...product, quantity };
    dispatch(addToCart(cartItem));
    toast.success(`${product.title} (${quantity} dona) savatchaga qo‘shildi!`);
  };

  // Quantity oshirish funksiyasi
  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  // Quantity kamaytirish funksiyasi
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="container mx-auto text-gray-900 p-4 mb-15 bg-gray-50 min-h-screen">
      {/* Orqaga tugma */}
      <button
        onClick={() => navigate(-1)}
        className="absolute bg-white top-4 left-4 flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
      >
        <ArrowUturnLeftIcon className="h-6 w-6" />
        <span className="text-sm font-semibold">Orqaga</span>
      </button>
      <h1 className="text-3xl font-bold text-center text-gray-900">
        {product.title}
      </h1>

      <div className="flex w-full flex-col lg:flex-row gap-6 mt-6">
        <div className="flex w-full flex-col gap-4 lg:w-1/3">
          <img
            src={product.thumbnail}
            alt={product.title}
            className="h-64 md:h-80 rounded-lg shadow-lg border border-gray-300"
          />
          <div className="flex gap-2 justify-center overflow-x-auto">
            {product.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Image ${index}`}
                className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg shadow-md border border-gray-300 cursor-pointer hover:opacity-80"
              />
            ))}
          </div>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={decreaseQuantity}
              className="px-4 py-2 bg-gray-200 text-gray-800 text-xl rounded-md hover:bg-gray-300"
            >
              -
            </button>
            <span className="text-lg text-gray-800 font-semibold">
              {quantity}
            </span>
            <button
              onClick={increaseQuantity}
              className="px-4 py-2 bg-gray-200 text-gray-800 text-xl rounded-md hover:bg-gray-300"
            >
              +
            </button>
            <span className="text-sm text-gray-600">
              ({product.stock} dona mavjud)
            </span>
          </div>
        </div>

        <div className="w-full lg:w-1/2 space-y-4">
          <p className="text-gray-700">{product.description}</p>
          <div className="text-lg text-red-600 font-semibold line-through">
            {product.price} so'm
          </div>
          <div className="text-lg text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-md">
            {discountedPrice} so'm (-{product.discountPercentage}%)
          </div>
          <div className="text-lg font-semibold text-yellow-500">
            {saleMessage}
          </div>

          <div className="mt-6">
            <div className="font-semibold">Category: {product.category}</div>
            <div className="font-semibold">Brand: {product.brand}</div>
            <div className="font-semibold">SKU: {product.sku}</div>
            <div className="font-semibold">Weight: {product.weight} g</div>
            <div className="font-semibold">
              Dimensions: {product.dimensions.width} x{" "}
              {product.dimensions.height} x {product.dimensions.depth} cm
            </div>
            <div className="font-semibold">
              Warranty: {product.warrantyInformation}
            </div>
            <div className="font-semibold">
              Shipping: {product.shippingInformation}
            </div>
            <div className="font-semibold">
              Availability: {product.availabilityStatus}
            </div>
            <div className="font-semibold">
              Return Policy: {product.returnPolicy}
            </div>
            <div className="font-semibold">
              Min Order Quantity: {product.minimumOrderQuantity}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              onClick={() => navigate("/register")}
            >
              Buy Now
            </button>
            <button
              className="px-6 py-3 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-semibold">
              Reviews (Average Rating: {averageRating})
            </h3>
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((review, index) => (
                <div key={index} className="border-b py-2">
                  <div className="font-semibold">{review.reviewerName}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(review.date).toLocaleDateString()}
                  </div>
                  <div className="text-sm">{review.comment}</div>
                  <div className="text-sm">Rating: {review.rating}</div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No reviews available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FullProduct;
