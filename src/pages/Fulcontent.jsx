import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, toggleLike } from "../redux/cartSlice";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUturnLeftIcon,
  HeartIcon as HeartOutline,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShoppingBagIcon,
  BoltIcon
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolidFilled,
  StarIcon as StarSolid
} from "@heroicons/react/24/solid";

const FullProduct = () => {
  // State and hooks
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { likedProducts } = useSelector((state) => state.likes);

  const [product, setProduct] = useState(location.state?.product || null);
  const [loading, setLoading] = useState(!product);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [zoomImage, setZoomImage] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  // Helper functions
  const formatDimensions = (dimensions) => {
    if (!dimensions) return "N/A";
    if (typeof dimensions === 'string') return dimensions;
    return `${dimensions.width || 'N/A'} × ${dimensions.height || 'N/A'} × ${dimensions.depth || 'N/A'}`;
  };

  const renderSpecifications = (specs) => {
    if (!specs) return <p className="text-gray-400">No specifications available</p>;
    if (typeof specs === 'string') return <p className="text-gray-300">{specs}</p>;
    
    return Object.entries(specs).map(([key, value]) => (
      <div key={key} className="flex justify-between py-2 border-b border-gray-700">
        <span className="text-gray-400 capitalize">{key}:</span>
        <span className="text-gray-300">
          {typeof value === 'object' ? formatDimensions(value) : value}
        </span>
      </div>
    ));
  };

  // Fetch product data
  useEffect(() => {
    if (!product) {
      setLoading(true);
      fetch(`https://dummyjson.com/products/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load product");
          return res.json();
        })
        .then((data) => {
          setProduct(data);
          setIsLiked(likedProducts.includes(data.id));
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      setIsLiked(likedProducts.includes(product.id));
    }
  }, [id, product, likedProducts]);

  // Cart functions
  const handleAddToCart = () => {
    const cartItem = {
      ...product,
      quantity,
      discountedPrice: calculateDiscountPrice(product.price, product.discountPercentage),
    };
    dispatch(addToCart(cartItem));
    
    toast.custom((t) => (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
      >
        <ShoppingBagIcon className="h-5 w-5" />
        <span>{product.title} added to cart! ({quantity} {quantity > 1 ? 'items' : 'item'})</span>
      </motion.div>
    ));
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.error("Please login or register first", {
        duration: 4000,
        position: "top-center",
      });
      navigate("/login", { 
        state: { 
          from: location.pathname,
          product: product 
        } 
      });
      return;
    }
    
    const order = {
      products: [{
        ...product,
        quantity,
        discountedPrice: calculateDiscountPrice(product.price, product.discountPercentage)
      }],
      totalPrice: (calculateDiscountPrice(product.price, product.discountPercentage) * quantity),
      shipping: "5.00",
      tax: "2.50",
      grandTotal: (calculateDiscountPrice(product.price, product.discountPercentage) * quantity + 7.50).toFixed(2)
    };
    
    navigate("/checkout", { state: { order } });
  };

  // Like function
  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
    dispatch(toggleLike(product.id));
    
    toast.success(
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-2"
      >
        {isLiked ? (
          <>
            <HeartOutline className="h-5 w-5 text-white" />
            <span>Removed from favorites</span>
          </>
        ) : (
          <>
            <HeartSolidFilled className="h-5 w-5 text-red-500" />
            <span>Added to favorites</span>
          </>
        )}
      </motion.div>,
      { duration: 1500 }
    );
  };

  // Quantity functions
  const increaseQuantity = () => {
    if (quantity < (product.stock || 10)) {
      setQuantity(quantity + 1);
      toast.success(
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-sm"
        >
          Quantity: {quantity + 1}
        </motion.div>,
        { duration: 800, position: 'top-center' }
      );
    } else {
      toast.error(`Maximum ${product.stock} items available`);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Image navigation
  const nextImage = () => {
    setSelectedImage((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
    setImageLoading(true);
  };

  const prevImage = () => {
    setSelectedImage((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
    setImageLoading(true);
  };

  // Helper calculations
  const calculateDiscountPrice = (price, discountPercentage) =>
    (price * (1 - (discountPercentage || 0) / 100)).toFixed(2);

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const totalRating = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return (totalRating / reviews.length).toFixed(1);
  };

  // Loading state
  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
      <p className="text-purple-400">Loading product...</p>
    </div>
  );

  // Error state
  if (error) return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-6 rounded-xl max-w-md text-center">
        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2">Error occurred</h3>
        <p className="text-gray-300 mb-4">{error}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
          >
            Try again
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );

  // No product state
  if (!product) return (
    <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-xl text-center">
        <p className="text-gray-400 text-lg">Product not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-purple-600 rounded-lg text-sm hover:bg-purple-700 transition"
        >
          Return to home
        </button>
      </div>
    </div>
  );

  // Calculate product values
  const discountedPrice = calculateDiscountPrice(product.price, product.discountPercentage);
  const isDiscounted = product.discountPercentage > 0;
  const averageRating = calculateAverageRating(product.reviews);

  return (
    <div className="container mx-auto p-4 pb-16 bg-gray-900 min-h-screen text-white">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors"
      >
        <ArrowUturnLeftIcon className="h-5 w-5" />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Main product section */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
        <div className="flex flex-col lg:flex-row gap-8 p-6">
          {/* Images section */}
          <div className="lg:w-1/2">
            <div className="relative mb-4 rounded-lg overflow-hidden bg-gray-700 aspect-square">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={product.images?.[selectedImage] || ''}
                  alt={product.title}
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: imageLoading ? 0.5 : 1,
                    scale: zoomImage ? 2 : 1
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onLoad={() => setImageLoading(false)}
                  onClick={() => setZoomImage(!zoomImage)}
                  className={`w-full h-full object-contain p-4 cursor-${zoomImage ? 'zoom-out' : 'zoom-in'}`}
                />
              </AnimatePresence>
              
              {/* Like button */}
              <button
                onClick={handleLikeToggle}
                className="absolute top-3 right-3 p-2 bg-gray-900 bg-opacity-60 rounded-full backdrop-blur-sm hover:bg-opacity-80 transition"
              >
                {isLiked ? (
                  <HeartSolidFilled className="h-6 w-6 text-red-500" />
                ) : (
                  <HeartOutline className="h-6 w-6 text-white" />
                )}
              </button>
              
              {/* Discount badge */}
              {isDiscounted && (
                <span className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
                  -{product.discountPercentage}%
                </span>
              )}
              
              {/* Image navigation */}
              <button 
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-gray-900 bg-opacity-50 rounded-full hover:bg-opacity-70 transition"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              
              <button 
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-gray-900 bg-opacity-50 rounded-full hover:bg-opacity-70 transition"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
            
            {/* Thumbnail gallery */}
            <div className="flex gap-3  overflow-x-auto py-2 scrollbar-hide">
              {product.images?.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedImage(idx);
                    setImageLoading(true);
                  }}
                  className={`flex-shrink-0 ml-2 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                    selectedImage === idx
                      ? 'border-purple-500 scale-110 ring-2 ring-purple-400'
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.title} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* Product details */}
          <div className="lg:w-1/2">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">
              {product.title}
            </h1>
            
            {/* Tab navigation */}
            <div className="flex border-b border-gray-700 mb-6 overflow-scroll">
              <button
                onClick={() => setActiveTab("description")}
                className={`px-4 py-2 font-medium ${activeTab === "description" ? "text-purple-400 border-b-2 border-purple-400" : "text-gray-400"}`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("specs")}
                className={`px-4 py-2 font-medium ${activeTab === "specs" ? "text-purple-400 border-b-2 border-purple-400" : "text-gray-400"}`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`px-4 py-2 font-medium ${activeTab === "reviews" ? "text-purple-400 border-b-2 border-purple-400" : "text-gray-400"}`}
              >
                Reviews
              </button>
            </div>
            
            {/* Description tab */}
            {activeTab === "description" && (
              <div className="mb-6">
                <p className="text-gray-300 mb-6">{product.description}</p>
                
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-2xl font-bold text-purple-400">
                    ${discountedPrice}
                  </span>
                  {isDiscounted && (
                    <span className="text-lg text-gray-400 line-through">
                      ${product.price}
                    </span>
                  )}
                  {isDiscounted && (
                    <span className="bg-red-900 text-red-200 px-2 py-1 rounded text-sm">
                      {product.discountPercentage}% off
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      i < Math.floor(averageRating) ? (
                        <StarSolid key={i} className="h-5 w-5 text-yellow-400" />
                      ) : (
                        <StarIcon key={i} className="h-5 w-5 text-gray-500" />
                      )
                    ))}
                  </div>
                  <span className="text-gray-400 text-sm">
                    ({averageRating} / 5.0) • {product.reviews?.length || 0} reviews
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.stock > 0 
                      ? 'bg-green-900 text-green-200' 
                      : 'bg-red-900 text-red-200'
                  }`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-900 text-blue-200 text-sm font-medium">
                    {product.brand}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-gray-700 text-gray-300 text-sm font-medium">
                    {product.category}
                  </span>
                </div>
              </div>
            )}
            
            {/* Specifications tab */}
            {activeTab === "specs" && (
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-300">General</h4>
                  <p className="text-gray-400">
                    <span className="font-medium">Brand:</span> {product.brand || 'N/A'}
                  </p>
                  <p className="text-gray-400">
                    <span className="font-medium">Model:</span> {product.model || 'N/A'}
                  </p>
                  <p className="text-gray-400">
                    <span className="font-medium">Category:</span> {product.category || 'N/A'}
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-300">Dimensions</h4>
                  <p className="text-gray-400">
                    <span className="font-medium">Size:</span> {formatDimensions(product.dimensions)}
                  </p>
                  {product.weight && (
                    <p className="text-gray-400">
                      <span className="font-medium">Weight:</span> {product.weight}
                    </p>
                  )}
                  {product.material && (
                    <p className="text-gray-400">
                      <span className="font-medium">Material:</span> {product.material}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-300">Warranty</h4>
                  <p className="text-gray-400">
                    <span className="font-medium">Period:</span> {product.warranty || '1 year'}
                  </p>
                  <p className="text-gray-400">
                    <span className="font-medium">Returns:</span> Within 14 days
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-300">Shipping</h4>
                  <p className="text-gray-400">
                    <span className="font-medium">Time:</span> 2-3 business days
                  </p>
                  <p className="text-gray-400">
                    <span className="font-medium">Cost:</span> $5.00
                  </p>
                </div>
                {product.specifications && (
                  <div className="col-span-full mt-4">
                    <h4 className="font-semibold text-gray-300 mb-2">Additional Specifications</h4>
                    {renderSpecifications(product.specifications)}
                  </div>
                )}
              </div>
            )}
            
            {/* Reviews tab */}
            {activeTab === "reviews" && (
              <div className="mb-6">
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {product.reviews.map((review, index) => (
                      <div key={index} className="bg-gray-700 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-white">{review.reviewerName || 'Anonymous'}</p>
                            <p className="text-gray-400 text-sm">
                              {review.date ? new Date(review.date).toLocaleDateString() : 'No date'}
                            </p>
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              i < (review.rating || 0) ? (
                                <StarSolid key={i} className="h-5 w-5 text-yellow-400" />
                              ) : (
                                <StarIcon key={i} className="h-5 w-5 text-gray-500" />
                              )
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-300">{review.comment || 'No review text'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">No reviews available</p>
                )}
              </div>
            )}
            
            {/* Quantity selector */}
            <div className="mb-8">
              <div className="flex items-center gap-4">
                <span className="text-gray-300 font-medium">Quantity:</span>
                <div className="flex items-center border border-gray-600 rounded-lg overflow-hidden">
                  <button
                    onClick={decreaseQuantity}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 transition disabled:opacity-40"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-center w-12 bg-gray-800 text-gray-200">
                    {quantity}
                  </span>
                  <button
                    onClick={increaseQuantity}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 transition disabled:opacity-40"
                    disabled={quantity >= (product.stock || 10)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={handleBuyNow}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                <BoltIcon className="h-5 w-5" />
                Buy Now
              </button>
              
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                <ShoppingBagIcon className="h-5 w-5" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullProduct;