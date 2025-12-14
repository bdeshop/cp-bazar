import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/Context/AuthContext";
import checkImage from "../../../assets/check.8cbcb507.svg";

const CustomNotification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg text-white font-medium transition-all animate-pulse ${
        type === "success" ? "bg-[#006341]" : "bg-[#d60000]"
      }`}
    >
      {message}
    </div>
  );
};

const CommonContent = ({
  amounts,
  selectedProcessTab,
  selectedTab,
  language,
  selectedPromotion,
  tabsData,
  handlePromotionChange,
  userInputs,
  minAmount,
  maxAmount,
  selectedAmount: parentSelectedAmount,
  setSelectedAmount: setParentSelectedAmount,
  depositPaymentMethods, // এটা এখন প্রপস হিসেবে আসবে
  viewerApiKey,
  opayOnlineCount,
}) => {
  const { user } = useContext(AuthContext);

  const [selectedAmount, setSelectedAmount] = useState(amounts[0] || 100);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [inputValues, setInputValues] = useState({});
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportNumber, setSupportNumber] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Sync with parent (TabsWrapper)
  useEffect(() => {
    setSelectedAmount(parentSelectedAmount || amounts[0] || 100);
  }, [parentSelectedAmount, amounts]);

  const handleAmountChange = (amount) => {
    setSelectedAmount(amount);
    setParentSelectedAmount(amount);
  };

  const showNotification = (msg, type = "error") => {
    setNotification({ show: true, message: msg, type });
  };

  // এখানে আসল ডাটাবেস থেকে আসা মেথড খুঁজে বের করছি
  const currentMethodFromDB = depositPaymentMethods?.find(
    (method) => method._id === selectedTab
  ) || {};

  // Initialize input values when method changes
  useEffect(() => {
    const fields = Array.isArray(currentMethodFromDB.userInputs) ? currentMethodFromDB.userInputs : [];
    setInputValues(fields.reduce((acc, inp) => ({ ...acc, [inp.name]: "" }), {}));
    setShowModal(false);
    setTimeLeft(20 * 60);
  }, [selectedTab, currentMethodFromDB?.userInputs]);

  // Timer for modal
  useEffect(() => {
    if (!showModal) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setShowModal(false);
          showNotification(language === "bn" ? "সময় শেষ হয়েছে!" : "Time expired!", "error");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal]);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = (e) => {
    e.preventDefault();

    if (!selectedAmount || selectedAmount < minAmount || selectedAmount > maxAmount) {
      showNotification(
        language === "bn"
          ? `পরিমাণ ${minAmount} - ${maxAmount} এর মধ্যে হতে হবে`
          : `Amount must be between ${minAmount} - ${maxAmount}`,
        "error"
      );
      return;
    }

    // Verify login using multiple identifiers from context
    if (!(user?. _id || user?.username || user?.player_id)) {
      showNotification(
        language === "bn" ? "অনুগ্রহ করে লগইন করুন" : "Please login first",
        "error"
      );
      return;
    }
    // If Opay is selected, directly call OraclePay and redirect (no modal)
    if (String(selectedProcessTab).toLowerCase() === "opay") {
      (async () => {
        try {
          setProcessing(true);
          if (!viewerApiKey) {
            showNotification(language === "bn" ? "API কী পাওয়া যায়নি" : "API key not available", "error");
            setProcessing(false);
            return;
          }
          // If no Opay devices online, fetch support number and inform user
          if (!opayOnlineCount || opayOnlineCount === 0) {
            try {
              const res = await fetch(`https://api.oraclepay.org/api/external/support-number`, {
                method: 'GET',
                headers: { 'X-API-Key': viewerApiKey },
              });
              const data = await res.json().catch(() => ({ success: false }));
              setSupportNumber(data?.supportNumber || null);
            } catch {
              /* ignore; show generic message in modal */
            }
            setSupportOpen(true);
            setProcessing(false);
            return;
          }
          // Map deposit payment method name to OraclePay methods
          const rawMethod = (currentMethodFromDB?.methodName || "").toLowerCase();
          const methodMap = {
            bkash: "bkash",
            নগদ: "nagad",
            nagad: "nagad",
            rocket: "rocket",
            উপায়: "upay",
            upay: "upay",
          };
          const methods = methodMap[rawMethod] || rawMethod;
          const amount = selectedAmount;
          const userIdentifyAddress = user?.username || user?.player_id || user?._id || "guest";
          const url = `https://api.oraclepay.org/api/external/generate`;
          const fullUrl = `${url}?methods=${encodeURIComponent(methods)}&amount=${encodeURIComponent(amount)}&userIdentifyAddress=${encodeURIComponent(userIdentifyAddress)}`;
          const res = await fetch(fullUrl, { method: 'GET', headers: { 'X-API-Key': viewerApiKey } });
          if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || 'OraclePay generate failed');
          }
          const data = await res.json();
          if (data?.success && data?.payment_page_url) {
            window.open(data.payment_page_url, '_blank', 'noopener');
            setProcessing(false);
          } else {
            showNotification(language === "bn" ? "পেমেন্ট পেজ URL পাওয়া যায়নি" : "Payment page URL not found", "error");
            setProcessing(false);
          }
        } catch (err) {
          console.error('OraclePay generate error:', err);
          showNotification(language === "bn" ? "রিকোয়েস্ট ব্যর্থ হয়েছে" : "Request failed", "error");
          setProcessing(false);
        }
      })();
      return;
    }

    // Otherwise open inline modal (similar to withdrawal)
    setShowModal(true);
  };

  const handleSubmit = async () => {
    // Basic required fields validation
    const fields = Array.isArray(currentMethodFromDB.userInputs) ? currentMethodFromDB.userInputs : [];
    for (const input of fields) {
      if (input.isRequired === "true" && !inputValues[input.name]?.trim()) {
        showNotification(
          language === "bn"
            ? `${input.labelBD || input.label} আবশ্যক`
            : `${input.label || input.labelBD} is required`,
          "error"
        );
        return;
      }
    }

    try {
      // Manual deposit flow: create a PaymentTransaction in backend
      const payload = {
        userId: user?._id,
        userIdentifier: user?.username || user?.player_id || user?._id || null,
        paymentMethodId: currentMethodFromDB?._id,
        channel: selectedProcessTab || "",
        amount: selectedAmount,
        promotionId: selectedPromotion?._id || null,
        userInputs: fields.map((cfg) => ({ name: cfg.name, value: inputValues[cfg.name] || "" })),
      };
      const resp = await fetch(`${import.meta.env.VITE_BACKEND_API}api/v1/frontend/payment-transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(errText || 'Create payment transaction failed');
      }
      const data = await resp.json();
      if (data?.success) {
        setShowModal(false);
        showNotification(
          language === "bn" ? "ডিপোজিট রিকোয়েস্ট তৈরি হয়েছে" : "Deposit request created",
          "success"
        );
      } else {
        showNotification(language === "bn" ? "রিকোয়েস্ট ব্যর্থ হয়েছে" : "Request failed", "error");
      }
    } catch (err) {
      console.error('Create payment transaction error:', err);
      showNotification(language === "bn" ? "রিকোয়েস্ট ব্যর্থ হয়েছে" : "Request failed", "error");
    }
  };

  return (
    <div className="p-4">
      {/* Notification */}
      {notification.show && (
        <CustomNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ show: false, message: "", type: "" })}
        />
      )}

      {/* Opay Support Modal */}
      {supportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{language === 'bn' ? 'Opay তথ্য' : 'Opay Info'}</h3>
              <button onClick={() => setSupportOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="space-y-3">
              <p className="text-sm">
                {language === 'bn'
                  ? 'Opay বর্তমানে কার্যকর নয়। অনুগ্রহ করে সহায়তার সাথে যোগাযোগ করুন।'
                  : 'Opay is currently unavailable. Please contact support.'}
              </p>
              {supportNumber && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <span className="font-semibold text-yellow-800">{language === 'bn' ? 'সহায়তার নম্বর:' : 'Support Number:'}</span>
                  <span className="ml-2 font-mono text-yellow-900">{supportNumber}</span>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setSupportOpen(false)} className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900">{language === 'bn' ? 'ঠিক আছে' : 'OK'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {processing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white/90 rounded-xl px-6 py-5 shadow-xl flex items-center gap-3">
            <div className="h-6 w-6 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            <div className="text-sm font-medium text-gray-800">
              {language === 'bn' ? 'লোড হচ্ছে...' : 'Processing...'}
            </div>
          </div>
        </div>
      )}

      {/* Amount Selection */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-3">
          <p className="font-semibold">
            {language === "bn" ? "ডিপোজিট পরিমাণ:" : "Deposit Amount:"}
          </p>

          <div className="flex flex-col items-start flex-1">
            {/* Predefined Amounts */}
            <div className="flex gap-4 flex-wrap">
              {amounts.map((amount) => (
                <div
                  key={amount}
                  onClick={() => handleAmountChange(amount)}
                  className={`relative px-4 py-2 rounded border cursor-pointer transition-all ${
                    selectedAmount === amount
                      ? "border-[#d60000] bg-white text-[#d60000] font-semibold shadow-md"
                      : "border-[#ccc] text-black hover:border-gray-400"
                  }`}
                >
                  ৳{amount}
                  {selectedAmount === amount && (
                    <div className="absolute bottom-0 right-0">
                      <img src={checkImage} alt="selected" className="w-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Readonly Input */}
            <div className="mt-4 w-full">
              <input
                type="text"
                value={`৳${selectedAmount}`}
                readOnly
                className="border p-3 rounded w-full text-center font-bold text-lg bg-gray-50"
                placeholder={language === "bn" ? "পরিমাণ" : "পরিমাণ"}
              />
            </div>

            {/* Deposit Limit Info */}
            <div
              className="deposit-summary mt-4 p-3 bg-gray-100 rounded-lg text-sm"
              style={{
                padding: "10px 15px",
                borderRadius: "6px",
                fontSize: "15px",
                lineHeight: "1.5",
                color: "#d60000",
              }}
            >
              {language === "bn" ? "জমাসীমা:" : "Deposit Limit:"}{" "}
              <span className="font-bold">৳{minAmount} - ৳{maxAmount}</span>
              <br />
              {language === "bn" ? "জমার তথ্য: 24/24" : "Deposit Info: 24/24"}
            </div>
          </div>
        </div>
      </div>

      {/* Promotions (Hidden as before) */}
      <div className="flex flex-col lg:flex-row gap-4 mt-4" style={{ display: "none" }}>
        <p className="font-semibold">
          {language === "bn" ? "প্রমোশন বেছে নিন:" : "Choose Promotion:"}
        </p>
        <div className="flex flex-col gap-4">
          {tabsData[selectedTab]?.processTabs
            ?.find((tab) => tab.name === selectedProcessTab)
            ?.promotions.length > 0 ? (
            tabsData[selectedTab].processTabs
              .find((tab) => tab.name === selectedProcessTab)
              .promotions.map((promotion) => (
                <div
                  key={promotion._id}
                  className={`relative rounded-md border p-3 cursor-pointer transition-all ${
                    selectedPromotion?._id === promotion._id
                      ? "border-[#d60000] bg-red-50"
                      : "hover:border-[#d60000]"
                  }`}
                  onClick={() => handlePromotionChange(promotion)}
                >
                  <input
                    type="radio"
                    checked={selectedPromotion?._id === promotion._id}
                    readOnly
                    className="absolute opacity-0"
                  />
                  <label className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-sm">{promotion.bn}</div>
                      <div className="text-xs text-gray-600">{promotion.en}</div>
                    </div>
                    <div className="text-[#d60000] font-bold">{promotion.condition}</div>
                  </label>
                </div>
              ))
          ) : (
            <p className="text-sm text-gray-500">
              {language === "bn" ? "কোনো প্রমোশন উপলব্ধ নেই" : "No promotions available"}
            </p>
          )}
        </div>
      </div>

      {/* Selected Promotion Display */}
      {selectedPromotion && (
        <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded-lg">
          <p className="text-sm font-medium">
            {language === "bn" ? "নির্বাচিত প্রমোশন:" : "Selected Promotion:"}{" "}
            <strong className="text-green-700">
              {language === "bn" ? selectedPromotion.bn : selectedPromotion.en}
            </strong>
          </p>
        </div>
      )}

      {/* Apply Button */}
      <div className="mt-8">
        <button
          onClick={handleApply}
          className="px-8 py-4 rounded-lg text-black border-2 border-black font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          style={{
            backgroundColor: currentMethodFromDB.backgroundColor || "#ffffff",
          }}
        >
          {language === "bn" ? "এখনই ডিপোজিট করুন" : "Proceed to Deposit"}
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div
            className="flex flex-row max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
            style={{
              backgroundColor: currentMethodFromDB.backgroundColor || "#ffffff",
            }}
          >
            {/* Left Side */}
            <div className="w-3/5 p-8 text-black">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">
                  {language === "bn" ? "ডিপোজিট নিশ্চিত করুন" : "Confirm Deposit"}
                </h3>
                <div className={`px-4 py-2 rounded-full bg-black/30 ${timeLeft <= 60 && "animate-pulse"}`}>
                  {language === "bn" ? "বাকি সময়:" : "Time left:"} {formatTime(timeLeft)}
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-4 mb-6">
                <p className="text-lg font-bold">
                  {currentMethodFromDB.agentWalletText || "Agent Wallet"}
                </p>
                <p className="text-2xl font-bold mt-2">
                  {currentMethodFromDB.agentWalletNumber || "N/A"}
                </p>
              </div>

              <div className="mb-6">
                <p className="font-bold">{language === "bn" ? "নির্দেশনা:" : "Instructions:"}</p>
                <div
                  className="mt-2 text-sm leading-relaxed opacity-90"
                  dangerouslySetInnerHTML={{
                    __html:
                      language === "bn"
                        ? currentMethodFromDB.instructionBD || "—"
                        : currentMethodFromDB.instruction || "—",
                  }}
                />
              </div>

              <hr className="border-white/30 my-6" />

              {Array.isArray(currentMethodFromDB.userInputs) && currentMethodFromDB.userInputs.length > 0 && (
                <div>
                  <p className="font-bold text-lg mb-4">
                    {language === "bn" ? "তথ্য পূরণ করুন" : "Fill Information"}
                  </p>
                  {currentMethodFromDB.userInputs.map((input) => (
                    <div key={input.name} className="mb-5">
                      <label className="block font-medium">
                        {language === "bn" ? input.labelBD || input.label : input.label}
                        {input.isRequired === "true" && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      <input
                        type={input.type || "text"}
                        name={input.name}
                        value={inputValues[input.name] || ""}
                        onChange={handleInputChange}
                        placeholder={language === "bn" ? input.fieldInstructionBD || "এখানে লিখুন" : input.fieldInstruction || "Enter here"}
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
                >
                  {language === "bn" ? "বাতিল" : "Cancel"}
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 rounded-lg text-white font-bold transition hover:scale-105"
                  style={{ backgroundColor: currentMethodFromDB.buttonColor || "#d12053" }}
                >
                  {language === "bn" ? "নিশ্চিত করুন" : "Confirm Deposit"}
                </button>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="w-2/5 flex items-center justify-center p-8">
              {currentMethodFromDB.methodImage ? (
                <img
                  src={`${import.meta.env.VITE_API_URL}${currentMethodFromDB.methodImage}`}
                  alt="Payment Method"
                  className="max-h-64 rounded-xl shadow-2xl object-contain border border-black/20"
                  onError={(e) => (e.target.src = "/fallback-image.png")}
                />
              ) : (
                <div className="text-black text-center text-sm">No Image Available</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommonContent;