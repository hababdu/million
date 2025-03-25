import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toggleLike } from "../redux/likeSlice";
import axios from "axios";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const SkeletonLoader = () => (
  <div className=" rounded-lg shadow-sm overflow-hidden relative animate-pulse bg-gray-200">
    <div className="w-full h-48 bg-gray-300"></div>
    <div className="p-3">
      <div className="h-6 bg-gray-400 mb-2"></div>
      <div className="h-4 bg-gray-400 mb-2"></div>
      <div className="h-4 bg-gray-400 mb-2 w-1/2"></div>
    </div>
  </div>
);

function Likes() {
  const dispatch = useDispatch();
  const likedProducts = useSelector((state) => state.likes.likedProducts);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("https://dummyjson.com/products?limit=194")
      .then((response) => {
        setProducts(response.data.products);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  }, []);

  const likedItems = products.filter((product) =>
    likedProducts.includes(product.id)
  );

  const confirmUnlike = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleUnlike = () => {
    if (selectedProduct) {
      dispatch(toggleLike(selectedProduct.id));
      setShowModal(false);
      setSelectedProduct(null);
    }
  };

  const handleNavi = (product) => {
    navigate("/full", { state: { product } });
  };

  return (
    <div className="p-4 text-gray-950">
      <h2 className="text-xl font-bold mb-3">Sevimli Mahsulotlar</h2>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Yuklanayotgan paytda skeletlar */}
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonLoader key={index} />
          ))}
        </div>
      ) : likedItems.length === 0 ? (
        <p>Sevimli mahsulotlaringiz yo‘q</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {likedItems.map((product) => {
            const isLiked = likedProducts.includes(product.id);
            const discountedPrice = (
              product.price * (1 - product.discountPercentage / 100)
            ).toFixed(2);

            return (
              <div
                key={product.id}
                className="relative max-w-xs  rounded-lg shadow-lg cursor-pointer"
              >
                <button
                  onClick={() => confirmUnlike(product)}
                  className="absolute z-0 top-2 right-2 text-yellow-400 text-xl"
                >
                  {isLiked ? <FaHeart /> : <FaRegHeart />}
                </button>
                <img
                  onClick={() => {
                    handleNavi(product);
                  }}
                  src={product.thumbnail}
                  alt={product.title}
                  className="rounded-md w-full h-40 object-cover"
                />

                <div
                  onClick={() => {
                    handleNavi(product);
                  }}
                  className="flex justify-between items-end p-2"
                >
                  <div>
                    <h2 className="text-sm md:text-base lg:text-lg text-gray-700 font-semibold mt-2">
                      {product.title}
                    </h2>
                    <p className="text-gray-500 text-xs md:text-sm lg:text-base">
                      {product.category}
                    </p>
                    <p className="text-gray-700 text-xs md:text-sm lg:text-base">
                      {product.brand}
                    </p>
                    <div className="mt-1">
                      <p className="text-gray-400 line-through text-xs md:text-sm lg:text-base">
                        ${product.price}
                      </p>
                      <p className="text-red-600 font-semibold text-sm md:text-base lg:text-lg">
                        ${discountedPrice}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center mt-1">
                    {[...Array(Math.round(product.rating))].map((_, i) => (
                      <span
                        key={i}
                        className="text-yellow-500 text-xs md:text-sm lg:text-base"
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal oyna */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-semibold">Mahsulotni o‘chirish</h3>
            <p className="text-gray-700 mt-2">
              "{selectedProduct.title}" ni sevimlilardan o‘chirmoqchimisiz?
            </p>
            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={handleUnlike}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Ha, o‘chirish
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Likes;
