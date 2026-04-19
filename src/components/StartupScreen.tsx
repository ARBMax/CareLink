import { motion } from "motion/react";
import { CareLinkLogo } from "./CareLinkLogo";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export function StartupScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing Core...");

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    const statusInterval = setInterval(() => {
      const statuses = [
        "Calibrating Neural Pathways...",
        "Establishing Secure Link...",
        "Probing Data Structures...",
        "Optimizing Analytical Engine...",
        "System Ready."
      ];
      setStatus(statuses[Math.floor(Math.random() * statuses.length)]);
    }, 800);

    return () => {
      clearInterval(timer);
      clearInterval(statusInterval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617] text-[#E4E3E0] font-mono technical-grid overflow-hidden">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 1,
          ease: [0.16, 1, 0.3, 1]
        }}
        className="mb-12"
      >
        <CareLinkLogo size={160} />
      </motion.div>

      <div className="w-80 space-y-6 relative z-10">
        <div className="flex justify-between text-[10px] uppercase tracking-[0.3em] opacity-50 font-bold">
          <motion.span
            key={status}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {status}
          </motion.span>
          <span>{progress}%</span>
        </div>
        
        <div className="h-[1px] w-full bg-white/5 overflow-hidden rounded-full">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-600 to-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear" }}
          />
        </div>

        <div className="flex items-center justify-center gap-3 text-[8px] opacity-20 uppercase tracking-[0.5em] mt-8">
          <Loader2 className="h-3 w-3 animate-spin" />
          CareLink Intelligence Systems &bull; Secure Boot
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-12 text-[10px] uppercase tracking-widest opacity-20"
      >
        Awaiting Authorization...
      </motion.div>
      
      {/* Scanning Line Effect */}
      <motion.div 
        className="absolute left-0 right-0 bg-gradient-to-b from-transparent via-neon-cyan/10 to-transparent h-32 pointer-events-none z-[1]"
        animate={{ top: ["-20%", "120%"] }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
      />
    </div>
  );
}
