// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import api from "../services/api";
import WalletCard from "../components/WalletCard";
import TransactionForm from "../components/TransactionForm";
import { Wallet } from "../types";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);

  useEffect(() => {
    const fetchWallets = async () => {
      if (!user) return; // Ensure user is available
      try {
        // Replace with an endpoint that fetches all wallets for the user
        const { data } = await api.get("/wallet/list"); // Adjust endpoint as needed
        setWallets(data);
      } catch (error) {
        toast.error("Failed to load wallets");
      }
    };
    fetchWallets();
  }, [user]);

  const handleCreateWallet = async () => {
    if (!user) return;
    try {
      const { data } = await api.post("/wallet/create", { email: user.email });
      setWallets((prev) => [...prev, data]);
      toast.success("Wallet created successfully!");
    } catch (error) {
      toast.error("Failed to create wallet");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto p-6"
    >
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <button
        onClick={handleCreateWallet}
        className="mb-6 p-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Create Wallet
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map((wallet) => (
          <WalletCard key={wallet.id} wallet={wallet} />
        ))}
      </div>
      <TransactionForm />
    </motion.div>
  );
};

export default Dashboard;