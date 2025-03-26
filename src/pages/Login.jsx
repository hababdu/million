import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, googleLogin, logout } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const { user, loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Iltimos, barcha maydonlarni to'ldiring!");
      return;
    }
    dispatch(loginUser({ email, password }));
  };

  const handleGoogleLogin = () => {
    dispatch(googleLogin());
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  if (isAuthenticated) {
    setTimeout(() => navigate("/"), 1000);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-6 w-96">
        <h2 className="text-2xl font-semibold text-center mb-4">Kirish</h2>

        {isAuthenticated ? (
          <div className="text-center">
            <p className="text-green-600">Siz tizimga kirdingiz!</p>
            <p className="text-gray-600 mt-2">{user?.email}</p>
            <button
              onClick={handleLogout}
              className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded transition"
            >
              Chiqish
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 rounded mb-3"
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Parol"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-gray-600"
                >
                  {showPassword ? "👁" : "🙈"}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition"
              >
                {loading ? "Yuklanmoqda..." : "Kirish"}
              </button>
            </form>

            {error && <p className="text-red-500 mt-2 text-center">{error}</p>}

            <button
              onClick={handleGoogleLogin}
              className="mt-4 w-full bg-white border flex items-center justify-center py-2 rounded transition hover:bg-gray-100"
            >
              <img src="/google-logo.png" alt="Google" width="20" className="mr-2" />
              Google bilan kirish
            </button>

            <p className="mt-4 text-center">
              Hisobingiz yo‘qmi? <a href="/register" className="text-blue-500">Ro‘yxatdan o‘tish</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
