import { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import { FaSave, FaTimes, FaUpload } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { baseURL_For_IMG_UPLOAD, API_URL } from "../../utils/baseURL";

// Styled Components
const EditContainer = styled.div`
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
`;

const EditTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const FormGrid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
`;

const FormItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormLabel = styled.label`
  font-weight: 600;
  color: #111827;
`;

const FormInput = styled.input`
  height: 42px;
  padding: 0 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  outline: none;
  transition: border 0.2s;
  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const FormSelect = styled.select`
  height: 42px;
  padding: 0 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  font-size: 0.875rem;
`;

const FormCheckbox = styled.input`
  width: 20px;
  height: 20px;
  accent-color: #2563eb;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #1e40af;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  &:hover {
    background: #1e3a8a;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  &:hover {
    background: #b91c1c;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ImageUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ImagePreview = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #4b5563;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  &:hover {
    background: #374151;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
  font-size: 1.125rem;
  color: #4b5563;
`;

const ErrorAlert = styled.div`
  padding: 1rem;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 0.375rem;
  text-align: center;
`;

const UserDetailsEditProfile = ({ onCancel }) => {
  const { userId } = useParams();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [originalImage, setOriginalImage] = useState(null); // To keep old image if no new upload

  // Load user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/users/${userId}`);
        const user = res.data;

        setFormData({
          username: user.username || "",
          email: user.email || "",
          whatsapp: user.whatsapp || "",
          password: "",
          role: user.role || "user",
          isActive: user.isActive ?? true,
          balance: user.balance || 0,
          commissionBalance: user.commissionBalance || 0,
          gameLossCommission: user.gameLossCommission || 0,
          depositCommission: user.depositCommission || 0,
          referCommission: user.referCommission || 0,
          gameLossCommissionBalance: user.gameLossCommissionBalance || 0,
          depositCommissionBalance: user.depositCommissionBalance || 0,
          referCommissionBalance: user.referCommissionBalance || 0,
          referralCode: user.referralCode || "",
          profileImage: null, // Will be File if changed
        });

        setImagePreview(user.profileImage || null);
        setOriginalImage(user.profileImage || null);
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to load user";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? Number(value)
          : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target.result);
        setFormData((prev) => ({ ...prev, profileImage: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return originalImage;

    setUploading(true);
    const form = new FormData();
    form.append("image", file);

    try {
      const res = await axios.post(baseURL_For_IMG_UPLOAD, form);
      return res.data.imageUrl; // Adjust if your API returns differently
    } catch (err) {
      toast.error("Image upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);

    try {
      let finalImageUrl = originalImage;

      if (formData.profileImage instanceof File) {
        finalImageUrl = await handleImageUpload(formData.profileImage);
        if (!finalImageUrl) {
          setSaving(false);
          return;
        }
      }

      const payload = {
        ...formData,
        profileImage: finalImageUrl,
      };

      // Don't send empty password
      if (!payload.password?.trim()) {
        delete payload.password;
      }

      await axios.put(`${API_URL}/api/users/${userId}`, payload);

      toast.success("Profile updated successfully!");
      onCancel(); // Go back to view mode
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to update profile";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingContainer>Loading user data...</LoadingContainer>;
  if (error) return <ErrorAlert>{error}</ErrorAlert>;

  return (
    <>
      <EditContainer>
        <EditTitle>Edit User Profile</EditTitle>

        <form onSubmit={handleSubmit}>
          <FormGrid>
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormInput
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </FormItem>

            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormInput
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </FormItem>

            <FormItem>
              <FormLabel>Whatsapp (Phone)</FormLabel>
              <FormInput
                type="text"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
              />
            </FormItem>

            <FormItem>
              <FormLabel>Password (leave blank to keep current)</FormLabel>
              <FormInput
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="New password only"
              />
            </FormItem>

            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormSelect
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </FormSelect>
            </FormItem>

            <FormItem>
              <FormLabel>Active Status</FormLabel>
              <FormCheckbox
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
            </FormItem>

            <FormItem>
              <FormLabel>Balance</FormLabel>
              <FormInput
                type="number"
                name="balance"
                value={formData.balance}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </FormItem>

            <FormItem>
              <FormLabel>Commission Balance</FormLabel>
              <FormInput
                type="number"
                name="commissionBalance"
                value={formData.commissionBalance}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </FormItem>

            <FormItem>
              <FormLabel>Game Loss Commission</FormLabel>
              <FormInput
                type="number"
                name="gameLossCommission"
                value={formData.gameLossCommission}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </FormItem>

            <FormItem>
              <FormLabel>Deposit Commission</FormLabel>
              <FormInput
                type="number"
                name="depositCommission"
                value={formData.depositCommission}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </FormItem>

            <FormItem>
              <FormLabel>Refer Commission</FormLabel>
              <FormInput
                type="number"
                name="referCommission"
                value={formData.referCommission}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </FormItem>

            <FormItem>
              <FormLabel>Game Loss Comm. Balance</FormLabel>
              <FormInput
                type="number"
                name="gameLossCommissionBalance"
                value={formData.gameLossCommissionBalance}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </FormItem>

            <FormItem>
              <FormLabel>Deposit Comm. Balance</FormLabel>
              <FormInput
                type="number"
                name="depositCommissionBalance"
                value={formData.depositCommissionBalance}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </FormItem>

            <FormItem>
              <FormLabel>Refer Comm. Balance</FormLabel>
              <FormInput
                type="number"
                name="referCommissionBalance"
                value={formData.referCommissionBalance}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </FormItem>

            <FormItem>
              <FormLabel>Referral Code</FormLabel>
              <FormInput
                type="text"
                name="referralCode"
                value={formData.referralCode}
                onChange={handleChange}
              />
            </FormItem>

            <FormItem>
              <FormLabel>Profile Image</FormLabel>
              <ImageUploadContainer>
                {imagePreview && (
                  <ImagePreview
                    src={
                      imagePreview.startsWith("data:")
                        ? imagePreview
                        : `${baseURL_For_IMG_UPLOAD}s/${imagePreview}`
                    }
                    alt="Profile"
                  />
                )}
                <UploadButton
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving || uploading}
                >
                  <FaUpload /> {uploading ? "Uploading..." : "Change Image"}
                </UploadButton>
                <HiddenFileInput
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </ImageUploadContainer>
            </FormItem>
          </FormGrid>

          <ButtonContainer>
            <CancelButton
              type="button"
              onClick={onCancel}
              disabled={saving || uploading}
            >
              <FaTimes /> Cancel
            </CancelButton>
            <SaveButton type="submit" disabled={saving || uploading}>
              <FaSave /> {saving ? "Saving..." : "Save Changes"}
            </SaveButton>
          </ButtonContainer>
        </form>
      </EditContainer>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default UserDetailsEditProfile;
