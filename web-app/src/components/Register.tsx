import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const Register = ({ setUser }: { setUser: (user: any) => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields", {
        duration: 4000, // 4 seconds for errors
      });
      return;
    }
    setLoading(true);
    try {
      const response = await register(email, password);
      toast.success(
        "Account created! Please check your email to verify your account.",
        {
          duration: 10000, // 10 seconds
          position: "top-center", // Ensure visibility
          style: {
            background: "#10B981", // Green background for success
            color: "#fff",
            padding: "16px",
            fontSize: "16px",
          },
        }
      );
      setTimeout(() => navigate("/login"), 10000); // Redirect after 10 seconds
    } catch (error: any) {
      const errMsg = error.response?.data?.error || "Registration failed";
      toast.error(errMsg, {
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
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
        {/* Decorative Background Element */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/10 to-teal-500/10 rounded-xl" />

        {/* Header */}
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white tracking-tight">
          Join Nilotic Wallet
        </h2>

        {/* Form */}
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
              placeholder="Create a password"
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
                Creating Account...
              </span>
            ) : (
              "Create Account"
            )}
          </motion.button>
        </form>

        {/* Additional Links */}
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 dark:text-teal-400 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;