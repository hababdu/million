import { useSelector, useDispatch } from "react-redux";
import Logout from "../components/Logout";
import {  FaUserCircle, FaEnvelope, FaIdCard, FaEdit } from "react-icons/fa";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AvatarEditor from "../components/AvatarEditor";

const Profile = () => {
  const user = useSelector((state) => state.auth.user);
  const darkMode = useSelector((state) => state.theme.darkMode);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);

  // Dark mode va yuklanish sozlamalari
  useEffect(() => {
    // Dark mode ni qo'llash
    document.documentElement.classList.toggle('dark', darkMode);
    
    // Yuklanishni simulyatsiya qilish
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [darkMode]);



  const handleEditProfile = () => {
    setIsEditing(!isEditing);
  };

  const handleAvatarUpdate = (newAvatarUrl) => {
    // Bu yerda avatar URL ni yangilash logikasi bo'ladi
    toast.success("Profil rasmi muvaffaqiyatli yangilandi!");
    setShowAvatarEditor(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <motion.div
          className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <motion.div 
      className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
     

      {/* Asosiy Kontent */}
      <motion.div
        className={`p-8 rounded-xl shadow-lg w-full max-w-md mx-4 transition-all duration-300 ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-3">
          <FaUserCircle className="text-indigo-500" />
          Foydalanuvchi Profili
        </h2>

        {user ? (
          <div className="space-y-6">
            {/* Avatar va Tahrirlash */}
            <div className="flex flex-col items-center relative">
              <div className="relative group">
                <img
                  src={user.photoURL || "/default-avatar.png"}
                  alt="Profil rasmi"
                  className="w-40 h-40 rounded-full border-4 border-indigo-500 object-cover shadow-xl cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setShowAvatarEditor(true)}
                  onError={(e) => {
                    e.target.src = "/default-avatar.png";
                  }}
                />
                <motion.button
                  onClick={() => setShowAvatarEditor(true)}
                  className={`absolute bottom-2 right-2 p-2 rounded-full ${
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  } opacity-0 group-hover:opacity-100 transition-opacity`}
                  whileHover={{ scale: 1.1 }}
                >
                  <FaEdit className="text-indigo-500" />
                </motion.button>
              </div>
              <button
                onClick={handleEditProfile}
                className={`mt-4 px-4 py-2 rounded-lg flex items-center gap-2 ${
                  darkMode
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-indigo-500 hover:bg-indigo-600"
                } text-white transition-colors`}
              >
                <FaEdit /> Profilni tahrirlash
              </button>
            </div>

            {/* Profil Ma'lumotlari */}
            <div className={`p-6 rounded-lg transition-all ${
              darkMode ? "bg-gray-700" : "bg-gray-50"
            }`}>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <FaUserCircle className="text-indigo-500 mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold">Ism:</p>
                    {isEditing ? (
                      <input
                        type="text"
                        defaultValue={user.displayName || "Noma'lum"}
                        className={`w-full p-2 rounded border ${
                          darkMode
                            ? "bg-gray-600 border-gray-500"
                            : "bg-white border-gray-300"
                        }`}
                      />
                    ) : (
                      <p>{user.displayName || "Noma'lum"}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <FaEnvelope className="text-indigo-500 mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold">Email:</p>
                    <p>{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <FaIdCard className="text-indigo-500 mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold">Foydalanuvchi ID:</p>
                    <p className="text-sm font-mono break-all">{user.uid}</p>
                  </div>
                </div>
              </div>

              {isEditing && (
                <motion.div
                  className="mt-6 flex gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      darkMode
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-green-500 hover:bg-green-600"
                    } text-white transition-colors flex-1`}
                  >
                    Saqlash
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className={`px-4 py-2 rounded-lg ${
                      darkMode
                        ? "bg-gray-600 hover:bg-gray-500"
                        : "bg-gray-200 hover:bg-gray-300"
                    } transition-colors flex-1`}
                  >
                    Bekor qilish
                  </button>
                </motion.div>
              )}
            </div>

            {/* Chiqish Tugmasi */}
            <div className="flex justify-center mt-6">
              <Logout />
            </div>
          </div>
        ) : (
          <motion.div 
            className="text-center py-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring" }}
          >
            <p className="text-red-500 text-lg mb-6">
              Foydalanuvchi tizimga kirmagan
            </p>
            <button
              onClick={() => navigate("/login")}
              className={`px-6 py-3 rounded-lg font-medium ${
                darkMode 
                  ? "bg-indigo-600 hover:bg-indigo-700" 
                  : "bg-indigo-500 hover:bg-indigo-600"
              } text-white transition-colors flex items-center gap-2 mx-auto`}
            >
              Kirish sahifasiga o'tish
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Avatar Tahrirlash Modali */}
      <AnimatePresence>
        {showAvatarEditor && (
          <AvatarEditor 
            onClose={() => setShowAvatarEditor(false)}
            onSave={handleAvatarUpdate}
            darkMode={darkMode}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;