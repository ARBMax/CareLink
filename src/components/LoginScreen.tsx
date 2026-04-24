import { motion } from "motion/react";
import { CareLinkLogo } from "./CareLinkLogo";
import { LogIn, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "./AuthProvider";

export function LoginScreen() {
  const { login, isLoggingIn } = useAuth();

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center text-[#E4E3E0] font-mono"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay to ensure text readability against the bright earth image */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 relative z-10"
      >
        <CareLinkLogo size={80} />
      </motion.div>

      <div className="text-center space-y-6 max-w-sm px-6 relative z-10">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tighter drop-shadow-lg">
            Care<span className="text-primary">Link</span>
          </h1>
          <p className="text-[10px] opacity-90 uppercase tracking-widest leading-relaxed drop-shadow-md">
            Humanitarian Intelligence Hub. Secure Authorization Required to Access Action Networks.
          </p>
        </div>

        <Button 
          onClick={login}
          disabled={isLoggingIn}
          className="w-full bg-[#E4E3E0] text-[#141414] hover:bg-white transition-all uppercase text-[10px] tracking-widest font-bold py-6 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingIn ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="mr-2 h-4 w-4" />
          )}
          {isLoggingIn ? "Authorizing..." : "Authorize via Google"}
        </Button>

        <div className="text-[8px] opacity-70 uppercase tracking-[0.3em] drop-shadow-md">
          End-to-End Encryption &bull; Secure Session Protocol
        </div>
      </div>
    </div>
  );
}
