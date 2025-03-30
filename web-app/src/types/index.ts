export interface User {
  id: number;
  email: string;
}

export interface Wallet {
  id: string;
  user_id: number;
  name: string;
  address: string;
  balance: number;
  stake: number;
}

export interface Transaction {
  from_address: string;
  to_address: string;
  amount: number;
}

export interface Escrow {
  id: string;
  amount: number;
  status: "pending" | "claimed";
}