// src/App.tsx
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";
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
  const { token, kycRequired, userId, user } = useAuth();

  const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    if (!token) return <Navigate to="/login" />;
    if (kycRequired && userId) return <Navigate to={`/auth/kyc/${userId}`} />;
    // Removed !user check since token implies authentication
    return children;
  };

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} /> {/* Removed setUser */}
            <Route path="/register" element={<Register />} /> {/* Update Register similarly if needed */}
            <Route path="/verify" element={<VerifyEmail />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/kyc/:id" element={<KYCVerification />} />
            <Route path="/resend-verification" element={<ResendVerification />} />
            <Route
              path="/dashboard"
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>} // Removed user prop
            />
            <Route
              path="/wallet"
              element={<ProtectedRoute><Wallet /></ProtectedRoute>}
            />
            <Route
              path="/transactions"
              element={<ProtectedRoute><Transactions /></ProtectedRoute>}
            />
            <Route
              path="/mining"
              element={<ProtectedRoute><Mining /></ProtectedRoute>}
            />
            <Route
              path="/staking"
              element={<ProtectedRoute><Staking /></ProtectedRoute>}
            />
            <Route
              path="/escrow-claim"
              element={<ProtectedRoute><EscrowClaim /></ProtectedRoute>}
            />
          </Routes>
          <Toaster position="top-right" reverseOrder={false} />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;