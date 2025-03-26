import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../redux/authSlice";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleRegister = () => {
    dispatch(registerUser({ email, password }));
  };

  return (
    <div>
      <h2>Register</h2>
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleRegister} disabled={loading}>
        {loading ? "Loading..." : "Register"}
      </button>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Register;
