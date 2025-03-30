import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from query string
  const getTokenFromQuery = () => {
    const params = new URLSearchParams(location.search);
    return params.get("token");
  };

  useEffect(() => {
    const verifyToken = async () => {
      const token = getTokenFromQuery();
      if (!token) {
        toast.error("Invalid or missing verification token");
        navigate("/login");
        return;
      }

      try {
        const { data } = await api.get(`/auth/verify?token=${token}`);
        toast.success(data.message || "Email verified successfully!");
        if (data.kyc_token) {
          // Redirect to KYC if required
          navigate("/auth/kyc/:id", {
            state: { user_id: data.user_id, kyc_token: data.kyc_token },
          });
        } else {
          navigate("/login");
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Verification failed");
        navigate("/login");
      }
    };

    verifyToken();
  }, [navigate, location.search]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950"
    >
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-800">
        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/10 to-teal-500/10 rounded-xl" />

        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Verifying Your Email
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-300">
          Please wait while we verify your email address...
        </p>
        <div className="flex justify-center mt-6">
          <svg
            className="animate-spin h-8 w-8 text-blue-600 dark:text-teal-400"
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
        </div>
      </div>
    </motion.div>
  );
};

export default VerifyEmail;