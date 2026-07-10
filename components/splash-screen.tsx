"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface SplashScreenProps {
  onEnter: () => void
  show: boolean
}

// Pixel art loading spinner — rotating pixel square
const PixelSpinner = () => (
  <motion.svg
    viewBox="0 0 9 9"
    shapeRendering="crispEdges"
    className="w-8 h-8"
    animate={{ rotate: 360 }}
    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
  >
    <rect x="3" y="0" width="3" height="1" fill="#ffd27d"/>
    <rect x="6" y="1" width="1" height="1" fill="#ffd27d"/>
    <rect x="7" y="2" width="1" height="1" fill="#d4af37"/>
    <rect x="8" y="3" width="1" height="3" fill="#d4af37"/>
    <rect x="7" y="6" width="1" height="1" fill="#b8942e"/>
    <rect x="6" y="7" width="1" height="1" fill="#b8942e"/>
    <rect x="3" y="8" width="3" height="1" fill="#8b6b4a"/>
    <rect x="2" y="7" width="1" height="1" fill="#8b6b4a"/>
    <rect x="1" y="6" width="1" height="1" fill="#d4af37"/>
    <rect x="0" y="3" width="1" height="3" fill="#d4af37"/>
    <rect x="1" y="2" width="1" height="1" fill="#ffd27d"/>
    <rect x="2" y="1" width="1" height="1" fill="#ffd27d"/>
  </motion.svg>
)

// Pixel art decorative flower (same as frame flowers)
const PixelFlower = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg
    className={`pointer-events-none ${className}`}
    style={{ width: size, height: size }}
    viewBox="0 0 9 9"
    shapeRendering="crispEdges"
  >
    <rect x="4" y="0" width="1" height="1" fill="#ffd27d"/>
    <rect x="3" y="1" width="1" height="1" fill="#ffd27d"/>
    <rect x="5" y="1" width="1" height="1" fill="#ffd27d"/>
    <rect x="0" y="4" width="1" height="1" fill="#ffd27d"/>
    <rect x="1" y="3" width="1" height="1" fill="#ffd27d"/>
    <rect x="1" y="5" width="1" height="1" fill="#ffd27d"/>
    <rect x="8" y="4" width="1" height="1" fill="#ffd27d"/>
    <rect x="7" y="3" width="1" height="1" fill="#ffd27d"/>
    <rect x="7" y="5" width="1" height="1" fill="#ffd27d"/>
    <rect x="4" y="8" width="1" height="1" fill="#ffd27d"/>
    <rect x="3" y="7" width="1" height="1" fill="#ffd27d"/>
    <rect x="5" y="7" width="1" height="1" fill="#ffd27d"/>
    <rect x="4" y="1" width="1" height="1" fill="#ffe8b0"/>
    <rect x="1" y="4" width="1" height="1" fill="#ffe8b0"/>
    <rect x="7" y="4" width="1" height="1" fill="#ffe8b0"/>
    <rect x="4" y="7" width="1" height="1" fill="#ffe8b0"/>
    <rect x="3" y="2" width="3" height="1" fill="#d4af37"/>
    <rect x="2" y="3" width="1" height="3" fill="#d4af37"/>
    <rect x="6" y="3" width="1" height="3" fill="#d4af37"/>
    <rect x="3" y="6" width="3" height="1" fill="#d4af37"/>
    <rect x="3" y="3" width="3" height="3" fill="#ffd27d"/>
    <rect x="4" y="3" width="1" height="1" fill="#ffe8b0"/>
    <rect x="3" y="4" width="1" height="1" fill="#ffe8b0"/>
    <rect x="4" y="4" width="1" height="1" fill="#b8942e"/>
    <rect x="5" y="4" width="1" height="1" fill="#d4af37"/>
    <rect x="4" y="5" width="1" height="1" fill="#d4af37"/>
  </svg>
)

