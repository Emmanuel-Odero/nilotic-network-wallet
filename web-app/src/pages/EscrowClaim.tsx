// src/pages/EscrowClaim.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";
import { Escrow } from "../types"; // Define Escrow type
import { motion } from "framer-motion";

const EscrowClaim: React.FC = () => {
  const { user } = useAuth();
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const [claimId, setClaimId] = useState("");
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletRes, escrowRes] = await Promise.all([
          api.get("/wallet/list"),
          api.get("/escrow/list"), // Assuming an endpoint for escrow list
        ]);
        setWallets(walletRes.data.wallets || []);
        setSelectedWallet(walletRes.data.wallets[0]?.address || "");
        setEscrows(escrowRes.data.escrows || []);
      } catch (error) {
        toast.error("Failed to load escrows or wallets");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimId || !selectedWallet) {
      toast.error("Please select a wallet and enter an escrow ID");
      return;
    }
    setClaiming(true);
    try {
      await api.post("/escrow/claim", { escrow_id: claimId, wallet_address: selectedWallet });
      toast.success("Escrow claimed successfully!");
      setEscrows(prev =>
        prev.map(escrow =>
          escrow.id === claimId ? { ...escrow, status: "claimed" } : escrow
        )
      );
      setClaimId("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to claim escrow");
    } finally {
      setClaiming(false);
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
          Escrow Claims
        </h1>
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Escrow List */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Pending Escrows</h2>
              {escrows.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-300">No pending escrows found.</p>
              ) : (
                <ul className="space-y-4">
                  {escrows.map((escrow) => (
                    <motion.li
                      key={escrow.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md border border-gray-200 dark:border-gray-600"
                    >
                      <p><strong>ID:</strong> {escrow.id}</p>
                      <p><strong>Amount:</strong> {escrow.amount} SLW</p>
                      <p><strong>Status:</strong> {escrow.status}</p>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
            {/* Claim Form */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Claim Escrow</h2>
              <form onSubmit={handleClaim} className="space-y-4">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Escrow ID</label>
                  <input
                    type="text"
                    value={claimId}
                    onChange={(e) => setClaimId(e.target.value)}
                    placeholder="Enter Escrow ID"
                    className="w-full p-2 mt-1 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={claiming}
                  whileHover={{ scale: 1.02 }}
                  className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition"
                >
                  {claiming ? "Claiming..." : "Claim Escrow"}
                </motion.button>
              </form>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EscrowClaim;