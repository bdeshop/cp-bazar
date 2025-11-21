// src/components/login/RegistrationModal.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import toast from "react-hot-toast"; // টোস্ট
import logo_bg from "../../../assets/login_page_image.png";
import loginPGIMG from "../../../assets/loginPGIMG.png";
import b__2 from "../../../assets/22221.png";

const RegistrationModal = ({ onClose, openLogin, initialReferral }) => {
  const [username, setUsername] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // রেফারেল কোড অটো ফিল
  useEffect(() => {
    if (initialReferral) {
      setReferralCode(initialReferral);
    }
  }, [initialReferral]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // ফর্ম ভ্যালিডেশন
    if (!username || !whatsapp || !password || !confirmPassword) {
      setError("All fields are required");
      toast.error("All fields are required");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      toast.error("Password must be at least 6 characters");
      setLoading(false);
      return;
    }
    if (!agree) {
      setError("You must agree to the terms and conditions");
      toast.error("You must agree to the terms and conditions");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/main/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email: `${username}@temp.com`,
          whatsapp,
          password,
          referral: referralCode || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // localStorage এ সেভ
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userId", data.user.id);

      // AuthContext আপডেট
      setUser(data.user);

      // সফল টোস্ট
      toast.success(`Registration successful! Welcome: ${data.user.username}`);

      // মোডাল বন্ধ
      onClose();

      // রিডাইরেক্ট
      if (data.user.role === "user") {
        navigate("/");
      } else {
        navigate("/pending-approval");
      }
    } catch (err) {
      const errorMsg = err.message || "Registration failed. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full md:w-[740px] h-[750px] bg-center bg-cover bg-no-repeat rounded-2xl shadow-2xl overflow-hidden relative bg-white/10 backdrop-blur-md"
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
          <img src={logo_bg} alt="Banner" className="w-full h-full object-cover rounded-l-xl" />
        </div>

        {/* Right Form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center bg-white/10 backdrop-blur-md">
          <h2 className="text-yellow-400 text-2xl font-bold mb-6 tracking-tight text-center">
            Register
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

            {/* WhatsApp */}
            <input
              type="text"
              placeholder="Mobile Number (WhatsApp)"
              className="w-full bg-gray-800/50 text-gray-100 px-4 py-3 rounded-lg border border-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none transition"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
              disabled={loading}
            />

            {/* Referral Code */}
            <div className="relative">
              <input
                type="text"
                placeholder="Referral Code (Optional)"
                className={`w-full bg-gray-800/50 text-gray-100 px-4 py-3 rounded-lg border ${
                  initialReferral ? "border-teal-500" : "border-white"
                } focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none transition`}
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                readOnly={!!initialReferral}
                disabled={loading}
              />
              {initialReferral && (
                <p className="absolute -bottom-5 left-0 text-xs text-teal-300">
                  Auto-filled (from link)
                </p>
              )}
            </div>

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

            {/* Confirm Password */}
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full bg-gray-800/50 text-gray-100 px-4 py-3 rounded-lg border border-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none transition"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />

            {/* Agree Checkbox */}
            <div className="flex items-center">
              <label className="flex items-center text-sm text-gray-100">
                <input
                  type="checkbox"
                  className="mr-2 h-4 w-4 text-teal-500 border-gray-600 rounded focus:ring-teal-500"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  disabled={loading}
                />
                I am 18+ years old and agree to the terms and conditions
              </label>
            </div>

            {/* Submit Button */}
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
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </button>

            {/* Login Link */}
            <p className="text-sm text-gray-100 flex items-center justify-center">
              Already have an account?{" "}
              <span
                className="text-teal-300 underline cursor-pointer hover:text-teal-200 transition ml-1"
                onClick={() => {
                  onClose();
                  openLogin();
                }}
              >
                Login
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationModal;