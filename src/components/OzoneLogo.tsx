import { motion } from "motion/react";

interface OzoneLogoProps {
  className?: string;
  size?: number;
}

export function OzoneLogo({ className = "", size = 40 }: OzoneLogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="ozoneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0066FF" />
            <stop offset="100%" stopColor="#00F3FF" />
          </linearGradient>
        </defs>
        
        {/* Main O Ring */}
        <motion.path
          d="M50 15C30.67 15 15 30.67 15 50C15 69.33 30.67 85 50 85C69.33 85 85 69.33 85 50"
          stroke="url(#ozoneGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        
        {/* Subscript 3 */}
        <motion.text
          x="65"
          y="85"
          fill="#0066FF"
          fontSize="32"
          fontWeight="bold"
          fontFamily="sans-serif"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          3
        </motion.text>
      </svg>
    </div>
  );
}
