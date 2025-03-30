import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Invalid reset link");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await resetPassword(token, password);
      setMessage(response.message);
      setTimeout(() => navigate("/login"), 3000); // Redirect after 3s
    } catch (err: any) {
      setError(err.response?.data?.error || "Reset failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Reset Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            required
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            required
          />
          <button
            type="submit"
            className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Reset Password
          </button>
        </form>
        {message && <p className="text-green-600 text-center mt-4">{message}</p>}
        {error && <p className="text-red-600 text-center mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;