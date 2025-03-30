// src/App.tsx
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Register from "./components/Register";
import Login from "./components/Login";
import EscrowClaim from "./pages/EscrowClaim";
import KYCVerification from "./components/KYCVerification";
import VerifyEmail from "./components/VerifyEmail";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import ResendVerification from "./components/ResendVerification";
import Wallet from "./pages/Wallet";
import Transactions from "./pages/Transactions";
import Mining from "./pages/Mining";
import Staking from "./pages/Staking";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { token, kycRequired, userId } = useAuth(); // Destructuring from useAuth

  // ProtectedRoute component
  const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    // Check if the user is authenticated
    if (!token) {
      return <Navigate to="/login" />;
    }

    // Check if KYC is required
    if (kycRequired && userId) {
      return <Navigate to={`/auth/kyc/${userId}`} />;
    }

    // Return the children if user is authenticated and KYC is completed
    return children;
  };

  return (
    <AuthProvider> {/* Wrap the entire app with AuthProvider */}
      <Router>
        <div className="min-h-screen">
          <Navbar />
          <div className="mt-30"> {/* Add padding-top to the content to accommodate the navbar */}
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              {/* Redirect logged-in users from login page to dashboard */}
              <Route
                path="/login"
                element={token ? <Navigate to="/dashboard" /> : <Login />}
              />
              <Route path="/register" element={<Register />} />
              <Route path="/verify" element={<VerifyEmail />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/kyc/:id" element={<KYCVerification />} />
              <Route path="/resend-verification" element={<ResendVerification />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wallet"
                element={
                  <ProtectedRoute>
                    <Wallet />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <Transactions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mining"
                element={
                  <ProtectedRoute>
                    <Mining />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staking"
                element={
                  <ProtectedRoute>
                    <Staking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/escrow-claim"
                element={
                  <ProtectedRoute>
                    <EscrowClaim />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
          {/* Notification Toast */}
          <Toaster position="top-right" reverseOrder={false} />
        </div>
      </Router>
    </AuthProvider> 
  );
};

export default App;
