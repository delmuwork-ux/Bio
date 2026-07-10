"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { PROFILE } from "@/lib/constants"

interface ProfileCardProps {
  showWhiteStrip?: boolean
  stripPhase?: "vertical" | "full" | "horizontal" | "done"
  activeStat?: "X" | "WaveBox" | "Booth" | null
}

export function ProfileCard({ showWhiteStrip = false, stripPhase = "done", activeStat = null }: ProfileCardProps) {
  const [hasEntered, setHasEntered] = useState(false)

  useEffect(() => {
    const handler = () => {
      setHasEntered(true)
      // Emit complete event to page controller after characters finish entering (0.9s)
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("profileAnimationComplete"))
      }, 900)
    }
    window.addEventListener("startNameAnimation", handler)
    return () => window.removeEventListener("startNameAnimation", handler)
  }, [])

  const nameChars = [
    { char: "月", color: "#ffffff", rotate: "-6deg", y: "-4px" },
    { char: "白", color: "#ffffff", rotate: "4deg", y: "3px" },
    { char: "あ", color: "#ffd27d", rotate: "-5deg", y: "-2px" },
    { char: "く", color: "#ffd27d", rotate: "6deg", y: "2px" },
    { char: "む", color: "#ffd27d", rotate: "-2deg", y: "5px" },
  ]

  return (
    <div className="relative flex items-center justify-center">
      <motion.div 
        className="flex flex-col items-center justify-center"
      >
        <div className="relative flex items-center justify-center gap-4 select-none py-4 px-8">
          {showWhiteStrip && stripPhase !== "done" && (
            <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
              <div
                className="absolute bg-white left-0 right-0"
                style={{
                  top: 0,
                  height: stripPhase === "vertical" ? "0%" : "50%",
                  left: stripPhase === "horizontal" ? "50%" : "0%",
                  right: stripPhase === "horizontal" ? "50%" : "0%",
                  transition: "all 0.28s cubic-bezier(0.25, 1, 0.5, 1)",
                }}
              />
              <div
                className="absolute bg-white left-0 right-0"
                style={{
                  bottom: 0,
                  height: stripPhase === "vertical" ? "0%" : "50%",
                  left: stripPhase === "horizontal" ? "50%" : "0%",
                  right: stripPhase === "horizontal" ? "50%" : "0%",
                  transition: "all 0.28s cubic-bezier(0.25, 1, 0.5, 1)",
                }}
              />
            </div>
          )}
          {nameChars.map((item, idx) => {
            const targetY = parseFloat(item.y) || 0
            const targetRotate = parseFloat(item.rotate) || 0
            return (
              <motion.span
                key={idx}
                className="text-6xl md:text-7xl font-extrabold relative inline-block"
                initial={{ 
                  opacity: 0, 
                  scale: 0.1, 
                  y: 0, 
                  rotate: 0 
                }}
                animate={hasEntered ? { 
                  opacity: 1, 
                  scale: [0.1, 1.5, 1.0], 
                  y: [0, targetY * 1.4, targetY], 
                  rotate: [0, targetRotate * 1.4, targetRotate] 
                } : { 
                  opacity: 0, 
                  scale: 0.1, 
                  y: 0, 
                  rotate: 0 
                }}
                transition={{
                  duration: 0.55,
                  ease: "easeOut",
                  delay: idx * 0.12
                }}
                style={{
                  fontFamily: "var(--font-pixel), monospace",
                  color: item.color,
                  textShadow: `
                    -4px -4px 0 #5c3d2e,  
                     4px -4px 0 #5c3d2e,
                    -4px  4px 0 #5c3d2e,  
                     4px  4px 0 #5c3d2e,
                   0px -4px 0 #5c3d2e,  
                   0px  4px 0 #5c3d2e,
                  -4px  0px 0 #5c3d2e,  
                   4px  0px 0 #5c3d2e,
                   0 8px 16px rgba(92, 61, 46, 0.45)
                `
              }}
            >
              {item.char}
            </motion.span>
          )
          })}
        </div>

        {/* Social Icons for Booth, X, and Wavebox */}
        <motion.div
          className="flex justify-center gap-6 mt-6 relative z-10"
          initial={{ opacity: 0, y: 15 }}
          animate={hasEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
        >
          {/* Booth.pm */}
          <motion.div
            role="button"
            tabIndex={0}
            className="flex items-center justify-center p-2 cursor-pointer border-none bg-transparent"
            data-icon-id="Booth"
            layoutId={activeStat === "Booth" ? "delmu-image-card" : undefined}
            onClick={() => {
              window.dispatchEvent(new CustomEvent("boothClick"))
            }}
            onMouseEnter={() => {
              window.dispatchEvent(new CustomEvent("statHover", { detail: { label: "Booth" } }))
            }}
            onMouseLeave={() => {
              window.dispatchEvent(new CustomEvent("statHover", { detail: { label: null } }))
            }}
            whileHover={{ scale: 1.15, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 16 16" 
              fill="#ffffff" 
              className="w-12 h-12"
              style={{
                filter: "drop-shadow(-3px -3px 0 #5c3d2e) drop-shadow(3px -3px 0 #5c3d2e) drop-shadow(-3px 3px 0 #5c3d2e) drop-shadow(3px 3px 0 #5c3d2e) drop-shadow(0px 6px 0px rgba(92, 61, 46, 0.45))"
              }}
            >
              {/* Left stem */}
              <rect x="3" y="2" width="3" height="12" />
              {/* Top bar of loop */}
              <rect x="6" y="2" width="6" height="3" />
              {/* Right wall of loop */}
              <rect x="9" y="5" width="3" height="4" />
              {/* Bottom bar of loop */}
              <rect x="6" y="8" width="6" height="3" />
            </svg>
          </motion.div>

          {/* X (formerly Twitter) */}
          <motion.div
            role="button"
            tabIndex={0}
            className="flex items-center justify-center p-2 cursor-pointer border-none bg-transparent"
            data-icon-id="X"
            layoutId={activeStat === "X" ? "delmu-image-card" : undefined}
            onClick={() => {
              window.dispatchEvent(new CustomEvent("delmuClick"))
            }}
            onMouseEnter={() => {
              window.dispatchEvent(new CustomEvent("statHover", { detail: { label: "@_Delmu" } }))
            }}
            onMouseLeave={() => {
              window.dispatchEvent(new CustomEvent("statHover", { detail: { label: null } }))
            }}
            whileHover={{ scale: 1.15, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 16 16" 
              fill="#ffd27d" 
              className="w-12 h-12"
              style={{
                filter: "drop-shadow(-3px -3px 0 #5c3d2e) drop-shadow(3px -3px 0 #5c3d2e) drop-shadow(-3px 3px 0 #5c3d2e) drop-shadow(3px 3px 0 #5c3d2e) drop-shadow(0px 6px 0px rgba(92, 61, 46, 0.45))"
              }}
            >
              {/* Thick diagonal */}
              <rect x="0" y="0" width="3" height="3" />
              <rect x="2" y="2" width="3" height="3" />
              <rect x="4" y="4" width="3" height="3" />
              <rect x="6" y="6" width="4" height="4" />
              <rect x="9" y="9" width="3" height="3" />
              <rect x="11" y="11" width="3" height="3" />
              <rect x="13" y="13" width="3" height="3" />
              
              {/* Thin diagonal */}
              <rect x="14" y="0" width="2" height="2" />
              <rect x="12" y="2" width="2" height="2" />
              <rect x="10" y="4" width="2" height="2" />
              <rect x="4" y="10" width="2" height="2" />
              <rect x="2" y="12" width="2" height="2" />
              <rect x="0" y="14" width="2" height="2" />
            </svg>
          </motion.div>

          {/* WaveBox */}
          <motion.div
            role="button"
            tabIndex={0}
            className="flex items-center justify-center p-2 cursor-pointer border-none bg-transparent"
            data-icon-id="WaveBox"
            layoutId={activeStat === "WaveBox" ? "delmu-image-card" : undefined}
            onClick={() => {
              window.dispatchEvent(new CustomEvent("waveboxClick"))
            }}
            onMouseEnter={() => {
              window.dispatchEvent(new CustomEvent("statHover", { detail: { label: "δあくむ✁︎🥀" } }))
            }}
            onMouseLeave={() => {
              window.dispatchEvent(new CustomEvent("statHover", { detail: { label: null } }))
            }}
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 16 16" 
              fill="#ffffff" 
              className="w-12 h-12"
              style={{
                filter: "drop-shadow(-3px -3px 0 #5c3d2e) drop-shadow(3px -3px 0 #5c3d2e) drop-shadow(-3px 3px 0 #5c3d2e) drop-shadow(3px 3px 0 #5c3d2e) drop-shadow(0px 6px 0px rgba(92, 61, 46, 0.45))"
              }}
            >
              {/* Outer border of the envelope */}
              <rect x="0" y="3" width="16" height="1" />
              <rect x="0" y="12" width="16" height="1" />
              <rect x="0" y="4" width="1" height="8" />
              <rect x="15" y="4" width="1" height="8" />
              {/* Inner envelope flap lines */}
              <rect x="1" y="4" width="2" height="1" />
              <rect x="13" y="4" width="2" height="1" />
              <rect x="3" y="5" width="2" height="1" />
              <rect x="11" y="5" width="2" height="1" />
              <rect x="5" y="6" width="2" height="1" />
              <rect x="9" y="6" width="2" height="1" />
              <rect x="7" y="7" width="2" height="1" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
