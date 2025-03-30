// src/components/Login.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const Login = () => { // Removed setUser prop
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setToken, setKycRequired, setUserId, setUser } = useAuth(); // Added setUser
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await login(email, password);
      console.log("Login response:", response);
      if (response.access_token) {
        setToken(response.access_token);
        setKycRequired(false);
        setUserId(null);
        setUser({ id: response.user_id || 0, email }); // Set user in context; adjust if user_id is returned
        toast.success("Logged in successfully!");
        navigate("/dashboard");
      } else if (response.kyc_required) {
        if (!response.user_id) {
          console.error("No user_id in response:", response);
          setError("Server error: Missing user ID for KYC");
          toast.error("Server error: Missing user ID for KYC");
          setLoading(false);
          return;
        }
        setToken(null);
        setKycRequired(true);
        setUserId(response.user_id);
        setUser(null); // Clear user if KYC is required
        setError("Please complete KYC verification to proceed.");
        toast("Please complete KYC verification to proceed.", {
          style: {
            background: "#e0f7fa",
            color: "#006064",
          },
        });
        const kycPath = `/auth/kyc/${response.user_id}`;
        console.log("Navigating to:", kycPath, "with kyc_token:", response.kyc_token);
        navigate(kycPath, { state: { kyc_token: response.kyc_token } });
      } else {
        setError(response.error || "Login failed. Please check your credentials.");
        toast.error(response.error || "Login failed. Please check your credentials.");
      }
    } catch (err: any) {
      console.error("Login error:", err.response || err);
      const errorMsg = err.response?.data?.error || "Login failed due to a server error. Please try again later.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-800"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/10 to-teal-500/10 rounded-xl" />
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white tracking-tight">
          Sign In to Nilotic Wallet
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div variants={inputVariants}>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-teal-400 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
            />
          </motion.div>
          <motion.div variants={inputVariants}>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-teal-400 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
            />
          </motion.div>
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
                Signing In...
              </span>
            ) : (
              "Sign In"
            )}
          </motion.button>
        </form>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-red-600 dark:text-red-400 text-sm"
          >
            {error}
          </motion.p>
        )}
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            Forgot your password?{" "}
            <Link
              to="/forgot-password"
              className="text-blue-600 dark:text-teal-400 hover:underline"
            >
              Reset it
            </Link>
          </p>
          <p className="mt-2">
            Need to verify your email?{" "}
            <Link
              to="/resend-verification"
              className="text-blue-600 dark:text-teal-400 hover:underline"
            >
              Resend Verification Link
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;