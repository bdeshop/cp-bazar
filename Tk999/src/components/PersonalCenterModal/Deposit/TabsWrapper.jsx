import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext"; // তোমার AuthContext
import { baseURL, baseURL_For_IMG_UPLOAD } from "@/utils/baseURL";
import CommonContent from "./CommonContent";
import checkImage from "../../../assets/check.8cbcb507.svg";
import { FaExclamationTriangle, FaRegFileAlt } from "react-icons/fa";
import { RiCustomerService2Line } from "react-icons/ri";

const TabsWrapper = ({ language }) => {
  const { userId } = useContext(AuthContext); // যদি লাগে

  const [depositPaymentMethods, setDepositPaymentMethods] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedTab, setSelectedTab] = useState(null);
  const [selectedProcessTab, setSelectedProcessTab] = useState(null);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(100);


  // Fetch Deposit Methods + Promotions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [methodsRes, promoRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/deposit-payment-method/methods`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/promotions`), // তোমার promotion API
        ]);

        const methods = methodsRes.data.success ? methodsRes.data.data : [];
        const promos = promoRes.data.success ? promoRes.data.data : [];

        setDepositPaymentMethods(methods);
        setPromotions(promos);

        // Auto select first method
        if (methods.length > 0) {
          setSelectedTab(methods[0]._id);
          setSelectedProcessTab(methods[0].gateway?.[0] || null);
        }
      } catch (err) {
        console.error("Failed to fetch deposit data:", err);
        setError(
          err.response?.data?.msg ||
            "Failed to load payment methods. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProcessTabChange = (processTab) => {
    setSelectedProcessTab(processTab);
    setSelectedPromotion(null); // reset promotion when channel changes
  };

  const handlePromotionChange = (promotion) => {
    setSelectedPromotion(promotion);
  };

  // Build tabsData exactly like before (same logic)
  const tabsData = depositPaymentMethods.reduce((acc, method) => {
    const methodPromotions = promotions.filter((promo) =>
      promo.payment_methods?.includes(method._id.toString())
    );

    const processTabs = method.gateway?.map((gateway) => {
      const gatewayPromotions = methodPromotions
        .flatMap((promo) => {
          if (!promo.promotion_bonuses) return [];
          return promo.promotion_bonuses
            .filter(
              (bonus) =>
                bonus.payment_method?._id?.toString() === method._id.toString() &&
                bonus.payment_method?.gateway?.includes(gateway)
            )
            .map((bonus) => ({
              bn: `${promo.title_bd} (${
                bonus.bonus_type === "Percentage" ? `${bonus.bonus}%` : `৳${bonus.bonus}`
              })`,
              en: `${promo.title} (${
                bonus.bonus_type === "Percentage" ? `${bonus.bonus}%` : `$${bonus.bonus}`
              })`,
              condition: `≥৳${bonus.bonus_type === "Percentage" ? 100 : bonus.bonus}`,
              _id: `${promo._id}-${bonus.payment_method._id}-${gateway}`,
              minAmount: bonus.minAmount || 100,
              maxAmount: bonus.maxAmount || 10000,
            }));
        })
        .filter(Boolean);

      return { name: gateway, promotions: gatewayPromotions };
    }) || [];

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
  }, {});

  // Loading State
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-red-600 mx-auto"></div>
        <p className="mt-4 text-lg">
          {language === "bn" ? "লোড হচ্ছে..." : "Loading..."}
        </p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p className="text-lg font-medium">{error}</p>
      </div>
    );
  }

  // No Methods
  if (depositPaymentMethods.length === 0) {
    return (
      <div className="p-8 text-center text-gray-600">
        {language === "bn"
          ? "কোনো পেমেন্ট মেথড উপলব্ধ নেই"
          : "No payment methods available"}
      </div>
    );
  }

  // Main UI (একদিকে কোনো চেঞ্জ হয়নি – ১০০% আগের মতোই)
  return (
    <div className="flex flex-col overflow-y-auto max-h-[99vh] custom-scrollbar-hidden lg:flex-row gap-6 px-2 lg:px-6 pb-10 lg:pb-0">
      {/* Left Tabs */}
      <div className="lg:w-1/4 grid grid-cols-4 lg:flex lg:flex-col gap-2 py-6">
        {depositPaymentMethods.map((method) => (
          <div
            key={method._id}
            className={`relative flex flex-col items-center lg:items-start lg:flex-row p-2 rounded-lg transition-all cursor-pointer ${
              selectedTab === method._id
                ? "border-2 border-red-600 bg-white shadow-md"
                : "bg-white border border-gray-300 hover:border-gray-400"
            }`}
            onClick={() => {
              setSelectedTab(method._id);
              setSelectedProcessTab(method.gateway?.[0] || null);
              setSelectedPromotion(null);
            }}
          >
            <img
              src={`${import.meta.env.VITE_API_URL}${method.methodImage}`}
              alt={method.methodName}
              className="w-12 h-12 lg:w-16 lg:h-16 object-contain"
            />
            <span className="mt-2 lg:mt-0 lg:ml-3 text-xs lg:text-base font-medium text-center lg:text-left">
              {language === "bn" ? method.methodNameBD : method.methodName}
            </span>
            {selectedTab === method._id && (
              <img src={checkImage} alt="selected" className="absolute bottom-1 right-1 w-5 h-5" />
            )}
          </div>
        ))}
      </div>

      {/* Right Content */}
      <div className="lg:w-3/4 bg-white rounded-lg shadow-lg border p-4 lg:p-6">
        {/* Header */}
        <div className="hidden lg:flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold border-l-4 border-green-600 pl-3">
            {language === "bn" ? "ডিপোজিট তথ্য" : "Deposit Info"}
          </h3>
          <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full">
            <FaRegFileAlt className="text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              {language === "bn" ? "ডিপোজিট ইতিহাস" : "Deposit History"}
            </span>
          </div>
        </div>

        {/* Mobile Icons */}
        <div className="flex justify-end gap-4 lg:hidden mb-4">
          <FaRegFileAlt className="text-2xl text-gray-700" />
          <RiCustomerService2Line className="text-2xl text-gray-700" />
        </div>

        {/* Important Notice */}
        <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg mb-6 text-sm">
          <strong>NOTE:</strong>{" "}
          {language === "bn"
            ? "অনুগ্রহ করে আপনার ডিপোজিট করার পরে অবশ্যই আপনার Trx-ID সাবমিট করবেন।"
            : "Please submit your Trx-ID after deposit for faster processing."}
        </div>

        {/* Selected Method Badge */}
        <div className="inline-flex items-center gap-3 bg-pink-50 text-black px-4 py-2 rounded-lg mb-6">
          {depositPaymentMethods
            .filter((m) => m._id === selectedTab)
            .map((m) => (
              <div key={m._id} className="flex items-center gap-3">
                <img
                  src={`${import.meta.env.VITE_API_URL}${m.methodImage}`}
                  alt=""
                  className="w-18 h-10 rounded"
                />
                <span className="font-bold">
                  {language === "bn" ? m.methodNameBD : m.methodName} VIP | OP
                </span>
              </div>
            ))}
        </div>

        {/* Warning */}
        <div className="bg-gray-800 text-white p-4 rounded-lg mb-6 flex items-center gap-3">
          <FaExclamationTriangle className="text-2xl flex-shrink-0" />
          <p className="text-sm">
            {language === "bn"
              ? "অনুগ্রহ করে সতর্ক থাকুন! কেউ টেলিগ্রাম বা ফেসবুকে আমাদের নামে ডিপোজিট নিচ্ছে না। শুধুমাত্র এই প্ল্যাটফর্ম দিয়ে ডিপোজিট করুন।"
              : "Beware of scammers! We only accept deposits through this platform."}
          </p>
        </div>

        {/* Channel Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {tabsData[selectedTab]?.processTabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => handleProcessTabChange(tab.name)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedProcessTab === tab.name
                  ? "bg-red-100 text-red-700 border-2 border-red-600"
                  : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Common Content */}
        <CommonContent
          amounts={tabsData[selectedTab]?.amounts || []}
          selectedProcessTab={selectedProcessTab}
          selectedPromotion={selectedPromotion}
          depositPaymentMethods={depositPaymentMethods}  // এটা যোগ করো
          language={language}
          tabsData={tabsData}
          selectedTab={selectedTab}
          handlePromotionChange={handlePromotionChange}
          userInputs={tabsData[selectedTab]?.userInputs || []}
          minAmount={tabsData[selectedTab]?.minAmount || 100}
          maxAmount={tabsData[selectedTab]?.maxAmount || 25000}
          selectedAmount={selectedAmount}
          setSelectedAmount={setSelectedAmount}
        />
      </div>
    </div>
  );
};

export default TabsWrapper;