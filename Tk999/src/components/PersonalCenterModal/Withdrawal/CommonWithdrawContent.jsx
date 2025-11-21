import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import checkImage from "../../../assets/check.8cbcb507.svg";
import { baseURL_For_IMG_UPLOAD } from "@/utils/baseURL";
import { saveWithdrawRequest } from "@/features/withdrawPaymentMethod/withdrawPaymentMethodThunkAndSlice";
import { getBalanceThunk } from "@/features/auth/authSlice";

const CustomNotification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-md shadow-lg text-white ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      }`}
    >
      {message}
    </div>
  );
};

const CommonWithdrawContent = ({
  amounts,
  selectedProcessTab,
  selectedTab,
  language,
  tabsData,
  userInputs,
  minAmount,
  maxAmount,
}) => {
  const dispatch = useDispatch();
  const { withdrawPaymentMethods, withdrawRequestLoading, withdrawRequestError } = useSelector((state) => state.withdrawPaymentGateway || {});
  const { user, token,balance } = useSelector((state) => state.auth || {});
  const [selectedAmount, setSelectedAmount] = useState(amounts[0]);
  const [inputValues, setInputValues] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  // Get current payment method details
  const currentMethod = withdrawPaymentMethods.find((method) => method._id === selectedTab) || {};

  useEffect(() => {
    setSelectedAmount(amounts[0]);
    setInputValues(
      userInputs.reduce((acc, input) => {
        acc[input.name] = "";
        return acc;
      }, {})
    );
    setShowModal(false);
    setTimeLeft(20 * 60); // Reset timer
  }, [selectedProcessTab, amounts, userInputs]);

  // Countdown timer logic
  useEffect(() => {
    if (!showModal || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setShowModal(false);
          setNotification({
            show: true,
            message: language === "bn" ? "মডাল বন্ধ হয়েছে" : "Modal closed due to timeout",
            type: "error",
          });
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showModal, timeLeft, language]);

  // Handle withdraw request error
  useEffect(() => {
    if (withdrawRequestError) {
      setNotification({
        show: true,
        message: language === "bn" ? `ত্রুটি: ${withdrawRequestError}` : `Error: ${withdrawRequestError}`,
        type: "error",
      });
      dispatch({ type: "withdrawPaymentGateway/resetWithdrawRequestState" });
    }
  }, [withdrawRequestError, language, dispatch]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = (e) => {
    e.preventDefault();
    if (!selectedAmount) {
      setNotification({
        show: true,
        message: language === "bn" ? "এমাউন্ট নির্বাচন করুন" : "Please select an amount",
        type: "error",
      });
      return;
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate user authentication
    if (!user?._id || !token) {
      setNotification({
        show: true,
        message: language === "bn" ? "অনুগ্রহ করে লগইন করুন" : "Please log in",
        type: "error",
      });
      return;
    }

    // Validate user inputs
    for (const input of userInputs) {
      if (input.isRequired === "true" && !inputValues[input.name]) {
        setNotification({
          show: true,
          message: language === "bn"
            ? `${input.labelBD || input.label} প্রয়োজন`
            : `${input.label} is required`,
          type: "error",
        });
        return;
      }
    }

    // Validate amount range
    if (selectedAmount < minAmount || selectedAmount > maxAmount) {
      setNotification({
        show: true,
        message: language === "bn"
          ? `এমাউন্ট ${minAmount} থেকে ${maxAmount} এর মধ্যে হতে হবে`
          : `Amount must be between ${minAmount} and ${maxAmount}`,
        type: "error",
      });
      return;
    }


    dispatch(getBalanceThunk())

    // Validate user balance
    if (Number(balance) < selectedAmount) {
      setNotification({
        show: true,
        message: language === "bn" ? "অপর্যাপ্ত ব্যালেন্স" : "Insufficient balance",
        type: "error",
      });
      return;
    }

    // Prepare userInputs with _id
    const formattedUserInputs = Object.entries(inputValues).map(([name, value]) => {
      const config = userInputs.find((input) => input.name === name);
      return {
        _id: config._id,
        name,
        value: value.toString(),
        label: config.label,
        labelBD: config.labelBD || config.label,
        type: config.type,
      };
    });

    // Prepare payload for backend
    const payload = {
      userId: user._id,
      paymentMethodId: selectedTab,
      channel: selectedProcessTab,
      amount: selectedAmount,
      userInputs: formattedUserInputs,
    };

    try {
      // Dispatch withdraw request
      const result = await dispatch(saveWithdrawRequest(payload)).unwrap();

      // Show success notification
      setNotification({
        show: true,
        message: language === "bn" ? "উইথড্রয়াল জমা দেওয়া হয়েছে" : "Withdrawal submitted successfully",
        type: "success",
      });
      dispatch(getBalanceThunk())
      console.log("Transaction:", result);
      setShowModal(false);
    } catch (error) {
      setNotification({
        show: true,
        message: language === "bn" ? `ত্রুটি: ${error}` : `Error: ${error}`,
        type: "error",
      });
    }
  };

  return (
    <div className="p-4">
      {/* Custom Notification */}
      {notification.show && (
        <CustomNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ show: false, message: "", type: "" })}
        />
      )}

      {/* Amount Selection */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-3">
          <p className="font-semibold text-lg">
            {language === "bn" ? "উইথড্রয়াল পরিমাণ:" : "Withdrawal Amount:"}
          </p>
          <div className="flex flex-col items-start">
            <div className="flex gap-4 relative flex-wrap">
              {amounts.map((amount) => (
                <div
                  key={amount}
                  className={`relative px-4 py-2 rounded border cursor-pointer ${
                    selectedAmount === amount
                      ? "border-textRed bg-white text-textRed font-semibold"
                      : "border-textRed border-opacity-50 text-black"
                  } hover:bg-red-50 transition-colors`}
                  onClick={() => setSelectedAmount(amount)}
                >
                  {amount}
                  {selectedAmount === amount && (
                    <div className="absolute bottom-0 right-0">
                      <img src={checkImage} alt="selected" className="w-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <input
                type="text"
                value={selectedAmount}
                placeholder={language === "bn" ? "উইথড্রয়াল পরিমাণ" : "Withdrawal Amount"}
                className="border p-2 rounded w-full mt-2 bg-gray-100 text-gray-700"
                readOnly
              />
            </div>
            <div className="flex text-xs lg:text-base justify-center font-semibold mt-2">
              <p className="text-textRed">
                {language === "bn"
                  ? `সর্বনিম্ন পরিমাণ ৳${minAmount} সর্বোচ্চ পরিমাণ ৳${maxAmount}`
                  : `Minimum Amount ৳${minAmount} Maximum Amount ৳${maxAmount}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <div className="mt-6">
        <button
          onClick={handleApply}
          className="px-4 py-2 rounded-md text-white font-medium"
          style={{ backgroundColor: currentMethod.buttonColor || "#d12053" }}
          disabled={withdrawRequestLoading}
        >
          {withdrawRequestLoading
            ? language === "bn" ? "প্রক্রিয়াকরণ..." : "Processing..."
            : language === "bn" ? "আবেদন করুন" : "Apply for Withdrawal"}
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn">
          <div
            className="flex flex-row p-8 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[rgba(255,255,255,0.1)] to-[rgba(255,255,255,0.05)] backdrop-blur-md border border-[rgba(255,255,255,0.1)]"
            style={{ backgroundColor: currentMethod.backgroundColor || "#e2136e" }}
          >
            {/* Left Side */}
            <div className="flex flex-col w-3/5 pr-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {language === "bn" ? "উইথড্রয়াল তথ্য" : "Withdrawal Information"}
                </h3>
                <div
                  className={`text-white font-semibold px-3 py-1 rounded-full bg-[rgba(0,0,0,0.3)] ${
                    timeLeft <= 30 ? "animate-pulse text-red-300" : ""
                  }`}
                >
                  {language === "bn" ? "সময় বাকি:" : "Time Left:"} {formatTime(timeLeft)}
                </div>
              </div>

              {/* Payment Method Details */}
              <div className="text-white mb-6 space-y-3">
                <p className="text-sm">
                  <strong className="font-semibold">{currentMethod.agentWalletText || "Wallet"} </strong>{" "}
                  {currentMethod.agentWalletNumber || "N/A"}
                </p>
                <p className="text-sm">
                  <strong className="font-semibold">{language === "bn" ? "নির্দেশনা:" : "Instruction:"}</strong>{" "}
                  <span
                    dangerouslySetInnerHTML={{
                      __html: language === "bn" ? (currentMethod.instructionBD || "কোনো নির্দেশনা নেই") : (currentMethod.instruction || "No instructions available"),
                    }}
                  />
                </p>
              </div>

              {/* Divider */}
              <hr className="border-[rgba(255,255,255,0.2)] my-4" />

              {/* User Inputs */}
              {userInputs.length > 0 && (
                <div className="mb-6">
                  <p className="font-semibold text-white text-lg mb-3">
                    {language === "bn" ? "তথ্য প্রদান করুন:" : "Provide Information:"}
                  </p>
                  {userInputs.map((input) => (
                    <div key={input._id} className="mb-4">
                      <label className="block text-sm font-medium text-white mb-1">
                        {language === "bn" ? (input.labelBD || input.label) : input.label}
                        {input.isRequired === "true" && <span className="text-red-300">*</span>}
                      </label>
                      <input
                        type={input.type}
                        name={input.name}
                        value={inputValues[input.name] || ""}
                        onChange={handleInputChange}
                        placeholder={language === "bn" ? (input.fieldInstructionBD || input.fieldInstruction) : input.fieldInstruction}
                        className="border border-[rgba(255,255,255,0.3)] p-2 rounded w-full bg-[rgba(255,255,255,0.1)] text-white placeholder-gray-300 focus:ring-2 focus:ring-white focus:border-transparent transition"
                        required={input.isRequired === "true"}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-transform transform hover:scale-105"
                  disabled={withdrawRequestLoading}
                >
                  {language === "bn" ? "বাতিল" : "Cancel"}
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2 rounded-md text-white font-medium transition-transform transform hover:scale-105"
                  style={{ backgroundColor: currentMethod.buttonColor || "#d12053" }}
                  disabled={withdrawRequestLoading}
                >
                  {withdrawRequestLoading
                    ? language === "bn" ? "জমা হচ্ছে..." : "Submitting..."
                    : language === "bn" ? "জমা দিন" : "Submit Withdrawal"}
                </button>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center justify-center w-2/5">
              {currentMethod.methodImage ? (
                <img
                  src={`${baseURL_For_IMG_UPLOAD}s/${currentMethod.methodImage}`}
                  alt="Payment Method"
                  className="max-h-64 w-auto rounded-lg shadow-md object-contain"
                  onError={(e) => (e.target.src = "/fallback-image.png")} // Fallback image if loading fails
                />
              ) : (
                <div className="text-white text-sm italic">
                  {language === "bn" ? "কোনো ছবি নেই" : "No image available"}
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