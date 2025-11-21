import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { baseURL, baseURL_For_IMG_UPLOAD } from "@/utils/baseURL";
import {
  createPaymentTransaction,
  fetchUserPaymentTransactions,
} from "@/features/transaction/transactionSlice";
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
        type === "success" ? "bg-[#006341]" : "bg-[#d60000]"
      }`}
    >
      {message}
    </div>
  );
};

const DepositDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isCreating, createError } = useSelector(
    (state) => state.transaction || {}
  );
  const [inputValues, setInputValues] = useState({});
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [transactionId, setTransactionId] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Get URL parameters
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const amount = params.get("amount") || "0";
  const initialLanguage = "bn";
  const [currentLanguage, setCurrentLanguage] = useState(initialLanguage);
  const agentWalletNumber = params.get("agentWalletNumber") || "N/A";
  const methodName = params.get("methodName") || "";
  const methodNameBD = params.get("methodNameBD") || "";
  const methodImage = params.get("methodImage") || "";
  const userInputs = JSON.parse(params.get("userInputs") || "[]");
  const selectedTab = params.get("selectedTab") || "";
  const selectedProcessTab = params.get("selectedProcessTab") || "";
  const userId = params.get("userId");
  const token = params.get("token");

  useEffect(() => {
    setCurrentLanguage(initialLanguage);
  }, [initialLanguage]);

  // Polling logic for auto-payment check
  const pollTransaction = useCallback(async () => {
    if (!transactionId || !userId || !token) return;

    try {
      const response = await fetch(
        `${baseURL}/check-auto-payment/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.success && data.data.status === "completed") {
        setIsLoading(false); // Stop loading
        setIsSuccess(true); // Show success animation
        await dispatch(getBalanceThunk(userId)).unwrap();
        await dispatch(fetchUserPaymentTransactions(userId)).unwrap();
        setPollingInterval((prev) => {
          if (prev) clearInterval(prev);
          return null;
        });
        setTransactionId(null);

        // Show success animation for 3 seconds before redirecting
        setTimeout(() => {
          setIsSuccess(false);
          setNotification({
            show: true,
            message:
              currentLanguage === "bn"
                ? "ট্রানজ্যাকশন সম্পন্ন হয়েছে!"
                : "Transaction completed!",
            type: "success",
          });

          if (window.confirm("Payment successful! Close this window?")) {
            window.close();
          }
        }, 3000); // Ensure 3-second delay for success animation
      } else if (
        data.data.status === "pending" &&
        new Date(data.data.transaction.createdAt) <
          new Date(Date.now() - 2 * 60 * 1000)
      ) {
        setNotification({
          show: true,
          message:
            currentLanguage === "bn"
              ? "টাইমআউট: ট্রানজ্যাকশন পেন্ডিং"
              : "Timeout: Transaction pending",
          type: "error",
        });
        setPollingInterval((prev) => {
          if (prev) clearInterval(prev);
          return null;
        });
        setTransactionId(null);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Polling error:", error);
      setIsLoading(false);
    }
  }, [transactionId, userId, token, dispatch, currentLanguage]);

  useEffect(() => {
    if (!transactionId) return;

    const interval = setInterval(pollTransaction, 5000);
    setPollingInterval(interval);

    const timeout = setTimeout(() => {
      if (pollingInterval) {
        clearInterval(interval);
        setPollingInterval(null);
        if (transactionId) {
          setNotification({
            show: true,
            message:
              currentLanguage === "bn"
                ? "টাইমআউট: ট্রানজ্যাকশন পেন্ডিং"
                : "Timeout: Transaction pending",
            type: "error",
          });
          setTransactionId(null);
          setIsLoading(false);
        }
      }
    }, 2 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [transactionId, pollTransaction]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(agentWalletNumber).then(() => {
      setNotification({
        show: true,
        message:
          currentLanguage === "bn" ? "নম্বর কপি করা হয়েছে" : "Number copied",
        type: "success",
      });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId || !token) {
      setNotification({
        show: true,
        message:
          currentLanguage === "bn" ? "অনুগ্রহ করে লগইন করুন" : "Please log in",
        type: "error",
      });
      return;
    }

    for (const input of userInputs) {
      if (input.isRequired === "true" && !inputValues[input.name]) {
        setNotification({
          show: true,
          message:
            currentLanguage === "bn"
              ? `${input.labelBD} প্রয়োজন`
              : `${input.label} is required`,
          type: "error",
        });
        return;
      }
    }

    setIsLoading(true);

    const formattedUserInputs = Object.entries(inputValues).map(
      ([name, value]) => {
        const config = userInputs.find((input) => input.name === name);
        return {
          _id: config?._id,
          name,
          value: value.toString(),
          label: config.label,
          labelBD: config.labelBD,
          type: config.type,
        };
      }
    );

    const payload = {
      userId: userId,
      paymentMethodId: selectedTab,
      channel: selectedProcessTab,
      amount: Number(amount),
      promotionId: null,
      userInputs: formattedUserInputs,
    };

    try {
      const result = await dispatch(createPaymentTransaction(payload)).unwrap();
      await dispatch(fetchUserPaymentTransactions(userId)).unwrap();

      const trxIdInput = formattedUserInputs.find((input) =>
        input.name.toLowerCase().includes("trxid")
      );
      const trxId = trxIdInput ? trxIdInput.value : null;

      if (trxId) {
        const autoPaymentPayload = {
          transactionId: result?._id,
          amount: Number(amount),
          trxId: trxId,
        };

        const autoPaymentResponse = await fetch(`${baseURL}/auto-payment`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(autoPaymentPayload),
        });

        const autoPaymentData = await autoPaymentResponse.json();
        if (!autoPaymentResponse.ok) {
          throw new Error(
            autoPaymentData.message || "Failed to save auto-payment data"
          );
        }
      } else {
        console.warn("No TRXID found in user inputs");
      }

      setTransactionId(result?._id);
    } catch (error) {
      setNotification({
        show: true,
        message:
          currentLanguage === "bn"
            ? `ত্রুটি: ${error.message}`
            : `Error: ${error.message}`,
        type: "error",
      });
      setIsLoading(false);
    }
  };

  const handleLanguageToggle = () => {
    setCurrentLanguage(currentLanguage === "bn" ? "en" : "bn");
  };

  return (
    <>
      {/* Hidden preloading */}
      <div className="hidden">
        <iframe
          src="https://lottie.host/embed/01eb7485-26c2-4200-bd28-35aa8234da77/3SaIZBQqPn.lottie"
          title="loading-animation-preload"
        ></iframe>
        <iframe
          src="https://lottie.host/embed/8777f25c-49f0-4d4a-a532-b21fea08c387/8ogxaPjMnh.lottie"
          title="success-animation-preload"
        ></iframe>
      </div>

      {/* Actual Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
          <iframe
            src="https://lottie.host/embed/01eb7485-26c2-4200-bd28-35aa8234da77/3SaIZBQqPn.lottie"
            title="loading-animation"
          ></iframe>
          <p className="mt-4 text-lg font-semibold text-gray-700">
            {currentLanguage === "bn" ? "২ মিনিট অপেক্ষা করুন" : "Wait 2min"}
          </p>
        </div>
      )}

      {/* Success State */}
      {isSuccess && (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
          <iframe
            src="https://lottie.host/embed/8777f25c-49f0-4d4a-a532-b21fea08c387/8ogxaPjMnh.lottie"
            title="success-animation"
          ></iframe>
          <p className="mt-4 text-lg font-semibold text-green-600">
            {currentLanguage === "bn"
              ? "স্বয়ংক্রিয় পেমেন্ট সফলভাবে সংরক্ষিত হয়েছে"
              : "Auto payment saved successfully"}
          </p>
        </div>
      )}
      {!isLoading && !isSuccess && (
        <div className="min-h-screen bg-[#f5f7f8] font-['Noto_Sans_Bengali'] flex items-center justify-center">
          {notification.show && (
            <CustomNotification
              message={notification.message}
              type={notification.type}
              onClose={() =>
                setNotification({ show: false, message: "", type: "" })
              }
            />
          )}
          <div className="max-w-[600px] w-full bg-white rounded-[12px] shadow-[0_3px_12px_rgba(0,0,0,0.1)] overflow-hidden">
            {/* Header */}
            <div className="bg-[#006341] text-white p-[15px_20px] flex justify-between items-center">
              <div className="text-[18px] font-semibold">
                {currentLanguage === "bn" ? "BDT" : "Amount"}{" "}
                <span className="font-bold">{amount}</span>
                <br />
                <small>
                  {currentLanguage === "bn"
                    ? "কম বা বেশি ক্যাশআউট করবেন না"
                    : "Do not cash out less or more"}
                </small>
              </div>
              <div className="flex items-center gap-[6px] text-[14px]">
                <div className="bg-white text-[#006341] font-bold px-[6px] py-[4px] rounded-[3px] text-[13px]">
                  Oracle Pay
                </div>
                SERVICE
                <div
                  className="bg-white text-[#333] rounded-[4px] px-[6px] py-[3px] text-[13px] cursor-pointer"
                  onClick={handleLanguageToggle}
                >
                  {currentLanguage === "bn" ? "EN | বাংলা" : "EN | Bangla"}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-[25px]">
              {/* Warning */}
              <div className="text-[#d60000] font-semibold mb-[20px] text-[15px]">
                {currentLanguage === "bn"
                  ? `আপনি যদি টাকার পরিমাণ পরিবর্তন করেন (BDT ${amount})। আপনি ক্রেডিট পেতে সক্ষম হবেন না।`
                  : `If you change the amount (BDT ${amount}), you will not be able to receive credit.`}
              </div>

              {/* Wallet Section */}
              <div className="gap-[20px] flex flex-wrap justify-between mb-[25px]">
                <div className="flex-1 min-w-[260px] mb-[20px]">
                  <label className="font-semibold text-[15px]">
                    {currentLanguage === "bn" ? "ওয়ালেট নম্বর*" : "Wallet No*"}
                  </label>
                  <div className="text-[13px] text-[#555] mb-[6px]">
                    {currentLanguage === "bn"
                      ? "এই নাম্বারে শুধুমাত্র ক্যাশআউট গ্রহণ করা হয়"
                      : "Only cashouts are accepted to this number"}
                  </div>
                  <div className="flex items-center bg-[#f9f9f9] border border-[#ccc] rounded-[6px] p-[10px] text-[15px] text-[#333]">
                    <span className="flex-grow">{agentWalletNumber}</span>
                    <div
                      className="bg-[#e5f4ed] rounded-[5px] p-[6px] cursor-pointer text-[18px] text-[#00764f]"
                      onClick={handleCopy}
                    >
                      📋
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-[260px]">
                  <label className="font-semibold text-[15px] block mb-[8px]">
                    {currentLanguage === "bn"
                      ? "ওয়ালেট প্রোভাইডার"
                      : "Wallet Provider"}
                  </label>
                  <div className="text-[13px] text-[#555] ">
                    {currentLanguage === "bn" ? "Method" : "Method"}
                  </div>
                  <div className="flex items-center bg-[#d700aa] text-white p-[10px_16px] rounded-[8px] font-semibold gap-[10px]">
                    <img
                      src={`${baseURL_For_IMG_UPLOAD}s/${methodImage}`}
                      alt={methodName}
                      className="w-[40px] h-[40px] rounded-full"
                    />
                    {currentLanguage === "bn" ? methodNameBD : methodName}
                  </div>
                </div>
              </div>

              {/* TrxID Section */}
              {userInputs.length > 0 && (
                <div className="mb-[25px]">
                  {userInputs.map((input) => (
                    <div key={input?._id}>
                      <label className="block font-semibold text-[#d60000] mb-[6px] text-[15px]">
                        {currentLanguage === "bn" ? input.labelBD : input.label}
                        {input.isRequired === "true" && (
                          <span>
                            {" "}
                            (
                            {currentLanguage === "bn" ? "প্রয়োজন" : "Required"}
                            )
                          </span>
                        )}
                      </label>
                      <input
                        type={input.type}
                        name={input.name}
                        value={inputValues[input.name] || ""}
                        onChange={handleInputChange}
                        placeholder={
                          currentLanguage === "bn"
                            ? input.fieldInstructionBD ||
                              "TrxID অবশ্যই পূরণ করতে হবে!"
                            : input.fieldInstruction || "TrxID must be filled!"
                        }
                        className="w-full border border-[#d60000] rounded-[6px] p-[10px] text-[15px] placeholder-[#999]"
                        required={input.isRequired === "true"}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                className="block w-[140px] text-center bg-white border-[1.5px] border-black text-black rounded-[10px] font-semibold text-[16px] py-[8px] mx-auto mb-[20px] hover:bg-black hover:text-white transition duration-200"
                disabled={isCreating}
              >
                {isCreating
                  ? currentLanguage === "bn"
                    ? "জমা হচ্ছে..."
                    : "Submitting..."
                  : currentLanguage === "bn"
                  ? "নিশ্চিত"
                  : "Confirm"}
              </button>

              {/* Note */}
              <div className="bg-[#fff8f8] border-l-[4px] border-[#d60000] p-[10px_12px] text-[14px] text-[#d60000] leading-[1.6]">
                <span className="font-bold">
                  {currentLanguage === "bn" ? "সতর্কতা:" : "Warning:"}
                </span>{" "}
                {currentLanguage === "bn"
                  ? `আপনার ট্রান্সফারটি সঠিকভাবে পূরণ করতে হবে, অন্যথায় অর্থ হারিয়ে যাবে! অনুগ্রহ করে কেবল নিচে দেয়া নির্দিষ্ট নাম্বারে আপনার ${
                      currentLanguage === "bn" ? methodNameBD : methodName
                    } ডিপোজিট ক্যাশআউট করুন। এই নাম্বারে অন্য কোনো ওয়ালেট থেকে ক্যাশ পাঠাবেন না।`
                  : `Your transfer must be filled correctly, otherwise the funds will be lost! Please cash out your ${
                      currentLanguage === "bn" ? methodNameBD : methodName
                    } deposit only to the specified number below. Do not send cash from any other wallet to this number.`}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DepositDetails;
