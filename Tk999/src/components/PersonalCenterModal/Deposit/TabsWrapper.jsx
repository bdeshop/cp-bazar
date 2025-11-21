import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDepositPaymentMethods } from "@/features/depositPaymentMethod/depositPaymentMethodThunkAndSlice";
import { fetchPromotions } from "@/features/promotion/promotionThunkAndSlice";
import CommonContent from "./CommonContent";
import checkImage from "../../../assets/check.8cbcb507.svg";
import { FaExclamationTriangle, FaRegFileAlt } from "react-icons/fa";
import { RiCustomerService2Line } from "react-icons/ri";
import { baseURL_For_IMG_UPLOAD } from "@/utils/baseURL";

const TabsWrapper = ({ language }) => {
  const dispatch = useDispatch();
  const {
    depositPaymentMethods,
    isLoading: paymentMethodsLoading,
    error: paymentMethodsError,
  } = useSelector((state) => state.depositPaymentGateway || {});
  const {
    promotions,
    isLoading: promotionsLoading,
    errorMessage: promotionsError,
  } = useSelector((state) => state.promotionSlice || {});
  const [selectedTab, setSelectedTab] = useState(null);
  const [selectedProcessTab, setSelectedProcessTab] = useState(null);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(100);

  useEffect(() => {
    dispatch(getDepositPaymentMethods());
    dispatch(fetchPromotions());
  }, [dispatch]);

  useEffect(() => {
    if (
      Array.isArray(depositPaymentMethods) &&
      depositPaymentMethods.length > 0 &&
      !selectedTab
    ) {
      setSelectedTab(depositPaymentMethods[0]._id);
      setSelectedProcessTab(depositPaymentMethods[0].gateway?.[0] || null);
    }
  }, [depositPaymentMethods, selectedTab]);

  const handleProcessTabChange = (processTab) => {
    setSelectedProcessTab(processTab);
    setSelectedPromotion(null);
  };

  const handlePromotionChange = (promotion) => {
    setSelectedPromotion(promotion);
  };

  const tabsData = Array.isArray(depositPaymentMethods)
    ? depositPaymentMethods.reduce((acc, method) => {
        const methodPromotions = Array.isArray(promotions)
          ? promotions.filter((promo) => {
              if (
                !promo.payment_methods ||
                !Array.isArray(promo.payment_methods)
              )
                return false;
              return promo.payment_methods.includes(method._id.toString());
            })
          : [];

        const processTabs = Array.isArray(method.gateway)
          ? method.gateway.map((gateway) => {
              const gatewayPromotions = methodPromotions
                .flatMap((promo) => {
                  if (
                    !promo.promotion_bonuses ||
                    !Array.isArray(promo.promotion_bonuses)
                  )
                    return [];
                  return promo.promotion_bonuses
                    .filter((bonus) => {
                      return (
                        bonus.payment_method?._id &&
                        bonus.payment_method._id.toString() ===
                          method._id.toString() &&
                        bonus.payment_method?.gateway?.includes(gateway)
                      );
                    })
                    .map((bonus) => ({
                      bn: `${promo.title_bd} (${
                        bonus.bonus_type === "Percentage"
                          ? `${bonus.bonus}%`
                          : `৳${bonus.bonus}`
                      })`,
                      en: `${promo.title} (${
                        bonus.bonus_type === "Percentage"
                          ? `${bonus.bonus}%`
                          : `$${bonus.bonus}`
                      })`,
                      condition: `≥৳${
                        bonus.bonus_type === "Percentage" ? 100 : bonus.bonus
                      }`,
                      _id: `${promo._id}-${bonus.payment_method._id}-${gateway}`,
                      minAmount: bonus.minAmount || 100,
                      maxAmount: bonus.maxAmount || 10000,
                    }));
                })
                .filter((promo) => promo);

              return {
                name: gateway,
                promotions: gatewayPromotions,
              };
            })
          : [];

        acc[method._id] = {
          label: language === "bn" ? method.methodNameBD : method.methodName,
          Image: method.methodImage,
          processTabs,
          amounts: method.amounts || [
            100, 200, 500, 1000, 3000, 5000, 10000, 15000, 20000, 25000,
          ],
          userInputs: method.userInputs || [],
          minAmount: method.minAmount || 100,
          maxAmount: method.maxAmount || 25000,
        };

        return acc;
      }, {})
    : {};

  if (paymentMethodsLoading || promotionsLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-bgRed mx-auto"></div>
        {language === "bn" ? "লোড হচ্ছে..." : "Loading..."}
      </div>
    );
  }

  if (paymentMethodsError || promotionsError) {
    return (
      <div className="p-4 text-center text-red-500">
        Error: {paymentMethodsError || promotionsError}
      </div>
    );
  }

  if (!depositPaymentMethods || depositPaymentMethods.length === 0) {
    return (
      <div className="p-4 text-center">
        {language === "bn"
          ? "কোনো পেমেন্ট মেথড উপলব্ধ নেই"
          : "No payment methods available"}
      </div>
    );
  }

  if (!selectedTab || !tabsData[selectedTab]) {
    return (
      <div className="p-4 text-center">
        {language === "bn"
          ? "একটি পেমেন্ট মেথড নির্বাচন করুন"
          : "Please select a payment method"}
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-auto max-h-[99vh] custom-scrollbar-hidden lg:flex-row gap-6 px-2 lg:px-6 pb-10 lg:pb-0">
      {/* Left Tab Navigation */}
      <div className="lg:w-1/4 grid grid-cols-4 lg:flex lg:flex-col gap-2 py-6">
        {depositPaymentMethods.map((method) => (
          <div
            className={`relative flex flex-col items-center lg:items-start lg:flex-row p-2 ${
              selectedTab === method._id
                ? "border-textRed bg-white border"
                : "bg-white border"
            } cursor-pointer`}
            key={method._id}
            onClick={() => {
              setSelectedTab(method._id);
              setSelectedProcessTab(method.gateway?.[0] || null);
              setSelectedPromotion(null);
            }}
          >
            <img
              src={`${baseURL_For_IMG_UPLOAD}s/${method.methodImage}`}
              alt={method.methodName}
              className="lg:w-[20%]"
            />
            <button className="w-full text-xs lg:text-base lg:p-2 lg:text-left">
              {language === "bn" ? method.methodNameBD : method.methodName}
            </button>
            {selectedTab === method._id && (
              <div className="absolute bottom-0 right-0">
                <img src={checkImage} alt="" className="w-4" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right Content Area */}
      <div className="lg:w-3/4 lg:overflow-y-auto lg:max-h-[99vh] custom-scrollbar-hidden bg-white p-2 border">
        <div className="hidden lg:flex justify-between px-3 mb-6">
          <h3 className="border-l-4 pl-2 border-borderGreen">
            {language === "en" ? "Deposit Info" : "ডিপোজিট তথ্য"}
          </h3>
          <div className="flex gap-2 font-semibold p-1 px-2 border border-depositBlue rounded-full justify-between items-center">
            <span className="text-depositBlue">
              <FaRegFileAlt />
            </span>
            <button className="text-sm text-depositBlue">
              {language === "en" ? "Deposit History" : "ডিপোজিট ইতিহাস"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:hidden absolute text-white top-2 right-6">
          <span>
            <FaRegFileAlt />
          </span>
          <span>
            <RiCustomerService2Line />
          </span>
        </div>

        <p className="text-sm text-[#FF2F34] bg-[#ffdbdb] p-5 rounded-lg mb-6">
          {language === "en"
            ? "To successfully complete your deposit process quickly, please submit with the correct cashout number, amount, and transaction ID."
            : "❗❗ NOTE: অনুগ্রহ করে আপনার ডিপোজিট করার পরে অবশ্যই আপনার Trx-ID আইডি সাবমিট করবেন। তাহলেই খুব দ্রুত আপনার একাউন্টের মধ্যে টাকা যোগ হয়ে যাবে। ⚠️⚠️⚠️"}
        </p>

        <div className="inline-flex items-center border border-[#d60000] rounded-lg p-2 gap-2 px-3">
          {depositPaymentMethods
            ?.filter((method) => method?._id === selectedTab)
            ?.map((method) => (
              <div key={method?._id} className="flex items-center gap-2">
                <img
                  src={`${baseURL_For_IMG_UPLOAD}s/${method?.methodImage}`}
                  alt={method?.methodName}
                  className="w-8 h-8 object-contain"
                />
                <span className="text-sm font-medium text-[#2f2f2f]">
                  {language === "bn"
                    ? method?.methodNameBD
                    : method?.methodName}{" "}
                  VIP | OP
                </span>{" "}
              </div>
            ))}
        </div>

        <p className="mt-4 mb-4 text-sm flex items-center gap-2">
          <span className="flex items-center">
            <FaExclamationTriangle className="text-red-500 text-lg" />
          </span>
          <span className="text-white bg-[#5C5C5C] p-2 rounded-lg">
            {language === "en"
              ? "To successfully complete your deposit process quickly, please submit with the correct cashout number, amount, and transaction ID."
              : "❗অনুগ্রহ করে সতর্ক থাকুন! সাম্প্রতিক সময়ে কিছু প্রতারক Telegram বা Facebook-এ আমাদের নামে ডিপোজিট পরিষেবা দেওয়ার ভান করছে। 👉 মনে রাখবেন, আমাদের অফিসিয়াল ডিপোজিট শুধুমাত্র প্ল্যাটফর্মের মাধ্যমেই সম্পন্ন হয়। কোনো বাহ্যিক যোগাযোগ বা প্রস্তাবে সাড়া দেবেন না।"}
          </span>
        </p>

        <div className="flex text-xs lg:text-base gap-4 mb-6">
          {tabsData[selectedTab].processTabs.map((processTab) => (
            <button
              key={processTab.name}
              onClick={() => handleProcessTabChange(processTab.name)}
              className={`p-3 px-4 text-left ${
                selectedProcessTab === processTab.name
                  ? "border-textRed border bg-red-50"
                  : "border"
              }`}
            >
              {processTab.name}
            </button>
          ))}
        </div>

        <CommonContent
          amounts={tabsData[selectedTab].amounts}
          selectedProcessTab={selectedProcessTab}
          selectedPromotion={selectedPromotion}
          language={language}
          tabsData={tabsData}
          selectedTab={selectedTab}
          handlePromotionChange={handlePromotionChange}
          userInputs={tabsData[selectedTab].userInputs}
          minAmount={tabsData[selectedTab].minAmount}
          maxAmount={tabsData[selectedTab].maxAmount}
          selectedAmount={selectedAmount}
          setSelectedAmount={setSelectedAmount}
        />
      </div>
    </div>
  );
};

export default TabsWrapper;
