import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    birthDate: "",
    profileImage: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.birthDate || !formData.password || !formData.confirmPassword) {
      setError("Barcha maydonlarni to‘ldiring!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Parollar mos kelmadi!");
      return;
    }

    // 📌 Foydalanuvchi ma’lumotlarini localStorage-ga saqlash
    const userData = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      birthDate: formData.birthDate,
      profileImage: formData.profileImage || "https://via.placeholder.com/150", // Agar rasm URL kiritilmasa, default rasm
    };
    localStorage.setItem("user", JSON.stringify(userData));

    console.log("Ro‘yxatdan o‘tish muvaffaqiyatli:", userData);
    navigate("/profile");
  };

  return (
    <div className="flex text-gray-900 justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Ro‘yxatdan o‘tish</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">To‘liq ism</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Telefon</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Manzil</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Tug‘ilgan sana</label>
            <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Profil rasmi (URL)</label>
            <input type="text" name="profileImage" value={formData.profileImage} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Rasm URL kiritish majburiy emas" />
          </div>

          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
            Ro‘yxatdan o‘tish
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
