import image from "../../assets/0.png";

const NameTab = ({language,formData,handleInputChange}) => {

    return (
        <div className="flex flex-col min-h-screen px-2 lg:px-0  gap-4">

                  <div className="flex items-center mt-2  gap-2 w-full">
                    <div className="w-[20%]">
                    <img src={image} alt="" className="rounded-full w-[80%]"/>
                    </div>
                    
                    <p>rohankh</p>
                  </div>
                {/* Nickname Input */}
                <div className="flex items-center  gap-6 w-full">
                  <label htmlFor="nickName" className="block text-sm font-semibold w-[20%] text-right ">
                    {language === "bn" ? "উপনাম:" : "Nickname:"} 
                  </label>
                  <input
                    type="text"
                    id="nickName"
                    name="nickName"
                    value={formData.nickName}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-black rounded mt-2"
                    placeholder={
                      language === "bn" ? "আপনার উপনাম" : "Enter your nickname"
                    }
                  />
                </div>
              
                {/* Email Input */}
                <div className="flex items-center gap-6  w-full">
                  <label htmlFor="email" className="block
                   w-[20%] text-right text-sm   font-semibold">
                    {language === "bn" ? "ইমেইল:" : "Email:"} 
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-black rounded mt-2"
                    placeholder={
                      language === "bn" ? "আপনার ইমেইল" : "Enter your email"
                    }
                  />
                </div>
              
                {/* Full Name Input */}
                <div className="flex items-center gap-6 w-full">
                  <label htmlFor="fullName" className="block w-[20%] text-right  text-sm  font-semibold">
                    {language === "bn" ? "পুরোনাম:" : "Full Name:"} 
                  </label>
                  <div className="w-full flex flex-col">
                  
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-black rounded mt-2"
                    placeholder={
                      language === "bn" ? "আপনার পুরো নাম" : "Enter your full name"
                    }
                  />
                  <p className="text-textRed text-sm">
                  {
                      language === "bn" ? "দয়া করে আপনার নামটি উত্তোলন তথ্যের সাথে মেলে কিনা তা নিশ্চিত করুন, যাতে ব্যর্থ না হয়।" : "Please ensure your full name matches the details to avoid any failure."
                    }
                    </p>
                    
                    </div>
                </div>
              </div>
    );
};

export default NameTab;