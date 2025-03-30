import axios from "axios";

// Create Axios instance with base URL from environment variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5500", // Fallback for safety
});

// JWT Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication APIs
export const register = async (email: string, password: string) => {
  const response = await api.post("/auth/register", { email, password });
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const verifyEmail = async (token: string) => {
  const response = await api.get("/auth/verify", { params: { token } });
  return response.data;
};

export const submitKYC = async (userId: number, kycToken: string, photo: File, formData: any) => {
  const data = new FormData();
  data.append("kyc_token", kycToken);
  data.append("photo_path", photo);
  data.append("form_data", JSON.stringify(formData));

  const response = await api.post(`/auth/kyc/${userId}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (token: string, password: string) => {
  const response = await api.post("/auth/reset-password", { token, password });
  return response.data;
};

export const resendVerification = async (email: string) => {
  const response = await api.post("/auth/resend-verification", { email });
  return response.data;
};

// Wallet APIs
export const createWallet = async (email: string, name: string = "Genesis Wallet") => {
  const response = await api.post("/wallet/create", { email, name });
  return response.data;
};

export const getWalletBalance = async (address: string) => {
  const response = await api.get(`/wallet/balance/${address}`);
  return response.data;
};

// Transaction APIs
export const sendTransaction = async (
  senderEmail: string,
  recipientEmail: string,
  amount: number
) => {
  const response = await api.post("/transaction/send", {
    sender_email: senderEmail,
    recipient_email: recipientEmail,
    amount,
  });
  return response.data;
};

// Mining APIs
export const mine = async (walletAddress: string, stakeAmount: number = 0) => {
  const response = await api.post("/mining/mine", {
    wallet_address: walletAddress,
    stake: stakeAmount,
  });
  return response.data;
};

// Escrow APIs
export const claimEscrow = async (escrowId: number, otp: string, email: string) => {
  const response = await api.post(`/escrow/claim/${escrowId}`, { otp, email });
  return response.data;
};

export const checkExpiredEscrows = async () => {
  const response = await api.get("/escrow/check-expired");
  return response.data;
};

export default api;