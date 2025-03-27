import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/authSlice";

const Logout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout({ navigate }));
  };

  return (
    <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-md">
      Logout
    </button>
  );
};

export default Logout;
