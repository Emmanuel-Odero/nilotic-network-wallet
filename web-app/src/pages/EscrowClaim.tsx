import { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { Escrow } from "../types";
import { motion } from "framer-motion";

const EscrowClaim = () => {
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [claimId, setClaimId] = useState("");
  const [loading, setLoading] = useState(false);

  // Mock fetch for escrows (replace with real API call)
  useEffect(() => {
    const fetchEscrows = async () => {
      try {
        // Replace with actual endpoint once backend is ready
        const mockEscrows: Escrow[] = [
          { id: "1", amount: 100, status: "pending" },
          { id: "2", amount: 50, status: "claimed" },
        ];
        setEscrows(mockEscrows);
      } catch (error) {
        toast.error("Failed to load escrows");
      }
    };
    fetchEscrows();
  }, []);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimId) {
      toast.error("Please enter an escrow ID");
      return;
    }
    setLoading(true);
    try {
      // Replace with actual API call
      await api.post("/escrow/claim", { escrow_id: claimId });
      toast.success("Escrow claimed successfully!");
      setEscrows((prev) =>
        prev.map((escrow) =>
          escrow.id === claimId ? { ...escrow, status: "claimed" } : escrow
        )
      );
      setClaimId("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to claim escrow");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto p-6"
    >
      <h1 className="text-3xl font-bold mb-6">Escrow Claim</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Pending Escrows</h2>
          {escrows.length === 0 ? (
            <p>No pending escrows found.</p>
          ) : (
            <ul className="space-y-4">
              {escrows.map((escrow) => (
                <motion.li
                  key={escrow.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
                >
                  <p>ID: {escrow.id}</p>
                  <p>Amount: {escrow.amount} SLW</p>
                  <p>Status: {escrow.status}</p>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
        <form
          onSubmit={handleClaim}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <h2 className="text-xl font-semibold mb-4">Claim Escrow</h2>
          <input
            type="text"
            placeholder="Escrow ID"
            value={claimId}
            onChange={(e) => setClaimId(e.target.value)}
            className="w-full p-3 mb-4 border rounded dark:bg-gray-700 dark:border-gray-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-secondary text-white rounded hover:opacity-90 transition"
          >
            {loading ? <span className="animate-spin">⏳</span> : "Claim"}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default EscrowClaim;