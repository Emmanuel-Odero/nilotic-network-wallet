// src/components/Navbar.tsx
import { useState, useMemo } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaHome, FaWallet, FaExchangeAlt, FaHammer, FaCoins, FaLock, FaSun, FaMoon, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";

// Lazy-load icons for performance (optional, if splitting is desired)
// const FaHome = React.lazy(() => import("react-icons/fa").then(module => ({ default: module.FaHome })));

const Navbar: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { token, setToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLoggedIn = !!token;

  const handleLogout = () => {
    setToken(null);
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  // Memoize nav items to prevent unnecessary re-renders
  const navItems = useMemo(
    () => [
      { to: "/dashboard", label: "Dashboard", icon: <FaHome /> },
      { to: "/wallet", label: "Wallet", icon: <FaWallet /> },
      { to: "/transactions", label: "Transactions", icon: <FaExchangeAlt /> },
      { to: "/mining", label: "Mining", icon: <FaHammer /> },
      { to: "/staking", label: "Staking", icon: <FaCoins /> },
      { to: "/escrow-claim", label: "Escrow", icon: <FaLock /> },
    ],
    []
  );

  // Animation Variants
  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const mobileMenuVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { scale: 0, opacity: 0, transition: { duration: 0.3 } },
  };

  const linkVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.3 } }),
  };

  const subNavVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.1 } },
  };

  const subLinkVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  return (
    <>
      {/* Main Navbar */}
      <motion.nav
        variants={navVariants}
        initial="hidden"
        animate="visible"
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600/95 to-teal-500/95 dark:from-gray-900/95 dark:to-gray-800/95 text-white py-3 px-4 shadow-lg backdrop-blur-md border-b border-gray-200/20"
      >
        <div className="container mx-auto flex justify-between items-center">
          {/* Brand */}
          <Link
            to="/"
            className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200 hover:to-teal-300 transition-all"
          >
            Nilotic
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-base font-medium transition-colors duration-300 relative group ${
                location.pathname === "/" ? "text-blue-200" : "text-white hover:text-blue-200"
              }`}
            >
              Home
              <span className={`absolute left-0 bottom-0 h-0.5 bg-blue-200 transition-all duration-300 ${location.pathname === "/" ? "w-full" : "w-0 group-hover:w-full"}`}></span>
            </Link>
            {isLoggedIn ? (
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                className="text-base font-medium hover:text-blue-200 transition-colors duration-300 flex items-center gap-2"
              >
                <FaSignOutAlt /> Logout
              </motion.button>
            ) : (
              <>
                <Link
                  to="/register"
                  className={`text-base font-medium transition-colors duration-300 relative group ${
                    location.pathname === "/register" ? "text-blue-200" : "text-white hover:text-blue-200"
                  }`}
                >
                  Register
                  <span className={`absolute left-0 bottom-0 h-0.5 bg-blue-200 transition-all duration-300 ${location.pathname === "/register" ? "w-full" : "w-0 group-hover:w-full"}`}></span>
                </Link>
                <Link
                  to="/login"
                  className={`text-base font-medium transition-colors duration-300 relative group ${
                    location.pathname === "/login" ? "text-blue-200" : "text-white hover:text-blue-200"
                  }`}
                >
                  Login
                  <span className={`absolute left-0 bottom-0 h-0.5 bg-blue-200 transition-all duration-300 ${location.pathname === "/login" ? "w-full" : "w-0 group-hover:w-full"}`}></span>
                </Link>
              </>
            )}
            <motion.button
              whileHover={{ rotate: 360 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all duration-500"
            >
              {isDark ? <FaSun size={18} /> : <FaMoon size={18} />}
            </motion.button>
          </div>

          {/* Mobile Menu Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="md:hidden text-2xl focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile Radial Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 md:hidden overflow-y-auto py-8"
          >
            <div className="relative w-64 h-64">
              {/* Radial Gradient Background */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-teal-500 shadow-2xl"
                animate={{ scale: [1, 1.05, 1], opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Menu Items */}
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
                <motion.div custom={0} variants={linkVariants}>
                  <Link
                    to="/"
                    className={`text-base font-semibold flex items-center gap-2 transition-colors ${
                      location.pathname === "/" ? "text-blue-200" : "text-white hover:text-blue-200"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaHome /> Home
                  </Link>
                </motion.div>
                {isLoggedIn ? (
                  <motion.div custom={1} variants={linkVariants}>
                    <button
                      onClick={handleLogout}
                      className="text-base font-semibold text-white hover:text-blue-200 transition-colors flex items-center gap-2"
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <motion.div custom={1} variants={linkVariants}>
                      <Link
                        to="/register"
                        className={`text-base font-semibold flex items-center gap-2 transition-colors ${
                          location.pathname === "/register" ? "text-blue-200" : "text-white hover:text-blue-200"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <FaHome /> Register
                      </Link>
                    </motion.div>
                    <motion.div custom={2} variants={linkVariants}>
                      <Link
                        to="/login"
                        className={`text-base font-semibold flex items-center gap-2 transition-colors ${
                          location.pathname === "/login" ? "text-blue-200" : "text-white hover:text-blue-200"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <FaHome /> Login
                      </Link>
                    </motion.div>
                  </>
                )}
                <motion.div custom={isLoggedIn ? 2 : 3} variants={linkVariants}>
                  <button
                    onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}
                    className="text-base font-semibold text-white hover:text-blue-200 transition-colors flex items-center gap-2"
                  >
                    {isDark ? <FaSun size={18} /> : <FaMoon size={18} />}
                    {isDark ? "Light" : "Dark"}
                  </button>
                </motion.div>
              </div>
            </div>

            {/* Mobile Submenu */}
            {isLoggedIn && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-6 w-full max-w-xs bg-white/90 dark:bg-gray-900/90 rounded-lg p-4 shadow-lg border border-gray-200/20"
              >
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.to}
                    custom={i}
                    variants={linkVariants}
                    className="py-2"
                  >
                    <Link
                      to={item.to}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors duration-300 ${
                        location.pathname === item.to ? "text-blue-600 dark:text-teal-400 font-bold" : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submenu for Logged-In Users (Desktop) */}
      {isLoggedIn && (
        <motion.nav
          variants={subNavVariants}
          initial="hidden"
          animate="visible"
          className="fixed top-[56px] left-0 right-0 z-40 bg-white/90 dark:bg-gray-900/90 py-3 px-4 shadow-md backdrop-blur-md border-b border-gray-200/20"
        >
          <div className="container mx-auto">
            <div className="hidden md:flex justify-center space-x-8">
              {navItems.map((item, i) => (
                <motion.div key={item.to} custom={i} variants={subLinkVariants}>
                  <Link
                    to={item.to}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors duration-300 relative group ${
                      location.pathname === item.to ? "text-blue-600 dark:text-teal-400 font-bold" : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-teal-400"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                    <span className={`absolute left-0 bottom-0 h-0.5 transition-all duration-300 ${location.pathname === item.to ? "w-full bg-blue-600 dark:bg-teal-400" : "w-0 bg-blue-600 dark:bg-teal-400 group-hover:w-full"}`}></span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.nav>
      )}
    </>
  );
};

export default Navbar;