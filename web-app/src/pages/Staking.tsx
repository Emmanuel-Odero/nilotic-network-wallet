// src/pages/Staking.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const Staking: React.FC = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const [stakeAmount, setStakeAmount] = useState<number>(0);
  const [staking, setStaking] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const res = await api.get("/wallet/list");
        setWallets(res.data.wallets || []);
        setSelectedWallet(res.data.wallets[0]?.address || "");
      } catch (error) {
        toast.error("Failed to load wallets");
      } finally {
        setLoading(false);
      }
    };
    fetchWallets();
  }, []);

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWallet || stakeAmount <= 0) {
      toast.error("Please select a wallet and enter a valid stake amount");
      return;
    }
    setStaking(true);
    try {
      await api.post("/stake", { address: selectedWallet, amount: stakeAmount });
      toast.success(`Staked ${stakeAmount} SLW successfully!`);
      setWallets(wallets.map(w => w.address === selectedWallet ? { ...w, stake: (w.stake || 0) + stakeAmount, balance: w.balance - stakeAmount } : w));
      setStakeAmount(0);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Staking failed");
    } finally {
      setStaking(false);
    }
  };

  const handleUnstake = async (address: string) => {
    setStaking(true);
    try {
      await api.post("/unstake", { address }); // Assuming an unstake endpoint
      toast.success("Unstaked successfully!");
      setWallets(wallets.map(w => w.address === address ? { ...w, stake: 0, balance: w.balance + w.stake } : w));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Unstaking failed");
    } finally {
      setStaking(false);
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
          Staking Portal
        </h1>
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stake Form */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Stake SLW</h2>
              <form onSubmit={handleStake} className="space-y-4">
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
                  disabled={staking}
                  whileHover={{ scale: 1.02 }}
                  className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition"
                >
                  {staking ? "Staking..." : "Stake Now"}
                </motion.button>
              </form>
            </div>
            {/* Staking Status */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Staking Status</h2>
              {wallets.filter(w => w.stake > 0).length === 0 ? (
                <p className="text-gray-600 dark:text-gray-300">No staked funds yet.</p>
              ) : (
                <ul className="space-y-4">
                  {wallets.filter(w => w.stake > 0).map(wallet => (
                    <li key={wallet.address} className="border-b dark:border-gray-700 pb-2 flex justify-between items-center">
                      <div>
                        <p><strong>{wallet.name}</strong> ({wallet.address.slice(0, 8)}...)</p>
                        <p><strong>Staked:</strong> {wallet.stake} SLW</p>
                      </div>
                      <button
                        onClick={() => handleUnstake(wallet.address)}
                        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                        disabled={staking}
                      >
                        Unstake
                      </button>
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

export default Staking;