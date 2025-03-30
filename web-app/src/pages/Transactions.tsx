// src/pages/Transactions.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Transaction } from "../types";
import { FaPaperPlane, FaHistory, FaDownload, FaWallet } from "react-icons/fa";

const Transactions: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWalletSend, setSelectedWalletSend] = useState<string>("");
  const [selectedWalletFilter, setSelectedWalletFilter] = useState<string>("all");
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [sendAmount, setSendAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"send" | "history">("send");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletRes, txRes] = await Promise.all([
          api.get("/wallet/list"),
          api.get("/transaction/history"),
        ]);
        setWallets(walletRes.data.wallets || []);
        setTransactions(txRes.data.transactions || []);
        setSelectedWalletSend(walletRes.data.wallets[0]?.address || "");
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredTransactions = selectedWalletFilter === "all"
    ? transactions
    : transactions.filter(tx => tx.address === selectedWalletFilter);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWalletSend || !recipientAddress || sendAmount <= 0) {
      toast.error("Please fill in all fields with valid data");
      return;
    }
    const wallet = wallets.find(w => w.address === selectedWalletSend);
    if (wallet.balance < sendAmount) {
      toast.error("Insufficient balance");
      return;
    }

    setSending(true);
    try {
      const res = await api.post("/transaction/send", {
        sender_address: selectedWalletSend,
        receiver_address: recipientAddress,
        amount: sendAmount,
      });
      toast.success(`Sent ${sendAmount} SLW!`);
      setTransactions([
        {
          id: res.data.transaction_id || Date.now().toString(),
          type: "Sent",
          amount: sendAmount,
          address: selectedWalletSend,
          date: new Date().toISOString(),
        },
        ...transactions,
      ]);
      setWallets(wallets.map(w => w.address === selectedWalletSend ? { ...w, balance: w.balance - sendAmount } : w));
      setRecipientAddress("");
      setSendAmount(0);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Transaction failed");
    } finally {
      setSending(false);
    }
  };

  const handleExport = () => {
    const csv = [
      "ID,Type,Amount,Address,Date",
      ...filteredTransactions.map(tx => `${tx.id},${tx.type},${tx.amount},${tx.address},${tx.date}`)
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-5xl font-extrabold text-center bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent mb-10">
          Transaction Hub
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-t-blue-500 border-gray-300 dark:border-gray-600 rounded-full"
            />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Tabs */}
            <div className="flex justify-center gap-4 mb-6">
              <motion.button
                onClick={() => setActiveTab("send")}
                whileHover={{ scale: 1.05 }}
                className={`px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-all ${
                  activeTab === "send"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                <FaPaperPlane /> Send Tokens
              </motion.button>
              <motion.button
                onClick={() => setActiveTab("history")}
                whileHover={{ scale: 1.05 }}
                className={`px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-all ${
                  activeTab === "history"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                <FaHistory /> History
              </motion.button>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {activeTab === "send" ? (
                <motion.div
                  key="send"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700"
                >
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                    <FaPaperPlane className="text-blue-500" /> Send SLW Tokens
                  </h2>
                  <form onSubmit={handleSend} className="space-y-6">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        From Wallet
                      </label>
                      <div className="relative">
                        <FaWallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <select
                          value={selectedWalletSend}
                          onChange={(e) => setSelectedWalletSend(e.target.value)}
                          className="w-full pl-10 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                          {wallets.map(wallet => (
                            <option key={wallet.address} value={wallet.address}>
                              {wallet.name} ({wallet.address.slice(0, 8)}...) - {wallet.balance} SLW
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Recipient Address
                      </label>
                      <input
                        type="text"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        placeholder="Enter recipient address"
                        className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Amount (SLW)
                      </label>
                      <input
                        type="number"
                        value={sendAmount}
                        onChange={(e) => setSendAmount(parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                      <span className="absolute right-3 top-1/2 text-gray-500 dark:text-gray-400 transform translate-y-2">
                        SLW
                      </span>
                    </div>
                    <motion.button
                      type="submit"
                      disabled={sending}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full p-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                    >
                      {sending ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-5 h-5 border-2 border-t-white border-gray-300 rounded-full"
                        />
                      ) : (
                        <>
                          <FaPaperPlane /> Send Now
                        </>
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FaHistory className="text-blue-500" /> Transaction History
                    </h2>
                    <div className="flex items-center gap-4">
                      <select
                        value={selectedWalletFilter}
                        onChange={(e) => setSelectedWalletFilter(e.target.value)}
                        className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      >
                        <option value="all">All Wallets</option>
                        {wallets.map(wallet => (
                          <option key={wallet.address} value={wallet.address}>
                            {wallet.name} ({wallet.address.slice(0, 8)}...)
                          </option>
                        ))}
                      </select>
                      <motion.button
                        onClick={handleExport}
                        whileHover={{ scale: 1.05 }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                      >
                        <FaDownload /> Export
                      </motion.button>
                    </div>
                  </div>
                  {filteredTransactions.length === 0 ? (
                    <p className="text-center text-gray-600 dark:text-gray-300 py-10">
                      No transactions yet. Start sending some SLW!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredTransactions.map((tx) => (
                        <motion.div
                          key={tx.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.03 }}
                          className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                tx.type === "Sent"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                                  : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                              }`}
                            >
                              {tx.type}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                              {new Date(tx.date).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {tx.amount.toFixed(2)} SLW
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                            {tx.address.slice(0, 8)}...{tx.address.slice(-8)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(tx.date).toLocaleDateString()}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Transactions;