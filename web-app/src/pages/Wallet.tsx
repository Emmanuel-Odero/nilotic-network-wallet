import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Wallet = () => {
  const { token } = useAuth();
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWallets = async () => {
      if (!token) return;

      try {
        // Assuming an endpoint like GET /wallet/list to fetch user's wallets
        // For now, we'll simulate fetching a single wallet's balance
        const response = await api.get("/wallet/balance/<your-wallet-address>"); // Replace with actual address or fetch dynamically
        setWallets([response.data]);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load wallet data");
        setLoading(false);
      }
    };

    fetchWallets();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white text-center">
          Your Wallet
        </h1>
        {loading ? (
          <p className="text-center text-gray-600 dark:text-gray-300">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {wallets.map((wallet) => (
              <div
                key={wallet.address}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
              >
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  {wallet.name || "Genesis Wallet"}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Address:</strong> {wallet.address}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Balance:</strong> {wallet.balance} SLW
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Stake:</strong> {wallet.stake || 0} SLW
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;