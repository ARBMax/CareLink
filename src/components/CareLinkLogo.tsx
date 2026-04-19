import React from "react";
import { HeartPulse, Link2 } from "lucide-react";
import { motion } from "motion/react";

export function CareLinkLogo({ size = 40, className = "" }: { size?: number, className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-0 bg-primary/20 rounded-xl blur-lg"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      />
      <div className="relative flex items-center justify-center">
        <HeartPulse className="h-full w-full text-primary" style={{ height: size * 0.8, width: size * 0.8 }} />
        <Link2 
          className="absolute -bottom-1 -right-1 text-foreground" 
          style={{ height: size * 0.45, width: size * 0.45 }} 
        />
      </div>
    </div>
  );
}
