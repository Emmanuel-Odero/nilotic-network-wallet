// src/context/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  kycRequired: boolean;
  setKycRequired: (kycRequired: boolean) => void;
  userId: number | null;
  setUserId: (userId: number | null) => void;
  user: { id: number; email: string } | null; // Add user to context
  setUser: (user: { id: number; email: string } | null) => void; // Add setUser
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [kycRequired, setKycRequired] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [user, setUser] = useState<{ id: number; email: string } | null>(null); // Add user state

  // Update token in localStorage whenever it changes
  const handleSetToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
    }
    setToken(newToken);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken: handleSetToken,
        kycRequired,
        setKycRequired,
        userId,
        setUserId,
        user,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};