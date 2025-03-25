import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    birthDate: "",
    profileImage: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.phone ||
      !formData.address ||
      !formData.birthDate
    ) {
      setError("Barcha maydonlarni to‘ldiring!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Parollar mos kelmadi!");
      return;
    }

    // 📌 Ma’lumotlarni LocalStorage-ga saqlash
    localStorage.setItem("user", JSON.stringify(formData));

    navigate("/profile"); // Profil sahifasiga yo‘naltirish
  };

  return (
    <div className="flex text-gray-900 justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Ro‘yxatdan o‘tish</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input type="text" name="fullName" placeholder="To‘liq ism" value={formData.fullName} onChange={handleChange} className="w-full mb-2 px-3 py-2 border rounded-lg" required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full mb-2 px-3 py-2 border rounded-lg" required />
          <input type="password" name="password" placeholder="Parol" value={formData.password} onChange={handleChange} className="w-full mb-2 px-3 py-2 border rounded-lg" required />
          <input type="password" name="confirmPassword" placeholder="Parolni tasdiqlang" value={formData.confirmPassword} onChange={handleChange} className="w-full mb-2 px-3 py-2 border rounded-lg" required />
          <input type="text" name="phone" placeholder="Telefon raqami" value={formData.phone} onChange={handleChange} className="w-full mb-2 px-3 py-2 border rounded-lg" required />
          <input type="text" name="address" placeholder="Manzil" value={formData.address} onChange={handleChange} className="w-full mb-2 px-3 py-2 border rounded-lg" required />
          <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full mb-2 px-3 py-2 border rounded-lg" required />
          <input type="text" name="profileImage" placeholder="Profil rasmi URL" value={formData.profileImage} onChange={handleChange} className="w-full mb-2 px-3 py-2 border rounded-lg" />

          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300">
            Ro‘yxatdan o‘tish
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Akkauntingiz bormi? <span className="text-blue-500 cursor-pointer" onClick={() => navigate("/login")}>Kirish</span>
        </p>
      </div>
    </div>
  );
}

export default Register;
