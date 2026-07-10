"use client"

import { useEffect, useRef } from "react"

export function CyberBackground() {
  return (
    <div className="fixed inset-0 z-0">
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
    </div>
  )
}
