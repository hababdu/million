import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom"; 
import {
  fetchProducts,
  filterByCategory,
  increaseLimit,
} from "../redux/productSlice"; 
import { addViewedProduct } from '../redux/productSliceHistory';
import { toggleLike } from "../redux/likeSlice";
import { FaHeart } from "react-icons/fa";
import Mlogo from '../assets/mlogo.svg';

const SkeletonLoader = () => (
  <div className="border rounded-lg shadow-sm overflow-hidden relative animate-pulse bg-gray-200">
    <div className="w-full h-48 bg-gray-300"></div>
    <div className="p-3">
      <div className="h-6 bg-gray-400 mb-2"></div>
      <div className="h-4 bg-gray-400 mb-2"></div>
      <div className="h-4 bg-gray-400 mb-2 w-1/2"></div>
    </div>
  </div>




);

function Browse() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const category = location.state?.category; // Kategoriya olish
  const { products, loading, error, limit } = useSelector((state) => state.products);
  const { likedProducts } = useSelector((state) => state.likes);

  // Mahsulotlar yuklanishi
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const filteredProducts = category 
    ? products.filter(product => product.category === category) 
    : products; // Kategoriya bo'yicha filtr

  const handleNavi = (product) => {
    dispatch(addViewedProduct(product));
    navigate("/full", { state: { product } });
  };

  return (
    <div className="container mx-auto text-gray-900 mb-13">
      <h1 className="text-3xl text-gray-950 py-5">
        {category ? `${category} mahsulotlari` : "Barcha mahsulotlar"}
      </h1>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Yuklanayotgan paytda skeletlar */}
          {Array.from({ length: limit }).map((_, index) => (
            <SkeletonLoader key={index} />
          ))}
        </div>
      ) : error ? (
        <p className="text-center text-red-500">Xatolik: {error}</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500">Mahsulotlar topilmadi</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredProducts.slice(0, limit).map((product) => (
            <div
              key={product.id}
              className="rounded-lg shadow-sm overflow-hidden relative"
            >
              <button
                onClick={() => dispatch(toggleLike(product.id))}
                className="absolute top-2 right-2 text-xl text-red-500"
              >
                <FaHeart
                  className={
                    likedProducts.includes(product.id)
                      ? "text-red-600"
                      : "text-gray-400"
                  }
                />
              </button>
              <img
                src={product.thumbnail}
                alt={product.title}
                className="w-full h-48 object-cover cursor-pointer"
                onClick={() => handleNavi(product)} // Click orqali productni full sahifasiga yuborish
              />
              <div
                onClick={() => handleNavi(product)} // Click orqali productni full sahifasiga yuborish
                className="p-3"
              >
                <div className="flex justify-between items-end">
                  <h3 className="text-lg text-gray-900 font-semibold">
                    {product.title}
                  </h3>
                </div>
                <p className="text-gray-500 line-through text-sm">{product.price}$</p>
                <p className="text-green-600 font-semibold">
                  ${(
                    product.price *
                    (1 - product.discountPercentage / 100)
                  ).toFixed(2)}
                </p>

                {/* Additional Info */}
                <div className="mt-3 flex justify-between items-center">
                  <div className='rounded-full bg-gray-900'>
                    <img src={Mlogo} className='w-5' alt="" />
                  </div>
                  <div className="flex mt-2">
                    {[...Array(Math.round(product.rating))].map((_, index) => (
                      <span key={index} className="text-yellow-500 text-sm">
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-4">
        <button
          onClick={() => dispatch(increaseLimit())}
          className="px-6 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600"
        >
          Ko'proq ko‘rish
        </button>
      </div>
    </div>
  );
}

export default Browse;
