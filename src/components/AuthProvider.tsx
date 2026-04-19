import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "../lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoggingIn: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error.code === 'auth/cancelled-popup-request') {
        console.log("Popup request cancelled by user.");
      } else if (error.code === 'auth/unauthorized-domain') {
        alert("Firebase Error: Unauthorized Domain.\n\nPlease add these domains to your Firebase Console (Authentication > Settings > Authorized domains):\n- ais-dev-qll2t6ig77t7cpeuvux47z-598975249197.asia-southeast1.run.app\n- ais-pre-qll2t6ig77t7cpeuvux47z-598975249197.asia-southeast1.run.app");
      } else {
        alert(`Login failed: ${error.message}`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isLoggingIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
