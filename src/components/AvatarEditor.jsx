import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaSave, FaUpload } from "react-icons/fa";

const AvatarEditor = ({ onClose, onSave, darkMode }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Bu yerda avatar saqlash logikasi
    onSave(preview);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={`rounded-xl shadow-2xl p-6 w-full max-w-md ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Profil rasmini yangilash</h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-full ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
              }`}
            >
              <FaTimes />
            </button>
          </div>

          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="w-40 h-40 rounded-full border-4 border-indigo-500 overflow-hidden">
              {preview ? (
                <img
                  src={preview}
                  alt="Yangi avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-500">Rasm tanlanmagan</span>
                </div>
              )}
            </div>

            <label
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                darkMode
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-indigo-500 hover:bg-indigo-600"
              } text-white cursor-pointer transition-colors`}
            >
              <FaUpload /> Rasm tanlash
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={!selectedFile}
              className={`px-4 py-2 rounded-lg flex-1 flex items-center justify-center gap-2 ${
                !selectedFile
                  ? "bg-gray-400 cursor-not-allowed"
                  : darkMode
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-green-500 hover:bg-green-600"
              } text-white transition-colors`}
            >
              <FaSave /> Saqlash
            </button>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg flex-1 ${
                darkMode
                  ? "bg-gray-600 hover:bg-gray-500"
                  : "bg-gray-200 hover:bg-gray-300"
              } transition-colors`}
            >
              Bekor qilish
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AvatarEditor;