"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface SplashScreenProps {
  onEnter: () => void
}

const Particle = ({ delay }: { delay: number }) => (
  <motion.div
    className="absolute w-1 h-1 bg-white rounded-full"
    initial={{
      x: 0,
      y: 0,
      opacity: 1,
      scale: 1,
    }}
    animate={{
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 400,
      opacity: 0,
      scale: 0,
    }}
    transition={{
      duration: 0.8,
      delay,
      ease: "easeOut",
    }}
  />
)

export function SplashScreen({ onEnter }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false)

  const handleClick = () => {
    setIsExiting(true)
    setTimeout(onEnter, 800)
  }

  // Generate particles
  const particles = Array.from({ length: 20 }, (_, i) => i)

  return (
    <motion.div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center cursor-pointer overflow-hidden"
      onClick={handleClick}
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      pointerEvents={isExiting ? "none" : "auto"}
    >
      {/* Background layers that split apart */}
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ y: 0 }}
        animate={isExiting ? { y: -window.innerHeight } : { y: 0 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ y: 0 }}
        animate={isExiting ? { y: window.innerHeight } : { y: 0 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      />

      {/* Main content container */}
      <motion.div
        className="text-center relative z-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Japanese text - splits with blur */}
        <motion.h1
          className="text-6xl md:text-8xl font-bold text-white mb-8 relative"
          animate={
            isExiting
              ? {
                  scale: [1, 1.2, 0.8],
                  opacity: [1, 0.5, 0],
                  rotateY: 90,
                  filter: [
                    "blur(0px) brightness(1)",
                    "blur(8px) brightness(1.5)",
                    "blur(20px) brightness(0.5)",
                  ],
                }
              : {
                  opacity: [0.6, 1, 0.6],
                }
          }
          transition={
            isExiting
              ? {
                  duration: 0.8,
                  ease: "easeInOut",
                }
              : {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        >
          こんにちは
        </motion.h1>

        {/* Subtitle - fade with upward motion */}
        <motion.p
          className="text-white text-lg opacity-60"
          initial={{ opacity: 0 }}
          animate={
            isExiting
              ? { opacity: 0, y: -50 }
              : { opacity: 0.6, y: 0 }
          }
          transition={
            isExiting
              ? { duration: 0.5, ease: "easeInOut" }
              : { delay: 0.5, duration: 0.8 }
          }
        >
          Click anywhere to enter
        </motion.p>
      </motion.div>

      {/* Particle effects on exit */}
      {isExiting && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          {particles.map((i) => (
            <Particle key={i} delay={i * 0.02} />
          ))}
        </div>
      )}
    </motion.div>
  )
}

