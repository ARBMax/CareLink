import { useState, useEffect } from "react";
import { Dashboard } from "./components/Dashboard";
import { StartupScreen } from "./components/StartupScreen";
import { LoginScreen } from "./components/LoginScreen";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import { AnimatePresence, motion } from "motion/react";

function AppContent() {
  const [isStarting, setIsStarting] = useState(false);
  const { user, loading } = useAuth();

  // Trigger startup sequence when user logs in
  useEffect(() => {
    if (user && !loading) {
      setIsStarting(true);
    }
  }, [user, loading]);

  if (loading) return null;

  return (
    <>
      <AnimatePresence mode="wait">
        {!user ? (
          <LoginScreen key="login" />
        ) : isStarting ? (
          <motion.div
            key="startup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
          >
            <StartupScreen onComplete={() => setIsStarting(false)} />
          </motion.div>
        ) : (
          <Dashboard key="dashboard" />
        )}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
