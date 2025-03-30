import { useState } from "react";
import { forgotPassword } from "../services/api";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await forgotPassword(email);
      setMessage(response.message);
      setTimeout(() => navigate("/login"), 3000); // Redirect after 3s
    } catch (err: any) {
      setError(err.response?.data?.error || "Request failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Forgot Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            required
          />
          <button
            type="submit"
            className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Send Reset Link
          </button>
        </form>
        {message && <p className="text-green-600 text-center mt-4">{message}</p>}
        {error && <p className="text-red-600 text-center mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;