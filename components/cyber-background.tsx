"use client"

import { motion } from "framer-motion"

interface CyberBackgroundProps {
  animate?: any
}

export function CyberBackground({ animate }: CyberBackgroundProps) {
  return (
    <motion.div 
      className="absolute top-[-10vh] left-[-10vw] w-[120vw] h-[120vh] z-0 overflow-hidden"
      animate={animate}
      style={{
        transformOrigin: "center center",
        willChange: "transform",
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
      }}
    >
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-500"
        style={{
          backgroundImage: `url("/img website/background.jpg")`,
        }}
      />
      {/* Dark overlay instead of hardware-heavy CSS filter */}
      <div className="absolute inset-0 bg-[#000]/30 pointer-events-none" />

      {/* Warm beige wash filter */}
      <div className="absolute inset-0 bg-[#c69c72]/5 mix-blend-overlay pointer-events-none" />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </motion.div>
  )
}
