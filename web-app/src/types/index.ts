export interface User {
  id: number;
  email: string;
}

export interface Wallet {
  id: number;
  name: string;
  address: string;
  balance: number;
  stake?: number;
}

export interface Transaction {
  id: string;
  date: string;
  type: "Sent" | "Received" | "Mined";
  amount: number;
  address: string;
}

export interface Escrow {
  id: string;
  amount: number;
  status: "pending" | "claimed";
}