// Pixel art progress bar
const PixelProgressBar = ({ progress }: { progress: number }) => {
  const totalBlocks = 16
  const filledBlocks = Math.floor((progress / 100) * totalBlocks)

  return (
    <svg
      viewBox={`0 0 ${totalBlocks + 2} 3`}
      shapeRendering="crispEdges"
      className="w-52 h-4"
    >
      {/* Border */}
      <rect x="0" y="0" width={totalBlocks + 2} height="1" fill="#5c3d2e"/>
      <rect x="0" y="2" width={totalBlocks + 2} height="1" fill="#5c3d2e"/>
      <rect x="0" y="1" width="1" height="1" fill="#5c3d2e"/>
      <rect x={totalBlocks + 1} y="1" width="1" height="1" fill="#5c3d2e"/>
      {/* Background */}
      <rect x="1" y="1" width={totalBlocks} height="1" fill="#3a2518"/>
      {/* Filled blocks */}
      {Array.from({ length: filledBlocks }, (_, i) => (
        <rect key={i} x={i + 1} y="1" width="1" height="1" fill={i < filledBlocks * 0.6 ? "#d4af37" : "#ffd27d"}/>
      ))}
    </svg>
  )
}

export function SplashScreen({ onEnter, show }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const imagesToPreload = [
      "/img website/obj 1.png",
      "/img website/obj 2.png",
      "/img website/obj 3.png",
      "/img website/obj 4.png",
      "/img website/@_Delmu.png",
      "/img website/WaveBox @_Delmu.png",
      "/img website/Wavebox.png",
      "/img website/x.png",
      "/avatar/avatar.png",
      "/img website/background.jpg",
    ]

    let loadedCount = 0
    let isMounted = true

    if (imagesToPreload.length === 0) {
      setIsLoaded(true)
      setLoadingProgress(100)
      return
    }

    const preloadAndDecode = async () => {
      const promises = imagesToPreload.map(async (url) => {
        try {
          const img = new window.Image()
          img.src = url
          // Wait for the image to download AND decode into GPU memory
          await img.decode()
        } catch (e) {
          console.warn("Failed to preload/decode asset:", url, e)
        }
        if (isMounted) {
          loadedCount++
          const progress = Math.floor((loadedCount / imagesToPreload.length) * 100)
          setLoadingProgress(progress)
        }
      })

      await Promise.all(promises)
      
      if (isMounted) {
        setIsLoaded(true)
      }
    }

    preloadAndDecode()

    return () => {
      isMounted = false
    }
  }, [])

  const handleClick = () => {
    if (!isLoaded || isExiting) return
    setIsExiting(true)
    setTimeout(onEnter, 300)
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden cursor-pointer select-none"
      style={{ 
        backgroundColor: "#2a1a0e",
        pointerEvents: show && !isExiting ? "auto" : "none"
      }}
      onClick={handleClick}
      initial={{ opacity: 1 }}
      animate={{ opacity: show && !isExiting ? 1 : 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {/* Pixel pattern background overlay */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg, transparent, transparent 3px, #ffd27d 3px, #ffd27d 4px
          ), repeating-linear-gradient(
            90deg, transparent, transparent 3px, #ffd27d 3px, #ffd27d 4px
          )`,
        }}
      />

      {/* Corner flower decorations */}
      <motion.div
        className="absolute top-6 left-6"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <PixelFlower size={28} />
      </motion.div>
      <motion.div
        className="absolute top-6 right-6"
        animate={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <PixelFlower size={28} />
      </motion.div>
      <motion.div
        className="absolute bottom-6 left-6"
        animate={{ rotate: [0, -8, 8, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <PixelFlower size={28} />
      </motion.div>
      <motion.div
        className="absolute bottom-6 right-6"
        animate={{ rotate: [0, 8, -8, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <PixelFlower size={28} />
      </motion.div>

      {/* Main content */}
      <motion.div
        className="text-center relative z-10 flex flex-col items-center gap-6"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Pixel art title — matching profile card style */}
        <motion.div
          className="flex items-center gap-3 mb-2"
          animate={
            isExiting
              ? { scale: [1, 1.1, 0], opacity: [1, 0.5, 0], y: -40 }
              : {}
          }
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {["月", "白", "あ", "く", "む"].map((char, i) => (
            <motion.span
              key={i}
              className="text-5xl md:text-7xl font-bold"
              style={{
                color: i < 2 ? "#ffffff" : "#ffd27d",
                textShadow: "-3px -3px 0 #5c3d2e, 3px -3px 0 #5c3d2e, -3px 3px 0 #5c3d2e, 3px 3px 0 #5c3d2e, 0px 5px 0px rgba(92, 61, 46, 0.45)",
                fontFamily: "'DotGothic16', 'Press Start 2P', monospace",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                rotate: [0, i % 2 === 0 ? -3 : 3, 0],
              }}
              transition={{
                opacity: { delay: i * 0.1, duration: 0.4 },
                y: { delay: i * 0.1, duration: 0.4 },
                rotate: { delay: i * 0.1 + 0.5, duration: 3, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              {char}
            </motion.span>
          ))}
        </motion.div>

        {/* Separator line — pixel style */}
        <svg viewBox="0 0 40 3" shapeRendering="crispEdges" className="w-48 h-2">
          <rect x="0" y="1" width="15" height="1" fill="#5c3d2e"/>
          <rect x="16" y="0" width="1" height="1" fill="#d4af37"/>
          <rect x="17" y="1" width="1" height="1" fill="#ffd27d"/>
          <rect x="18" y="0" width="4" height="3" fill="#d4af37"/>
          <rect x="19" y="1" width="2" height="1" fill="#ffd27d"/>
          <rect x="22" y="1" width="1" height="1" fill="#ffd27d"/>
          <rect x="23" y="0" width="1" height="1" fill="#d4af37"/>
          <rect x="25" y="1" width="15" height="1" fill="#5c3d2e"/>
        </svg>

        {/* Loading / Click to continue */}
        <div className="h-20 flex flex-col items-center justify-center gap-3">
          <AnimatePresence mode="wait">
            {!isLoaded ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="flex items-center gap-3">
                  <PixelSpinner />
                  <p
                    className="text-sm tracking-[0.2em] uppercase"
                    style={{
                      color: "#d4af37",
                      fontFamily: "'DotGothic16', 'Press Start 2P', monospace",
                      textShadow: "0 2px 0 rgba(92, 61, 46, 0.5)",
                    }}
                  >
                    Loading... {loadingProgress}%
                  </p>
                </div>
                <PixelProgressBar progress={loadingProgress} />
              </motion.div>
            ) : (
              <motion.div
                key="enter"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="flex flex-col items-center gap-2 cursor-pointer"
              >
                {/* Pixel hand cursor icon */}
                <svg viewBox="0 0 7 7" shapeRendering="crispEdges" className="w-6 h-6">
                  <rect x="2" y="0" width="1" height="1" fill="#ffd27d"/>
                  <rect x="2" y="1" width="1" height="3" fill="#fffcf7"/>
                  <rect x="0" y="3" width="1" height="1" fill="#ffd27d"/>
                  <rect x="1" y="3" width="1" height="1" fill="#fffcf7"/>
                  <rect x="3" y="2" width="1" height="1" fill="#ffd27d"/>
                  <rect x="3" y="3" width="1" height="2" fill="#fffcf7"/>
                  <rect x="4" y="3" width="1" height="1" fill="#ffd27d"/>
                  <rect x="4" y="4" width="1" height="1" fill="#fffcf7"/>
                  <rect x="5" y="4" width="1" height="1" fill="#ffd27d"/>
                  <rect x="0" y="4" width="5" height="1" fill="#fffcf7"/>
                  <rect x="0" y="5" width="5" height="1" fill="#fffcf7"/>
                  <rect x="1" y="6" width="4" height="1" fill="#fffcf7"/>
                </svg>

                <motion.p
                  className="text-base tracking-[0.15em] uppercase"
                  style={{
                    color: "#ffd27d",
                    fontFamily: "'DotGothic16', 'Press Start 2P', monospace",
                    textShadow: "-2px -2px 0 #5c3d2e, 2px -2px 0 #5c3d2e, -2px 2px 0 #5c3d2e, 2px 2px 0 #5c3d2e, 0px 3px 0px rgba(92, 61, 46, 0.45)",
                  }}
                  animate={{
                    opacity: [0.4, 1, 0.4],
                    y: [0, -2, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  Click to continue
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Pixel particle effects on exit */}
      {isExiting && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          {Array.from({ length: 24 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                width: 4 + Math.random() * 4,
                height: 4 + Math.random() * 4,
                backgroundColor: ["#ffd27d", "#d4af37", "#fffcf7", "#b8942e"][i % 4],
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: (Math.random() - 0.5) * 500,
                y: (Math.random() - 0.5) * 500,
                opacity: 0,
                scale: 0,
              }}
              transition={{
                duration: 0.7,
                delay: i * 0.02,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
