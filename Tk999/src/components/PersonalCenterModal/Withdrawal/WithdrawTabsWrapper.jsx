import { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import checkImage from "../../../assets/check.8cbcb507.svg";
import { FaRegFileAlt } from "react-icons/fa";
import { RiCustomerService2Line } from "react-icons/ri";
import { baseURL_For_IMG_UPLOAD } from "@/utils/baseURL";
import CommonWithdrawContent from "./CommonWithdrawContent";
import { getWithdrawPaymentMethods } from "@/features/withdrawPaymentMethod/withdrawPaymentMethodThunkAndSlice";
import { AuthContext } from "@/Context/AuthContext";

const WithdrawTabsWrapper = () => {
      const {language} = useContext(AuthContext)
  const dispatch = useDispatch();
  const { withdrawPaymentMethods, isLoading: paymentMethodsLoading, error: paymentMethodsError } = useSelector((state) => state.withdrawPaymentGateway || {});
  const [selectedTab, setSelectedTab] = useState(null);
  const [selectedProcessTab, setSelectedProcessTab] = useState(null);

  useEffect(() => {
    dispatch(getWithdrawPaymentMethods());
  }, [dispatch]);

  useEffect(() => {
    if (Array.isArray(withdrawPaymentMethods) && withdrawPaymentMethods.length > 0 && !selectedTab) {
      setSelectedTab(withdrawPaymentMethods[0]._id);
      setSelectedProcessTab(withdrawPaymentMethods[0].gateway?.[0] || null);
    }
  }, [withdrawPaymentMethods, selectedTab]);

  const handleProcessTabChange = (processTab) => {
    setSelectedProcessTab(processTab);
  };

  // Dynamic tabs data from withdraw payment methods
  const tabsData = Array.isArray(withdrawPaymentMethods)
    ? withdrawPaymentMethods.reduce((acc, method) => {
        const processTabs = Array.isArray(method.gateway)
          ? method.gateway.map((gateway) => ({
              name: gateway,
            }))
          : [];

        acc[method._id] = {
          label: language === "bn" ? method.methodNameBD : method.methodName,
          Image: method.methodImage,
          processTabs,
          amounts: method.amounts || [200, 500, 1000, 2000, 5000, 10000],
          userInputs: Array.isArray(method.userInputs) ? method.userInputs : [],
          minAmount: method.minAmount || 200,
          maxAmount: method.maxAmount || 30000,
        };

        return acc;
      }, {})
    : {};

  if (paymentMethodsLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-bgRed mx-auto"></div>
        {language === "bn" ? "লোড হচ্ছে..." : "Loading..."}
      </div>
    );
  }

  if (paymentMethodsError) {
    return <div className="p-4 text-center text-red-500">{language === "bn" ? `ত্রুটি: ${paymentMethodsError}` : `Error: ${paymentMethodsError}`}</div>;
  }

  if (!withdrawPaymentMethods || withdrawPaymentMethods.length === 0) {
    return <div className="p-4 text-center">{language === "bn" ? "কোনো উইথড্রয়াল মেথড উপলব্ধ নেই" : "No withdrawal methods available"}</div>;
  }

  if (!selectedTab || !tabsData[selectedTab]) {
    return <div className="p-4 text-center">{language === "bn" ? "একটি উইথড্রয়াল মেথড নির্বাচন করুন" : "Please select a withdrawal method"}</div>;
  }

  return (
    <div className="flex flex-col overflow-y-auto max-h-[99vh] custom-scrollbar-hidden lg:flex-row gap-6 px-2 lg:px-6 pb-10 lg:pb-0">
      {/* Left Tab Navigation */}
      <div className="lg:w-1/4 grid grid-cols-4 lg:flex lg:flex-col gap-2 py-6">
        {withdrawPaymentMethods.map((method) => (
          <div
            className={`relative flex flex-col items-center lg:items-start lg:flex-row p-2 ${
              selectedTab === method._id ? "border-textRed bg-white border" : "bg-white border"
            } cursor-pointer rounded-lg shadow-sm hover:shadow-md transition-shadow`}
            key={method._id}
            onClick={() => {
              setSelectedTab(method._id);
              setSelectedProcessTab(method.gateway?.[0] || null);
            }}
          >
            <img
              src={`${baseURL_For_IMG_UPLOAD}s/${method.methodImage}`}
              alt={method.methodName}
              className="w-12 h-12 lg:w-16 lg:h-16 object-contain"
              onError={(e) => (e.target.src = "/fallback-image.png")} // Fallback image if loading fails
            />
            <button className="w-full text-xs lg:text-base lg:p-2 lg:text-left font-medium">
              {language === "bn" ? method.methodNameBD : method.methodName}
            </button>
            {selectedTab === method._id && (
              <div className="absolute bottom-0 right-0">
                <img src={checkImage} alt="selected" className="w-4" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right Content Area */}
      <div className="lg:w-3/4 lg:overflow-y-auto lg:max-h-[99vh] custom-scrollbar-hidden bg-white p-4 border rounded-lg shadow-sm">
        <div className="hidden lg:flex justify-between px-3 mb-6">
          <h3 className="border-l-4 pl-2 border-borderGreen text-lg font-semibold">
            {language === "en" ? "Withdrawal Info" : "উইথড্রয়াল তথ্য"}
          </h3>
          <div className="flex gap-2 font-semibold p-1 px-2 border border-depositBlue rounded-full justify-between items-center">
            <span className="text-depositBlue">
              <FaRegFileAlt />
            </span>
            <button className="text-sm text-depositBlue">
              {language === "en" ? "Withdrawal History" : "উইথড্রয়াল ইতিহাস"}
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

        <p className="text-sm text-textRed bg-depositHistoryTextBackground p-2 rounded-lg mb-6">
          {language === "en"
            ? "To successfully complete your withdrawal process quickly, please submit with the correct account details and amount."
            : "আপনার উইথড্রয়াল প্রক্রিয়াটি দ্রুত সম্পন্ন করতে, সঠিক অ্যাকাউন্ট বিবরণ এবং পরিমাণ সহ জমা দিন।"}
        </p>

        <div className="flex text-xs lg:text-base gap-4 mb-6 flex-wrap">
          {tabsData[selectedTab].processTabs.map((processTab) => (
            <button
              key={processTab.name}
              onClick={() => handleProcessTabChange(processTab.name)}
              className={`p-3 px-4 text-left rounded-lg ${
                selectedProcessTab === processTab.name ? "border-textRed border bg-red-50" : "border border-gray-300"
              } hover:bg-red-100 transition-colors`}
            >
              {processTab.name}
            </button>
          ))}
        </div>

        <CommonWithdrawContent
          amounts={tabsData[selectedTab].amounts}
          selectedProcessTab={selectedProcessTab}
          selectedTab={selectedTab}
          language={language}
          tabsData={tabsData}
          userInputs={tabsData[selectedTab].userInputs}
          minAmount={tabsData[selectedTab].minAmount}
          maxAmount={tabsData[selectedTab].maxAmount}
        />
      </div>
    </div>
  );
};

export default WithdrawTabsWrapper;