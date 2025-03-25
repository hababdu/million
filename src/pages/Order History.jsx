import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearViewedProducts, removeViewedProduct } from "../redux/productSliceHistory";
import Modal from '../components/Madal'

function OrderHistory() {
  const dispatch = useDispatch();
  const viewedProducts = useSelector((state) => state.productHistory.viewedProducts);

  const [isModalOpen, setModalOpen] = useState(false); // Modalni ochish uchun holat
  const [productToRemove, setProductToRemove] = useState(null); // O'chiriladigan mahsulot

  const handleRemoveProduct = (productId) => {
    setProductToRemove(productId); // O'chirish uchun mahsulot ID'sini saqlash
    setModalOpen(true); // Modalni ochish
  };

  const confirmRemoveProduct = () => {
    dispatch(removeViewedProduct(productToRemove)); // Mahsulotni o'chirish
    setModalOpen(false); // Modalni yopish
  };

  return (
    <div className="container text-gray-950 mx-auto mb-12">
      <h1 className="text-3xl font-bold mb-5">Ko‘rilgan Mahsulotlar</h1>

      {viewedProducts.length === 0 ? (
        <p className="text-gray-500">Siz hali hech qanday mahsulotni ko‘rmagansiz.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {viewedProducts.map((product, index) => (
            <div key={index} className="rounded-lg shadow-md p-3">
              <img
                src={product.thumbnail}
                alt={product.title}
                className="w-full h-48 object-cover rounded-md"
              />
              <h3 className="text-lg font-semibold mt-2">{product.title}</h3>
              <p className="text-gray-500 text-sm">{product.price}$</p>
              <button
                onClick={() => handleRemoveProduct(product.id)} // O'chirishdan oldin modalni ochish
                className="mt-2 px-2 py-1 bg-red-500 text-white rounded-md"
              >
                O'chirish
              </button>
            </div>
          ))}
        </div>
      )}

      {viewedProducts.length > 0 && (
        <button
          onClick={() => dispatch(clearViewedProducts())}
          className="mt-5 px-4 py-2 bg-red-500 text-white rounded-md"
        >
          Ro‘yxatni tozalash
        </button>
      )}

      {/* Modal komponentini chaqirish */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)} // Modalni yopish funksiyasi
        onConfirm={confirmRemoveProduct} // Mahsulotni o'chirish tasdiqlash
      />
    </div>
  );
}

export default OrderHistory;
