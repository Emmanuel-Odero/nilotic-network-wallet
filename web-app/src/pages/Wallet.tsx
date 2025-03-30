// src/pages/Wallet.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api"; // Ensure this is your axios instance with token handling

const Wallet: React.FC = () => {
  const { token, user } = useAuth();
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newWalletName, setNewWalletName] = useState<string>("");
  const [creating, setCreating] = useState(false);

  // Fetch all wallets for the user
  useEffect(() => {
    const fetchWallets = async () => {
      if (!token || !user) return;

      try {
        const response = await api.get("/wallet/list"); // New endpoint we'll add
        setWallets(response.data.wallets || []);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load wallets");
        setLoading(false);
      }
    };
    fetchWallets();
  }, [token, user]);

  // Handle wallet creation
  const handleCreateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWalletName.trim()) {
      setError("Wallet name is required");
      return;
    }
    setCreating(true);
    setError(null);

    try {
      const response = await api.post("/wallet/create", {
        email: user?.email,
        name: newWalletName.trim(),
      });
      setWallets([...wallets, response.data]);
      setNewWalletName("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create wallet");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white text-center">
          Your Wallets
        </h1>

        {/* Create Wallet Form */}
        <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Create New Wallet
          </h2>
          <form onSubmit={handleCreateWallet} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newWalletName}
              onChange={(e) => setNewWalletName(e.target.value)}
              placeholder="Enter wallet name"
              className="flex-1 p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition"
            >
              {creating ? "Creating..." : "Create Wallet"}
            </button>
          </form>
          {error && <p className="mt-2 text-red-600">{error}</p>}
        </div>

        {/* Wallet List */}
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : wallets.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-300">
            No wallets found. Create one to get started!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wallets.map((wallet) => (
              <div
                key={wallet.address}
                className="relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"
                style={{ height: "200px", width: "300px" }} // Credit card size
              >
                {/* Card Design */}
                <div className="absolute top-4 left-4 text-xs font-mono opacity-75">
                  Nilotic Network
                </div>
                <h2 className="text-xl font-bold mt-6">{wallet.name}</h2>
                <p className="text-sm mt-2 break-all">
                  <strong>Key:</strong> {wallet.address}
                </p>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                  <div>
                    <p className="text-sm">
                      <strong>Balance:</strong> {wallet.balance.toFixed(2)} SLW
                    </p>
                    <p className="text-sm">
                      <strong>Stake:</strong> {wallet.stake.toFixed(2)} SLW
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;