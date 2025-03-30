// src/pages/Mining.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const Mining: React.FC = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const [stakeAmount, setStakeAmount] = useState<number>(0);
  const [miningHistory, setMiningHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mining, setMining] = useState(false);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const res = await api.get("/wallet/list");
        setWallets(res.data.wallets || []);
        setSelectedWallet(res.data.wallets[0]?.address || "");
        // Mock mining history (replace with real endpoint)
        setMiningHistory([{ id: "1", address: "550e...", reward: 5, date: new Date().toISOString() }]);
      } catch (error) {
        toast.error("Failed to load wallets");
      } finally {
        setLoading(false);
      }
    };
    fetchWallets();
  }, []);

  const handleMine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWallet || stakeAmount <= 0) {
      toast.error("Please select a wallet and enter a valid stake amount");
      return;
    }
    setMining(true);
    try {
      const res = await api.post("/mine", { stake: stakeAmount, address: selectedWallet });
      toast.success(`Mined block! Reward: ${res.data.reward} SLW`);
      setMiningHistory([...miningHistory, { id: res.data.blockHash, address: selectedWallet, reward: res.data.reward, date: new Date().toISOString() }]);
      setStakeAmount(0);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Mining failed");
    } finally {
      setMining(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6"
    >
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Mining Dashboard
        </h1>
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mining Form */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Mine a Block</h2>
              <form onSubmit={handleMine} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Wallet</label>
                  <select
                    value={selectedWallet}
                    onChange={(e) => setSelectedWallet(e.target.value)}
                    className="w-full p-2 mt-1 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                  >
                    {wallets.map(wallet => (
                      <option key={wallet.address} value={wallet.address}>
                        {wallet.name} ({wallet.address.slice(0, 8)}...) - {wallet.balance} SLW
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stake Amount (SLW)</label>
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.1"
                    className="w-full p-2 mt-1 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={mining}
                  whileHover={{ scale: 1.02 }}
                  className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition"
                >
                  {mining ? "Mining..." : "Start Mining"}
                </motion.button>
              </form>
            </div>
            {/* Mining History */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Mining History</h2>
              {miningHistory.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-300">No mining activity yet.</p>
              ) : (
                <ul className="space-y-4">
                  {miningHistory.map((entry) => (
                    <li key={entry.id} className="border-b dark:border-gray-700 pb-2">
                      <p><strong>Block:</strong> {entry.id.slice(0, 8)}...</p>
                      <p><strong>Wallet:</strong> {entry.address.slice(0, 8)}...</p>
                      <p><strong>Reward:</strong> {entry.reward} SLW</p>
                      <p><strong>Date:</strong> {new Date(entry.date).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Mining;