import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const KYCVerification = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [kycToken] = useState(state?.kyc_token);
  const [photo, setPhoto] = useState<File | null>(null);
  const [formData, setFormData] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  console.log("KYCVerification - id:", id);
  console.log("KYCVerification - kycToken:", kycToken);

  useEffect(() => {
    if (!id || !kycToken) {
      setError("Invalid or missing KYC details");
      toast.error("Invalid KYC link");
      navigate("/login");
    }
  }, [id, kycToken, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo || !formData) {
      toast.error("Please upload a photo and provide additional information");
      return;
    }
    setLoading(true);
    const form = new FormData();
    form.append("kyc_token", kycToken);
    form.append("photo_path", photo);
    form.append("form_data", formData);

    try {
      console.log("Submitting KYC for id:", id); // Add this
      const { data } = await api.post(`/auth/kyc/${id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(data.message || "KYC submitted successfully!");
      toast.success(data.message || "KYC submitted successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      console.error("KYC submission error:", err.response || err);
      const errorMsg = err.response?.data?.error || "KYC submission failed";
      const errorDetails = err.response?.data?.details || "No additional details";
      setError(`${errorMsg} - ${errorDetails}`);
      toast.error(`${errorMsg} - ${errorDetails}`);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950"
    >
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-800">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/10 to-teal-500/10 rounded-xl" />
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white tracking-tight">
          Complete KYC Verification
        </h2>
        {message ? (
          <p className="text-green-600 dark:text-green-400 text-center">{message}</p>
        ) : error ? (
          <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="photo"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Upload Photo
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center">
                <input
                  type="file"
                  id="photo"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="photo"
                  className="cursor-pointer text-blue-600 hover:underline dark:text-teal-400"
                >
                  {photo ? photo.name : "Drag or click to upload photo"}
                </label>
              </div>
            </div>
            <div>
              <label
                htmlFor="formData"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Additional Information
              </label>
              <textarea
                id="formData"
                placeholder="e.g., full name, address"
                value={formData}
                onChange={(e) => setFormData(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-teal-400 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                rows={4}
              />
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-300 ease-in-out disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                    />
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit KYC"
              )}
            </motion.button>
          </form>
        )}
      </div>
    </motion.div>
  );
};

export default KYCVerification;