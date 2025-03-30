import { useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const TransactionForm = () => {
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAddress || !toAddress || !amount) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/transaction/send", {
        from_address: fromAddress,
        to_address: toAddress,
        amount: parseFloat(amount),
      });
      toast.success(data.message || "Transaction sent successfully!");
      setFromAddress("");
      setToAddress("");
      setAmount("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      onSubmit={handleSubmit}
      className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
    >
      <h2 className="text-xl font-bold mb-4">Send Transaction</h2>
      <input
        type="text"
        placeholder="From Address"
        value={fromAddress}
        onChange={(e) => setFromAddress(e.target.value)}
        className="w-full p-3 mb-4 border rounded dark:bg-gray-700 dark:border-gray-600"
      />
      <input
        type="text"
        placeholder="To Address"
        value={toAddress}
        onChange={(e) => setToAddress(e.target.value)}
        className="w-full p-3 mb-4 border rounded dark:bg-gray-700 dark:border-gray-600"
      />
      <input
        type="number"
        placeholder="Amount (SLW)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-3 mb-4 border rounded dark:bg-gray-700 dark:border-gray-600"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full p-3 bg-secondary text-white rounded hover:opacity-90 transition"
      >
        {loading ? <span className="animate-spin">⏳</span> : "Send"}
      </button>
    </motion.form>
  );
};

export default TransactionForm;