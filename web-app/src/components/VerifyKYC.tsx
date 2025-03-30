import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const VerifyKYC = () => {
  const [photo, setPhoto] = useState<File | null>(null);
  const [formData, setFormData] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [kycToken, setKycToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract user_id and kyc_token from route state (passed from Login)
  useEffect(() => {
    const { user_id, kyc_token } = (location.state as { user_id: number; kyc_token: string }) || {};
    if (!user_id || !kyc_token) {
      toast.error("Missing KYC verification details. Please log in again.");
      navigate("/login");
    } else {
      setUserId(user_id);
      setKycToken(kyc_token);
    }
  }, [location, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo || !formData || !userId || !kycToken) {
      toast.error("Please complete all fields");
      return;
    }

    setLoading(true);
    const form = new FormData();
    form.append("kyc_token", kycToken);
    form.append("photo_path", photo);
    form.append("form_data", formData);

    try {
      const { data } = await api.post(`/auth/kyc/${userId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(data.message || "KYC verification submitted successfully!");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "KYC submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex justify-center items-center min-h-screen"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Verify KYC</h2>

        {/* Drag-and-Drop File Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Upload Photo</label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="cursor-pointer text-secondary hover:underline"
            >
              {photo ? photo.name : "Drag or click to upload photo"}
            </label>
          </div>
        </div>

        {/* Form Data Input */}
        <textarea
          placeholder="Additional Information (e.g., full name, address)"
          value={formData}
          onChange={(e) => setFormData(e.target.value)}
          className="w-full p-3 mb-4 border rounded dark:bg-gray-700 dark:border-gray-600"
          rows={4}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-gradient-to-r from-primary to-secondary text-white rounded hover:opacity-90 transition"
        >
          {loading ? <span className="animate-spin">⏳</span> : "Submit KYC"}
        </button>
      </form>
    </motion.div>
  );
};

export default VerifyKYC;