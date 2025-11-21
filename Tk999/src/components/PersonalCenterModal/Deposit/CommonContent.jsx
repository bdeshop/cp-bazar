import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import checkImage from "../../../assets/check.8cbcb507.svg";
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
}) => {
  const dispatch = useDispatch();
  const { depositPaymentMethods } = useSelector(
    (state) => state.depositPaymentGateway || {}
  );
  const { user, token } = useSelector((state) => state.auth || {});
  const { isCreating, createError } = useSelector(
    (state) => state.transaction || {}
  );
  const [selectedAmount, setSelectedAmount] = useState(amounts[0]);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  // Get current payment method details
  const currentMethod =
    depositPaymentMethods.find((method) => method._id === selectedTab) || {};

  useEffect(() => {
    setSelectedAmount(amounts[0]);
  }, [amounts]);

  // Handle create transaction error
  useEffect(() => {
    if (createError) {
      setNotification({
        show: true,
        message:
          language === "bn"
            ? `ত্রুটি: ${createError}`
            : `Error: ${createError}`,
        type: "error",
      });
      dispatch({ type: "transaction/clearError" });
    }
  }, [createError, language, dispatch]);

  const handleApply = (e) => {
    e.preventDefault();
    if (!selectedAmount) {
      setNotification({
        show: true,
        message:
          language === "bn"
            ? "এমাউন্ট নির্বাচন করুন"
            : "Please select an amount",
        type: "error",
      });
      return;
    }

    // Prepare data for new window
    const params = new URLSearchParams({
      amount: selectedAmount,
      language: language,
      agentWalletNumber: currentMethod.agentWalletNumber || "",
      methodName: currentMethod.methodName || "",
      methodNameBD: currentMethod.methodNameBD || "",
      methodImage: currentMethod.methodImage || "",
      userInputs: JSON.stringify(userInputs),
      selectedTab: selectedTab,
      selectedProcessTab: selectedProcessTab,
      userId: user?._id || "",
      token: token || "",
    });

    // Open new window
    const newWindow = window.open(
      `/deposit-details?${params.toString()}`,
      "_blank",
      "width=600,height=700,scrollbars=yes"
    );

    if (!newWindow) {
      setNotification({
        show: true,
        message:
          language === "bn"
            ? "নতুন উইন্ডো খুলতে ব্যর্থ। পপআপ ব্লকার বন্ধ করুন।"
            : "Failed to open new window. Please disable popup blocker.",
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
          <div className="flex flex-col items-start">
            <div className="flex gap-4 relative flex-wrap">
              {amounts.map((amount) => (
                <div
                  key={amount}
                  className={`relative px-4 py-2 rounded border cursor-pointer ${
                    selectedAmount === amount
                      ? "border-[#d60000] bg-white text-[#d60000] font-semibold"
                      : "border-[#ccc] border-opacity-50 text-black"
                  }`}
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
                placeholder={
                  language === "bn" ? "ডিপোজিট পরিমাণ" : "Deposit Amounts"
                }
                className="border p-2 rounded w-full mt-2"
                readOnly
              />
            </div>
            <div className="flex text-xs lg:text-base justify-center font-semibold"></div>

            <div
              className="deposit-summary"
              style={{
                padding: "10px 15px",
                borderRadius: "6px",
                fontSize: "15px",
                lineHeight: "1.5",
                color: "#d60000",
              }}
            >
              {language === "bn" ? "জমাসীমা:" : "Deposit Limit:"}{" "}
              <span className="highlight">
                ৳{minAmount} - ৳{maxAmount}
              </span>
              <br />
              {language === "bn" ? "জমার তথ্য: 24/24" : "Deposit Info: 24/24"}
            </div>
          </div>
        </div>
      </div>

      {/* Promotions */}
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
                  className={`relative rounded-md ${
                    selectedPromotion?._id === promotion._id
                      ? "border-[#d60000]"
                      : "hover:border-[#d60000]"
                  } pr-16 border p-2 flex items-start`}
                >
                  <input
                    type="radio"
                    id={`promotion-${promotion._id}`}
                    name="promotion"
                    value={promotion._id}
                    checked={selectedPromotion?._id === promotion._id}
                    onChange={() => handlePromotionChange(promotion)}
                    className="form-radio mt-1"
                  />
                  <label
                    htmlFor={`promotion-${promotion._id}`}
                    className="text-sm ml-2"
                  >
                    <div className="flex justify-between w-full">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-medium text-black">
                          {promotion.bn}
                        </span>
                        <span className="text-xs font-medium text-black">
                          {promotion.en}
                        </span>
                      </div>
                      <div className="absolute right-2 font-semibold text-[#d60000]">
                        <span>{promotion.condition}</span>
                      </div>
                    </div>
                  </label>
                </div>
              ))
          ) : (
            <p className="text-sm">
              {language === "bn"
                ? "কোনো প্রমোশন উপলব্ধ নেই"
                : "No promotions available"}
            </p>
          )}
        </div>
      </div>

      {selectedPromotion && (
        <div className="mt-4">
          <p className="text-sm">
            {language === "bn" ? "নির্বাচিত প্রমোশন:" : "Selected Promotion:"}{" "}
            <strong>
              {language === "bn" ? selectedPromotion.bn : selectedPromotion.en}
            </strong>
          </p>
        </div>
      )}

      {/* Apply Button */}
      <div className="mt-6">
        <button
          onClick={handleApply}
          className="px-4 py-2 rounded-md text-white font-semibold"
          style={{ backgroundColor: currentMethod.buttonColor || "#006341" }}
          disabled={isCreating}
        >
          {isCreating
            ? language === "bn"
              ? "প্রক্রিয়াকরণ..."
              : "Processing..."
            : language === "bn"
            ? "আবেদন করুন"
            : "Apply for Deposit"}
        </button>
      </div>
    </div>
  );
};

export default CommonContent;
