import React from "react";
import { FaTimes } from "react-icons/fa";

const Modal = ({ isOpen, onClose, onConfirm, darkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className={`rounded-xl shadow-xl p-6 w-full max-w-md border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-semibold ${
            darkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>
            O'chirishni tasdiqlash
          </h3>
          <button 
            onClick={onClose}
            className={darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}
          >
            <FaTimes />
          </button>
        </div>
        <p className={`mb-6 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Bu mahsulotni ro'yxatdan o'chirmoqchimisiz?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className={`px-4 py-2 border rounded-lg transition-colors ${
              darkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Bekor qilish
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg transition-colors ${
              darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
            } text-white`}
          >
            O'chirish
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;