import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"; // Importing icons

const PasswordTab = ({ language, formData, handleInputChange, setFormData }) => {
  return (
    <div className="flex flex-col gap-4 whitespace-nowrap">
      {/* Current Password Input */}
      <div className="flex items-center gap-20 w-full">
        <label htmlFor="currentPassword" className="block w-[20%] text-right text-sm font-semibold">
          {language === "bn" ? "বর্তমান পাসওয়ার্ড" : "Current Password"} :
        </label>
        <div className="w-full flex flex-col relative">
          <input
            type={formData.showCurrentPassword ? "text" : "password"}
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleInputChange}
            className="w-full p-2 border border-black rounded mt-2"
            placeholder={language === "bn" ? "আপনার বর্তমান পাসওয়ার্ড" : "Enter your current password"}
          />
          <button
            type="button"
            onClick={() => setFormData({ ...formData, showCurrentPassword: !formData.showCurrentPassword })}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500"
          >
            {formData.showCurrentPassword ? (
              <AiFillEyeInvisible size={20} />
            ) : (
              <AiFillEye size={20} />
            )}
          </button>
        </div>
      </div>

      {/* New Password Input */}
      <div className="flex items-center gap-20 w-full">
        <label htmlFor="newPassword" className="block w-[20%] text-right text-sm font-semibold">
          {language === "bn" ? "নতুন পাসওয়ার্ড" : "New Password"} :
        </label>
        <div className="w-full flex flex-col relative">
          <input
            type={formData.showNewPassword ? "text" : "password"}
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            className="w-full p-2 border border-black rounded mt-2"
            placeholder={language === "bn" ? "আপনার নতুন পাসওয়ার্ড" : "Enter your new password"}
          />
          <button
            type="button"
            onClick={() => setFormData({ ...formData, showNewPassword: !formData.showNewPassword })}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500"
          >
            {formData.showNewPassword ? (
              <AiFillEyeInvisible size={20} />
            ) : (
              <AiFillEye size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Confirm New Password Input */}
      <div className="flex items-center gap-20 w-full">
        <label htmlFor="confirmPassword" className="block w-[20%] text-right text-sm font-semibold">
          {language === "bn" ? "পাসওয়ার্ড নিশ্চিত করুন" : "Confirm Password"} :
        </label>
        <div className="w-full flex flex-col relative">
          <input
            type={formData.showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="w-full p-2 border border-black rounded mt-2"
            placeholder={language === "bn" ? " নতুন পাসওয়ার্ড নিশ্চিত করুন" : "Confirm your new password"}
          />
          <button
            type="button"
            onClick={() => setFormData({ ...formData, showConfirmPassword: !formData.showConfirmPassword })}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500"
          >
            {formData.showConfirmPassword ? (
              <AiFillEyeInvisible size={20} />
            ) : (
              <AiFillEye size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordTab;
