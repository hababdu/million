import React, { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchProducts, increaseLimit } from "../redux/productSlice";
import { addViewedProduct } from "../redux/productSliceHistory";
import { toggleLike } from "../redux/likeSlice";
import { FaHeart } from "react-icons/fa";
import Mlogo from "../assets/mlogo.svg";

const Browse = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const observer = useRef();

  const category = location.state?.category;
  const { products, loading, error, limit } = useSelector((state) => state.products);
  const { likedProducts } = useSelector((state) => state.likes);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const filteredProducts = category 
    ? products.filter((product) => product.category === category) 
    : products;

  const handleNavi = (product) => {
    dispatch(addViewedProduct(product));
    navigate("/full", { state: { product } });
  };

  const lastProductRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          dispatch(increaseLimit());
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, dispatch]
  );

  return (
    <div className="container mx-auto p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl py-5 font-bold text-purple-400">
        {category ? `${category} mahsulotlari` : "Barcha mahsulotlar"}
      </h1>

      {error && <p className="text-center text-red-400">Xatolik: {error}</p>}
      {!loading && filteredProducts.length === 0 && (
        <p className="text-center text-gray-400">Mahsulotlar topilmadi</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredProducts.slice(0, limit).map((product, index) => (
          <div
            key={product.id}
            ref={index === filteredProducts.slice(0, limit).length - 1 ? lastProductRef : null}
            className="relative bg-gray-800 hover:bg-gray-700 transition-colors duration-300 text-white rounded-xl shadow-lg overflow-hidden p-4 group"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch(toggleLike(product.id));
              }}
              className="absolute top-2 right-2 text-lg z-10"
            >
              <FaHeart 
                className={
                  likedProducts.includes(product.id) 
                    ? "text-red-500 hover:text-red-400" 
                    : "text-gray-400 hover:text-red-400"
                }
              />
            </button>
            
            <img
              src={product.thumbnail}
              alt={product.title}
              className="w-full h-40 object-cover rounded-md cursor-pointer transform group-hover:scale-105 transition-transform duration-300"
              onClick={() => handleNavi(product)}
            />
            
            <div onClick={() => handleNavi(product)} className="mt-3 cursor-pointer">
              <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-purple-300 transition-colors">
                {product.title}
              </h3>
              <div className="flex items-center mt-1">
                <p className="line-through text-xs mr-2 text-gray-400">${product.price}</p>
                <p className="font-bold text-sm text-purple-400">
                  ${(product.price * (1 - product.discountPercentage / 100)).toFixed(2)}
                </p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="rounded-full p-0.5 bg-white shadow-md">
                  <img src={Mlogo} className="w-4 h-4" alt="logo" />
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      className={`text-xs ${
                        i < Math.round(product.rating) 
                          ? 'text-yellow-400' 
                          : 'text-gray-500'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Browse;