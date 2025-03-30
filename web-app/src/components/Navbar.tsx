import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const { token, setToken } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setToken(null);
    navigate("/login");
  };

  // Animation variants for navbar
  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const submenuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
  };

  const isLoggedIn = !!token;

  return (
    <>
      {/* Main Navbar */}
      <motion.nav
        variants={navVariants}
        initial="hidden"
        animate="visible"
        className="sticky top-0 z-50 bg-gradient-to-r from-blue-600/90 to-teal-500/90 dark:from-gray-800/90 dark:to-gray-900/90 text-white py-4 px-6 shadow-lg backdrop-blur-md border-b border-gray-200/20"
      >
        <div className="container mx-auto flex justify-between items-center">
          {/* Brand */}
          <Link to="/" className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            Nilotic Wallet
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-lg hover:text-blue-200 transition-colors duration-300">
              Home
            </Link>
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="text-lg hover:text-blue-200 transition-colors duration-300"
              >
                Logout
              </button>
            ) : (
              <>
                <Link to="/register" className="text-lg hover:text-blue-200 transition-colors duration-300">
                  Register
                </Link>
                <Link to="/login" className="text-lg hover:text-blue-200 transition-colors duration-300">
                  Login
                </Link>
              </>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors duration-300"
            >
              {isDark ? "☀️" : "🌙"}
            </motion.button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-2xl focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? "✖" : "☰"}
          </button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          variants={mobileMenuVariants}
          initial="hidden"
          animate={isMobileMenuOpen ? "visible" : "hidden"}
          className="md:hidden bg-blue-600/90 dark:bg-gray-800/90 px-6 py-4 space-y-4"
        >
          <Link to="/" className="block text-lg hover:text-blue-200 transition-colors duration-300" onClick={() => setIsMobileMenuOpen(false)}>
            Home
          </Link>
          {isLoggedIn ? (
            <button
              onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
              className="block text-lg hover:text-blue-200 transition-colors duration-300"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/register" className="block text-lg hover:text-blue-200 transition-colors duration-300" onClick={() => setIsMobileMenuOpen(false)}>
                Register
              </Link>
              <Link to="/login" className="block text-lg hover:text-blue-200 transition-colors duration-300" onClick={() => setIsMobileMenuOpen(false)}>
                Login
              </Link>
            </>
          )}
          <button
            onClick={toggleTheme}
            className="block p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors duration-300"
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </motion.div>
      </motion.nav>

      {/* Submenu for Logged-In Users */}
      {isLoggedIn && (
        <motion.nav
          variants={submenuVariants}
          initial="hidden"
          animate="visible"
          className="sticky top-[64px] z-40 bg-white/80 dark:bg-gray-900/80 py-3 px-6 shadow-md backdrop-blur-md border-b border-gray-200/20"
        >
          <div className="container mx-auto flex justify-center space-x-6 md:space-x-10">
            <Link
              to="/dashboard"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-300"
            >
              Dashboard
            </Link>
            <Link
              to="/wallet"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-300"
            >
              Wallet
            </Link>
            <Link
              to="/transactions"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-300"
            >
              Transactions
            </Link>
            <Link
              to="/mining"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-300"
            >
              Mining
            </Link>
            <Link
              to="/staking"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-300"
            >
              Staking
            </Link>
            <Link
              to="/escrow-claim"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-300"
            >
              Escrow Claim
            </Link>
          </div>
        </motion.nav>
      )}
    </>
  );
};

export default Navbar;