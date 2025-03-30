import { useEffect, useState } from "react";
import api from "../services/api";
import WalletCard from "../components/WalletCard";
import TransactionForm from "../components/TransactionForm";
import { Wallet, Transaction } from "../types";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();  // User fetched from context
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Summary statistics
  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const totalStaked = wallets.reduce((sum, wallet) => sum + (wallet.stake || 0), 0);
  const pendingTransactions = transactions.filter(tx => tx.status === 'pending').length;

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return; // Ensure we have a user before fetching data

      setLoading(true);
      try {
        // Fetch wallets and recent transactions in parallel
        const [walletsRes, transactionsRes] = await Promise.all([
          api.get("/wallet/list"),
          api.get("/transaction/recent?limit=3")
        ]);

        if (walletsRes.data && transactionsRes.data) {
          setWallets(walletsRes.data);
          setTransactions(transactionsRes.data);
        } else {
          toast.error("No data returned from server.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]); // Dependency on `user` ensures it fetches when user is available

  // Handle wallet creation
  const handleCreateWallet = async () => {
    if (!user) return;  // Check if user is logged in
    try {
      const { data } = await api.post("/wallet/create", { email: user.email });
      setWallets((prev) => [...prev, data]);
      toast.success("Wallet created successfully!");
    } catch (error) {
      console.error("Error creating wallet:", error);
      toast.error("Failed to create wallet.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto p-4 md:p-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">Welcome back, {user?.email}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard 
          title="Total Balance" 
          value={totalBalance} 
          currency="SLW" 
          icon="💰"
          className="bg-blue-50 dark:bg-blue-900"
        />
        <SummaryCard 
          title="Total Staked" 
          value={totalStaked} 
          currency="SLW" 
          icon="⛏️"
          className="bg-purple-50 dark:bg-purple-900"
        />
        <SummaryCard 
          title="In Escrow" 
          value={pendingTransactions} 
          currency="TX" 
          icon="⏳"
          className="bg-yellow-50 dark:bg-yellow-900"
        />
        <SummaryCard 
          title="Wallets" 
          value={wallets.length} 
          currency="" 
          icon="👛"
          className="bg-green-50 dark:bg-green-900"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallets Section */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Your Wallets</h2>
            <button
              onClick={handleCreateWallet}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <span>+</span> Create Wallet
            </button>
          </div>
          
          {wallets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wallets.map((wallet) => (
                <WalletCard key={wallet.id} wallet={wallet} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow text-center">
              <p className="text-gray-600 dark:text-gray-300">You don't have any wallets yet</p>
              <button
                onClick={handleCreateWallet}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Create Your First Wallet
              </button>
            </div>
          )}
        </div>

        {/* Recent Activity Section */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Recent Transactions</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            {transactions.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((tx) => (
                  <TransactionItem key={tx.id} transaction={tx} />
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-gray-600 dark:text-gray-300">
                No recent transactions
              </div>
            )}
            {transactions.length > 0 && (
              <div className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
                <a 
                  href="/transactions" 
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View all transactions
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Form */}
      <div className="mt-8">
        <TransactionForm wallets={wallets} />
      </div>
    </motion.div>
  );
};

// Helper Components (SummaryCard and TransactionItem as before)

export default Dashboard;
