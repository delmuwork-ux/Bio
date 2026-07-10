"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { PROFILE } from "@/lib/constants"

interface ProfileCardProps {
  showWhiteStrip?: boolean
  stripPhase?: "vertical" | "full" | "horizontal" | "done"
}

export function ProfileCard({ showWhiteStrip = false, stripPhase = "done" }: ProfileCardProps) {
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
                className="text-6xl md:text-7xl relative inline-block animate-none pixel-text-bold"
                variants={{
                  hidden: { 
                    opacity: 0, 
                    scale: 0.1, 
                    y: 0, 
                    rotate: 0 
                  },
                  visible: { 
                    opacity: 1, 
                    scale: 1.0, 
                    y: targetY, 
                    rotate: targetRotate,
                    transition: {
                      type: "spring",
                      stiffness: 180,
                      damping: 12,
                      delay: idx * 0.12
                    }
                  }
                }}
                initial="hidden"
                animate={hasEntered ? "visible" : "hidden"}
                style={{
                  color: item.color,
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
              {/* Shopping bag - Booth pixel icon */}
              {/* Bag body */}
              <rect x="2" y="6" width="12" height="9" />
              {/* Bag top rim */}
              <rect x="3" y="5" width="10" height="1" />
              {/* Handle left */}
              <rect x="5" y="2" width="2" height="4" />
              {/* Handle right */}
              <rect x="9" y="2" width="2" height="4" />
              {/* Handle top */}
              <rect x="6" y="1" width="4" height="2" />
              {/* Bag detail - B letter */}
              <rect x="6" y="8" width="1" height="5" fill="#5c3d2e" />
              <rect x="7" y="8" width="2" height="1" fill="#5c3d2e" />
              <rect x="9" y="9" width="1" height="1" fill="#5c3d2e" />
              <rect x="7" y="10" width="2" height="1" fill="#5c3d2e" />
              <rect x="9" y="11" width="1" height="1" fill="#5c3d2e" />
              <rect x="7" y="12" width="2" height="1" fill="#5c3d2e" />
            </svg>
          </motion.div>

          {/* X (formerly Twitter) */}
          <motion.div
            role="button"
            tabIndex={0}
            className="flex items-center justify-center p-2 cursor-pointer border-none bg-transparent"
            data-icon-id="X"
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
              {/* Double-struck 𝕏 brand logo - left line of thick diagonal */}
              <rect x="2" y="2" width="2" height="2" />
              <rect x="4" y="4" width="2" height="2" />
              <rect x="6" y="6" width="2" height="2" />
              <rect x="8" y="8" width="2" height="2" />
              <rect x="10" y="10" width="2" height="2" />
              <rect x="12" y="12" width="2" height="2" />
              {/* Double-struck 𝕏 brand logo - right line of thick diagonal */}
              <rect x="5" y="2" width="2" height="2" />
              <rect x="7" y="4" width="2" height="2" />
              <rect x="9" y="6" width="2" height="2" />
              <rect x="11" y="8" width="2" height="2" />
              <rect x="13" y="10" width="2" height="2" />
              <rect x="15" y="12" width="2" height="2" />
              {/* Double-struck 𝕏 brand logo - thin diagonal line crossing */}
              <rect x="12" y="2" width="2" height="2" />
              <rect x="10" y="4" width="2" height="2" />
              <rect x="8" y="6" width="2" height="2" />
              <rect x="6" y="8" width="2" height="2" />
              <rect x="4" y="10" width="2" height="2" />
              <rect x="2" y="12" width="2" height="2" />
            </svg>
          </motion.div>

          {/* WaveBox */}
          <motion.div
            role="button"
            tabIndex={0}
            className="flex items-center justify-center p-2 cursor-pointer border-none bg-transparent"
            data-icon-id="WaveBox"
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
              {/* Envelope body - filled */}
              <rect x="1" y="4" width="14" height="10" />
              {/* Envelope flap - V shape */}
              <rect x="1" y="3" width="14" height="2" />
              <rect x="2" y="5" width="2" height="2" fill="#5c3d2e" />
              <rect x="12" y="5" width="2" height="2" fill="#5c3d2e" />
              <rect x="4" y="6" width="2" height="2" fill="#5c3d2e" />
              <rect x="10" y="6" width="2" height="2" fill="#5c3d2e" />
              <rect x="6" y="7" width="2" height="2" fill="#5c3d2e" />
              <rect x="8" y="7" width="2" height="2" fill="#5c3d2e" />
              {/* Heart seal on envelope */}
              <rect x="6" y="10" width="2" height="1" fill="#ff8fa3" />
              <rect x="8" y="10" width="2" height="1" fill="#ff8fa3" />
              <rect x="5" y="11" width="6" height="1" fill="#ff8fa3" />
              <rect x="6" y="12" width="4" height="1" fill="#ff8fa3" />
              <rect x="7" y="13" width="2" height="1" fill="#ff8fa3" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
