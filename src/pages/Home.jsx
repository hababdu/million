import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchProducts } from "../redux/productSlice";
import { addViewedProduct } from '../redux/productSliceHistory';
import { toggleLike } from "../redux/likeSlice";
import { FaHeart } from "react-icons/fa";
import Mlogo from '../assets/mlogo.svg';

// Skeleton Loader for horizontal scrolling
const SkeletonLoader = () => (
  <div className="flex-shrink-0 w-32 h-56 md:w-48 md:h-64 rounded-lg shadow-sm overflow-hidden relative animate-pulse bg-gray-200">
    <div className="w-full h-32 md:h-40 bg-gray-300"></div>
    <div className="p-2">
      <div className="h-4 bg-gray-400 mb-2 rounded"></div>
      <div className="h-3 bg-gray-400 mb-1 rounded"></div>
      <div className="h-3 bg-gray-400 rounded w-3/4"></div>
    </div>
  </div>
);

const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { products, loading, error } = useSelector((state) => state.products);
  const { likedProducts } = useSelector((state) => state.likes);

  const [categoryProducts, setCategoryProducts] = useState({});
  const [shuffledProducts, setShuffledProducts] = useState({});
  const [categories, setCategories] = useState([]);
  
  const category = location.state?.category;

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (products.length > 0) {
      const groupedProducts = {};
      products.forEach(product => {
        if (!groupedProducts[product.category]) {
          groupedProducts[product.category] = [];
        }
        groupedProducts[product.category].push(product);
      });
      
      const shuffled = {};
      Object.keys(groupedProducts).forEach(cat => {
        shuffled[cat] = shuffleArray(groupedProducts[cat]);
      });
      
      setCategoryProducts(groupedProducts);
      setShuffledProducts(shuffled);
      setCategories(Object.keys(groupedProducts));
    }
  }, [products]);

  useEffect(() => {
    if (category) {
      setTimeout(() => {
        const element = document.getElementById(category);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 300);
    }
  }, [category]);

  const handleMoreClick = (category) => {
    navigate("/browse", { state: { category } });
  };

  const handleNavi = (product) => {
    dispatch(addViewedProduct(product));
    navigate("/full", { state: { product } });
  };

  return (
    <div className="mx-auto text-gray-900  ">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 ">Mahsulotlar</h1>

      {loading ? (
        <div className="flex space-x-1 overflow-x-auto pb-4 hide-scrollbar">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonLoader key={index} />
          ))}
        </div>
      ) : error ? (
        <p className="text-center text-red-500 py-4">{error}</p>
      ) : (
        Object.keys(shuffledProducts).map((category) => (
          <div key={category} className=" w-full" id={category}>
            <div className="flex justify-between items-center py-2  px-1">
              <h2 className="text-xl font-bold text-gray-800">{category}</h2>
              <button
                onClick={() => handleMoreClick(category)}
                className="text-sm px-1 py-1 "
              >
                Barchasi &rarr;
              </button>
            </div>
            
            <div className="relative">
              <div className="flex space-x-1 overflow-x-auto hide-scrollbar">
                {shuffledProducts[category].slice(0, 10).map((product) => (
                  <div
                    key={product.id}
                    className="flex-shrink-0 w-32 h-55 md:w-48 md:h-64 rounded-lg shadow-sm overflow-hidden relative bg-white"
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
                            ? "text-red-600"
                            : "text-gray-300 hover:text-red-400"
                        }
                      />
                    </button>

                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-full h-28 md:h-40 object-cover cursor-pointer"
                      onClick={() => handleNavi(product)}
                    />

                    <div
                      onClick={() => handleNavi(product)}
                      className="p-2 cursor-pointer"
                    >
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {product.title}
                      </h3>
                      <div className="flex items-center mt-1">
                        <p className="text-gray-500 line-through text-xs mr-2">
                          ${product.price}
                        </p>
                        <p className="text-green-600 font-semibold text-sm">
                          ${(product.price * (1 - product.discountPercentage / 100)).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <div className="rounded-full p-0.5 bg-gray-900">
                          <img src={Mlogo} className="w-4 h-4" alt="logo" />
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-xs ${i < Math.round(product.rating) ? 'text-yellow-500' : 'text-gray-300'}`}
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
          </div>
        ))
      )}

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default Home;