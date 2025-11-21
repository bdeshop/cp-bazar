// src/components/login/Login.jsx
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import toast from "react-hot-toast"; // টোস্ট
import logo_bg from "../../../assets/login_page_image.png";
import loginPGIMG from "../../../assets/loginPGIMG.png";
import b__2 from "../../../assets/22221.png";

const Login = ({ onClose, onRegisterClick }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!username || !password) {
      setError("Username and password are required");
      toast.error("Username and password are required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // localStorage এ সেভ
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("user", JSON.stringify(data.user));

      // AuthContext আপডেট
      setUser(data.user);

      // সফল টোস্ট
      toast.success(`Welcome, ${data.user.username}!`);

      // মোডাল বন্ধ
      onClose();

      // রোল অনুযায়ী রিডাইরেক্ট
      if (data.user.role === "user" && data.user.isActive) {
        navigate("/");
      } else if (data.user.role === "master-affiliate" && !data.user.isActive) {
        navigate("/");
      } else {
        navigate("/");
      }
    } catch (err) {
      const errorMsg = err.message || "Login failed. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full md:w-[680px] h-[500px] bg-center bg-cover bg-no-repeat rounded-2xl shadow-2xl overflow-hidden relative bg-white/10 backdrop-blur-md"
      style={{ backgroundImage: `url(${loginPGIMG})` }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-yellow-400 text-2xl font-bold hover:text-yellow-300 transition"
        disabled={loading}
      >
        X
      </button>

      <div className="flex h-full">
        {/* Left Banner */}
        <div className="hidden md:flex flex-col items-center justify-center bg-teal-800/50 w-1/2 p-6">
          <img
            src={logo_bg}
            alt="Login Banner"
            className="w-full h-full object-cover rounded-l-xl"
          />
        </div>

        {/* Right Form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center bg-white/10 backdrop-blur-md">
          <h2 className="text-yellow-400 text-2xl font-bold mb-6 tracking-tight text-center">
            Login
          </h2>
          <div className="flex items-center justify-center mb-4">
            <img className="h-30 w-28 m-auto" src={b__2} alt="logo" />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm mb-6 bg-red-500/10 p-3 rounded-lg text-center">
              {error}
            </p>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <input
              type="text"
              placeholder="Username"
              className="w-full bg-gray-800/50 text-gray-100 px-4 py-3 rounded-lg border border-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />

            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-gray-800/50 text-gray-100 px-4 py-3 rounded-lg border border-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />

            {/* Remember + Forgot */}
            <div className="flex justify-between items-center">
              <label className="flex items-center text-sm text-gray-100">
                <input
                  type="checkbox"
                  className="mr-2 h-4 w-4 text-teal-500 border-gray-600 rounded focus:ring-teal-500"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  disabled={loading}
                />
                Remember me
              </label>
              <span className="text-teal-300 text-sm cursor-pointer hover:text-teal-200 transition">
                Forgot Password?
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 font-semibold rounded-lg shadow-md transition flex items-center justify-center ${
                loading
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 hover:from-yellow-500 hover:to-yellow-700"
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>

            {/* Register Link */}
            <p className="text-sm text-gray-100 flex items-center justify-center">
              Don't have an account?{" "}
              <span
                className="text-teal-300 underline cursor-pointer hover:text-teal-200 transition ml-1"
                onClick={() => {
                  onClose();
                  onRegisterClick();
                }}
              >
                Register
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;