import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/Context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // এটা যোগ করো
import checkImage from "../../../assets/check.8cbcb507.svg";

const CustomNotification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-2xl text-white font-bold text-lg animate-pulse transition-all ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      }`}
    >
      {message}
    </div>
  );
};

const CommonWithdrawContent = ({
  amounts = [],
  selectedProcessTab,
  selectedTab,
  language,
  currentMethod = {},
  userInputs = [],
  minAmount = 200,
  maxAmount = 30000,
}) => {
  const { userId, balance, setBalance } = useContext(AuthContext);
  const navigate = useNavigate(); // নেভিগেটের জন্য

  const [selectedAmount, setSelectedAmount] = useState(amounts[0] || 200);
  const [inputValues, setInputValues] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [loading, setLoading] = useState(false);

  // Reset when method changes
  useEffect(() => {
    if (amounts.length > 0) setSelectedAmount(amounts[0]);
    setInputValues(
      userInputs.reduce((acc, inp) => ({ ...acc, [inp.name]: "" }), {})
    );
    setShowModal(false);
    setTimeLeft(20 * 60);
  }, [selectedTab, amounts, userInputs]);

  // Timer
  useEffect(() => {
    if (!showModal) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setShowModal(false);
          setNotification({
            show: true,
            message: language === "bn" ? "সময় শেষ হয়েছে!" : "Time expired!",
            type: "error",
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showModal, language]);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    if (!selectedAmount) {
      setNotification({
        show: true,
        message:
          language === "bn"
            ? "পরিমাণ নির্বাচন করুন"
            : "Please select an amount",
        type: "error",
      });
      return;
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!userId) {
      setNotification({
        show: true,
        message: "Please login again",
        type: "error",
      });
      return;
    }

    // Required fields check
    for (const input of userInputs) {
      if (input.isRequired === "true" && !inputValues[input.name]?.trim()) {
        setNotification({
          show: true,
          message:
            language === "bn"
              ? `${input.labelBD || input.label} আবশ্যক`
              : `${input.label} is required`,
          type: "error",
        });
        return;
      }
    }

    if (selectedAmount < minAmount || selectedAmount > maxAmount) {
      setNotification({
        show: true,
        message:
          language === "bn"
            ? `পরিমাণ ${minAmount} - ${maxAmount} এর মধ্যে হতে হবে`
            : `Amount must be between ${minAmount} - ${maxAmount}`,
        type: "error",
      });
      return;
    }

    if (Number(balance) < selectedAmount) {
      setNotification({
        show: true,
        message:
          language === "bn" ? "অপর্যাপ্ত ব্যালেন্স" : "Insufficient balance",
        type: "error",
      });
      return;
    }

    setLoading(true);

    const payload = {
      userId,
      paymentMethodId: selectedTab,
      channel: selectedProcessTab,
      amount: selectedAmount,
      userInputs: Object.entries(inputValues).map(([name, value]) => {
        const cfg = userInputs.find((i) => i.name === name);
        return {
          name,
          value: value.trim(),
          label: cfg?.label || "",
          labelBD: cfg?.labelBD || cfg?.label || "",
          type: cfg?.type || "text",
        };
      }),
    };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/withdraw-transaction/request`,
        payload
      );

      // যেকোনো 2xx স্ট্যাটাস মানে সফল
      if (res.status >= 200 && res.status < 300) {
        setNotification({
          show: true,
          message:
            language === "bn"
              ? "উইথড্রয়াল সফলভাবে জমা হয়েছে!"
              : "Withdrawal Request Submitted Successfully!",
          type: "success",
        });

        setBalance((prev) => prev - selectedAmount);
        setShowModal(false);

        setTimeout(() => navigate("/"), 2000);
      }
    } catch (err) {
      // শুধুমাত্র সত্যিকারের এরর (400, 500, নেটওয়ার্ক ডাউন ইত্যাদি)
      console.error("Withdrawal Error:", err);
      setNotification({
        show: true,
        message:
          err.response?.data?.msg || "সার্ভারে সমস্যা হয়েছে, আবার চেষ্টা করুন",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {/* Notification */}
      {notification.show && (
        <CustomNotification
          message={notification.message}
          type={notification.type}
          onClose={() =>
            setNotification({ show: false, message: "", type: "" })
          }
        />
      )}

      {/* Amount Selection */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-3">
          <p className="font-semibold text-lg">
            {language === "bn" ? "উইথড্রয়াল পরিমাণ:" : "Withdrawal Amount:"}
          </p>
          <div className="flex flex-col items-start">
            <div className="flex gap-4 flex-wrap">
              {amounts.map((amount) => (
                <div
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`relative px-4 py-2 rounded border cursor-pointer transition-all ${
                    selectedAmount === amount
                      ? "border-textRed bg-white text-textRed font-bold shadow-md"
                      : "border-textRed border-opacity-40 hover:bg-red-50"
                  }`}
                >
                  {amount}
                  {selectedAmount === amount && (
                    <img
                      src={checkImage}
                      alt="selected"
                      className="w-4 absolute bottom-0 right-0"
                    />
                  )}
                </div>
              ))}
            </div>

            <input
              type="text"
              value={selectedAmount}
              readOnly
              className="mt-4 border p-3 rounded w-full bg-gray-100 text-center font-bold text-lg"
            />

            <p className="mt-3 text-sm font-medium text-textRed">
              {language === "bn"
                ? `সর্বনিম্ন ৳${minAmount} | সর্বোচ্চ ৳${maxAmount}`
                : `Min ৳${minAmount} | Max ৳${maxAmount}`}
            </p>
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={handleApply}
        disabled={loading}
        className="px-6 py-3 rounded-lg text-white font-bold text-lg transition-all hover:scale-105 disabled:opacity-70"
        style={{ backgroundColor: currentMethod.buttonColor || "#d12053" }}
      >
        {loading
          ? language === "bn"
            ? "প্রক্রিয়া চলছে..."
            : "Processing..."
          : language === "bn"
          ? "আবেদন করুন"
          : "Apply Now"}
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div
            className="flex flex-row max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
            style={{
              backgroundColor: currentMethod.backgroundColor || "#ffffff",
            }}
          >
            {/* Left Side */}
            <div className="w-3/5 p-8 text-black">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">
                  {language === "bn"
                    ? "উইথড্রয়াল নিশ্চিত করুন"
                    : "Confirm Withdrawal"}
                </h3>
                <div
                  className={`px-4 py-2 rounded-full bg-black/30 ${
                    timeLeft <= 60 && "animate-pulse"
                  }`}
                >
                  {language === "bn" ? "বাকি সময়:" : "Time left:"}{" "}
                  {formatTime(timeLeft)}
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-4 mb-6">
                <p className="text-lg font-bold">
                  {currentMethod.agentWalletText || "Agent Wallet"}
                </p>
                <p className="text-2xl font-bold mt-2">
                  {currentMethod.agentWalletNumber || "N/A"}
                </p>
              </div>

              <div className="mb-6">
                <p className="font-bold">
                  {language === "bn" ? "নির্দেশনা:" : "Instructions:"}
                </p>
                <div
                  className="mt-2 text-sm leading-relaxed opacity-90"
                  dangerouslySetInnerHTML={{
                    __html:
                      language === "bn"
                        ? currentMethod.instructionBD || "—"
                        : currentMethod.instruction || "—",
                  }}
                />
              </div>

              <hr className="border-white/30 my-6" />

              {userInputs.length > 0 && (
                <div>
                  <p className="font-bold text-lg mb-4">
                    {language === "bn" ? "তথ্য পূরণ করুন" : "Fill Information"}
                  </p>
                  {userInputs.map((input) => (
                    <div key={input.name} className="mb-5">
                      <label className="block font-medium">
                        {language === "bn"
                          ? input.labelBD || input.label
                          : input.label}
                        {input.isRequired === "true" && (
                          <span className="text-red-400 ml-1">*</span>
                        )}
                      </label>
                      <input
                        type={input.type || "text"}
                        name={input.name}
                        value={inputValues[input.name] || ""}
                        onChange={handleInputChange}
                        placeholder={
                          language === "bn"
                            ? input.fieldInstructionBD || "এখানে লিখুন"
                            : input.fieldInstruction || "Enter here"
                        }
                        className="mt-2 w-full px-4 py-3 rounded-lg bg-white border border-black/40 text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-white"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-8 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
                  disabled={loading}
                >
                  {language === "bn" ? "বাতিল" : "Cancel"}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-3 rounded-lg text-white font-bold transition hover:scale-105 disabled:opacity-70"
                  style={{
                    backgroundColor: currentMethod.buttonColor || "#d12053",
                  }}
                >
                  {loading
                    ? language === "bn"
                      ? "জমা হচ্ছে..."
                      : "Submitting..."
                    : language === "bn"
                    ? "নিশ্চিত করুন"
                    : "Confirm Withdrawal"}
                </button>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="w-2/5 flex items-center justify-center p-8">
              {currentMethod.Image ? (
                <img
                  src={`${import.meta.env.VITE_API_URL}${currentMethod.Image}`}
                  alt="Payment Method"
                  className="max-h-64 rounded-xl shadow-2xl object-contain border border-black/20"
                  onError={(e) => (e.target.src = "/fallback-image.png")}
                />
              ) : (
                <div className="text-black text-center text-sm">
                  No Image Available
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommonWithdrawContent;
