import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/Context/AuthContext";
import axios from "axios";
import CommonWithdrawContent from "./CommonWithdrawContent";
import checkImage from "../../../assets/check.8cbcb507.svg";
import { FaRegFileAlt } from "react-icons/fa";
import { RiCustomerService2Line } from "react-icons/ri";

const WithdrawTabsWrapper = () => {
  const { language, userId } = useContext(AuthContext);
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(null);
  const [selectedProcessTab, setSelectedProcessTab] = useState(null);
  const [image, setImage] = useState(null);
  console.log(userId)

  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_API_URL}/api/withdraw-payment-methods/methods`
      )
      .then((res) => {
        if (res.data.success) {
          const data = res.data.data;
          setMethods(data);
          if (data.length > 0) {
            setSelectedTab(data[0]._id);
            setSelectedProcessTab(data[0].gateway?.[0] || null);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const tabsData = methods.reduce((acc, method) => {
    acc[method._id] = {
      label: language === "bn" ? method.methodNameBD : method.methodName,
      Image: method.methodImage,
      processTabs: (method.gateway || []).map((g) => ({ name: g })),
      amounts: method.amounts || [200, 500, 1000, 2000, 5000, 10000],
      userInputs: method.userInputs || [],
      minAmount: method.minAmount || 200,
      maxAmount: method.maxAmount || 30000,
      buttonColor: method.buttonColor,
      backgroundColor: method.backgroundColor,
      instruction: method.instruction,
      instructionBD: method.instructionBD,
      agentWalletText: method.agentWalletText,
      agentWalletNumber: method.agentWalletNumber,
    };
    return acc;
  }, {});

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (methods.length === 0)
    return (
      <div className="p-4 text-center">No withdrawal methods available</div>
    );

  const currentTabData = tabsData[selectedTab];

  return (
    <div className="flex flex-col overflow-y-auto max-h-[99vh] custom-scrollbar-hidden lg:flex-row gap-6 px-2 lg:px-6 pb-10 lg:pb-0">
      {/* Left Tabs */}
      <div className="lg:w-1/4 grid grid-cols-4 lg:flex lg:flex-col gap-2 py-6">
        {methods.map((method, idx) => (
          <div
            key={method._id}
            className={`relative flex flex-col items-center lg:items-start lg:flex-row p-2 ${
              selectedTab === method._id
                ? "border-textRed bg-white border"
                : "bg-white border"
            } cursor-pointer rounded-lg shadow-sm hover:shadow-md transition-shadow`}
            onClick={() => {
              setSelectedTab(method._id);
              setImage(method.methodImage);
              setSelectedProcessTab(method.gateway?.[0] || null);
            }}
          >
            <img
              src={`${import.meta.env.VITE_API_URL}${method.methodImage}`}
              alt={method.methodName}
              className="w-12 h-12 lg:w-16 lg:h-16 object-contain"
              onError={(e) => (e.target.src = "/fallback-image.png")}
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
        {/* Opay section link removed as requested */}
      </div>

      {/* Right Content */}
      <div className="lg:w-3/4 lg:overflow-y-auto lg:max-h-[99vh] custom-scrollbar-hidden bg-white p-4 border rounded-lg shadow-sm">
        {/* তোমার বাকি UI একদম আগের মতো */}
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
          {currentTabData.processTabs.map((processTab) => (
            <button
              key={processTab.name}
              onClick={() => setSelectedProcessTab(processTab.name)}
              className={`p-3 px-4 text-left rounded-lg ${
                selectedProcessTab === processTab.name
                  ? "border-textRed border bg-red-50"
                  : "border border-gray-300"
              } hover:bg-red-100 transition-colors`}
            >
              {processTab.name}
            </button>
          ))}
        </div>

        <CommonWithdrawContent
          amounts={currentTabData.amounts}
          selectedProcessTab={selectedProcessTab}
          selectedTab={selectedTab}
          language={language}
          currentMethod={currentTabData} // এটাই পুরো ডাটা
          userInputs={currentTabData.userInputs}
          minAmount={currentTabData.minAmount}
          maxAmount={currentTabData.maxAmount}
        />
      </div>
    </div>
  );
};

export default WithdrawTabsWrapper;
