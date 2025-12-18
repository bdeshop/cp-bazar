// src/components/login/RegistrationModal.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import toast from "react-hot-toast";

import loginBG from "../../../assets/loginPGIMG.png";
import bannerImg from "../../../assets/login_page_image.png";
import logo from "../../../assets/22221.png";

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

  useEffect(() => {
    if (initialReferral) {
      setReferralCode(initialReferral);
    }
  }, [initialReferral]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!username || !whatsapp || !password || !confirmPassword) {
      toast.error("All fields are required");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setLoading(false);
      return;
    }
    if (!agree) {
      toast.error("You must agree to the terms and conditions");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/main/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            email: `${username}@temp.com`,
            whatsapp,
            password,
            referral: referralCode || undefined,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userId", data.user.id);
      setUser(data.user);

      toast.success(`Welcome ${data.user.username}`);
      onClose();

      data.user.role === "user" ? navigate("/") : navigate("/pending-approval");
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-[95%] max-w-[900px] h-[600px] rounded-xl overflow-hidden shadow-2xl relative"
      style={{
        backgroundImage: `url(${loginBG})`,
        backgroundSize: "cover",
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-3 right-4 text-xl z-20 w-8 h-8 rounded-full bg-yellow-400 text-black font-bold hover:bg-yellow-300"
      >
        ✕
      </button>

      <div className="flex h-full">
        {/* LEFT IMAGE PANEL */}
        <div className="w-1/2 relative bg-gradient-to-b from-teal-900 to-teal-700">
          <img
            src={bannerImg}
            alt="banner"
            className="w-full h-full "
          />

        
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="w-1/2 bg-[#0b3d3a]/90 px-8 py-6 text-white flex flex-col justify-left">
          <h2 className="text-yellow-400 text-2xl font-bold text-start mb-1">
            Register
          </h2>
          <p className="text-start text-sm mb-4">
            Already have an account?{" "}
            <span
              onClick={() => {
                onClose();
                openLogin();
              }}
              className="text-cyan-300 cursor-pointer"
            >
              Login
            </span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Phone */}
            <input
              type="text"
              placeholder="Phone number"
              className="w-full px-4 py-2 rounded-md bg-[#062c2a] border border-teal-600 focus:outline-none"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              disabled={loading}
            />

            {/* Username */}
            <input
              type="text"
              placeholder="Username"
              className="w-full px-4 py-2 rounded-md bg-[#062c2a] border border-teal-600 focus:outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />

            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 rounded-md bg-[#062c2a] border border-teal-600 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            {/* Confirm Password */}
            <input
              type="password"
              placeholder="Confirm password"
              className="w-full px-4 py-2 rounded-md bg-[#062c2a] border border-teal-600 focus:outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />

            {/* Referral */}
            <input
              type="text"
              placeholder="Referral code (optional)"
              className="w-full px-4 py-2 rounded-md bg-[#062c2a] border border-teal-600 focus:outline-none"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              readOnly={!!initialReferral}
              disabled={loading}
            />

            {/* Agree */}
            <label className="flex items-center text-xs mt-2">
              <input
                type="checkbox"
                className="mr-2 accent-yellow-400"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              I am 18 years old and agree to Terms of Use
            </label>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-800 py-2 rounded-md font-bold"
            >
              {loading ? "Registering..." : "Register"}
            </button>

            {/* Social */}
            <div className="text-center text-sm text-gray-300 mt-2">
              or connect with
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                className="w-1/2 bg-blue-600 py-2 rounded-md"
              >
                Facebook
              </button>
              <button
                type="button"
                className="w-1/2 bg-red-600 py-2 rounded-md"
              >
                Google
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationModal;
