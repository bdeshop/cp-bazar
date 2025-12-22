import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
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
  userId,
  handlePromotionChange,
  userInputs,
  minAmount,
  maxAmount,
  selectedAmount: parentSelectedAmount,
  setSelectedAmount: setParentSelectedAmount,
  depositPaymentMethods, // এটা এখন প্রপস হিসেবে আসবে
}) => {
  const { user } = useContext(AuthContext);

  const [selectedAmount, setSelectedAmount] = useState(amounts[0] || 100);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

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
  const currentMethodFromDB =
    depositPaymentMethods?.find((method) => method._id === selectedTab) || {};

  const handleApply = (e) => {
    e.preventDefault();

    if (
      !selectedAmount ||
      selectedAmount < minAmount ||
      selectedAmount > maxAmount
    ) {
      showNotification(
        language === "bn"
          ? `পরিমাণ ${minAmount} - ${maxAmount} এর মধ্যে হতে হবে`
          : `Amount must be between ${minAmount} - ${maxAmount}`,
        "error"
      );
      return;
    }

    if (!user?._id) {
      showNotification(
        language === "bn" ? "অনুগ্রহ করে লগইন করুন" : "Please login first",
        "error"
      );
      return;
    }

    // সব ডেটা ডাটাবেস থেকে নেওয়া হচ্ছে
    const params = new URLSearchParams({
      amount: selectedAmount,
      language: language,
      paymentMethodId: currentMethodFromDB._id || "",
      channel: selectedProcessTab || "Personal",
      userId: userId,
      token: user.token || "",
      agentWalletNumber: currentMethodFromDB.agentWalletNumber || "N/A",
      agentWalletText: currentMethodFromDB.agentWalletText || "",
      methodName: currentMethodFromDB.methodName || "Unknown",
      methodNameBD: currentMethodFromDB.methodNameBD || "অজানা",
      methodImage: currentMethodFromDB.methodImage || "",
      userInputs: JSON.stringify(currentMethodFromDB.userInputs || []),
      selectedPromotion: selectedPromotion
        ? JSON.stringify(selectedPromotion)
        : "",
    });

    // Debug: দেখো সব ডেটা ঠিক আছে কিনা
    console.log("Opening Deposit Details with:", params.toString());

    const popup = window.open(
      `/deposit-details?${params.toString()}`,
      "depositPopup",
      "width=650,height=800,scrollbars=yes,resizable=yes,left=300,top=50"
    );

    if (!popup) {
      showNotification(
        language === "bn"
          ? "পপআপ ব্লক হয়েছে! পপআপ অনুমতি দিন।"
          : "Popup blocked! Please allow popups.",
        "error"
      );
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
              <span className="font-bold">
                ৳{minAmount} - ৳{maxAmount}
              </span>
              <br />
              {language === "bn" ? "জমার তথ্য: 24/24" : "Deposit Info: 24/24"}
            </div>
          </div>
        </div>
      </div>

      {/* Promotions (Hidden as before) */}
      <div
        className="flex flex-col lg:flex-row gap-4 mt-4"
        style={{ display: "none" }}
      >
        <p className="font-semibold">
          {language === "bn" ? "প্রমোশন বেছে নিন:" : "Choose Promotion:"}
        </p>
        <div className="flex flex-col gap-4">
          {tabsData[selectedTab]?.processTabs?.find(
            (tab) => tab.name === selectedProcessTab
          )?.promotions.length > 0 ? (
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
                      <div className="text-xs text-gray-600">
                        {promotion.en}
                      </div>
                    </div>
                    <div className="text-[#d60000] font-bold">
                      {promotion.condition}
                    </div>
                  </label>
                </div>
              ))
          ) : (
            <p className="text-sm text-gray-500">
              {language === "bn"
                ? "কোনো প্রমোশন উপলব্ধ নেই"
                : "No promotions available"}
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
    </div>
  );
};

export default CommonContent;
