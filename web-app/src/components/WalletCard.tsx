import { Wallet } from "../types";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const WalletCard = ({ wallet }: { wallet: Wallet }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(wallet.address);
    toast.success("Address copied to clipboard!");
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold">{wallet.name}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
        {wallet.address}
      </p>
      <button
        onClick={copyToClipboard}
        className="text-secondary hover:underline text-sm mt-2"
      >
        Copy Address
      </button>
      <p className="mt-2">Balance: {wallet.balance} SLW</p>
      <p>Stake: {wallet.stake} SLW</p>
    </motion.div>
  );
};

export default WalletCard;