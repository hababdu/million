// src/components/Modal.jsx
import React from "react";

const Modal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null; // Modal ochiq bo‘lmasa hech narsa ko‘rsatmaydi

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-5 rounded shadow-md">
        <h2 className="text-lg font-bold mb-4">Tasdiqlash</h2>
        <p>Mahsulotni o‘chirishni istaysizmi?</p>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-md mr-2"
          >
            Bekor qilish
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-md"
          >
            O'chirish
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
