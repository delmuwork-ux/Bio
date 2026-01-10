"use client"

import Image from "next/image"
import { motion, useAnimationControls } from "framer-motion"
import { useState, useEffect } from "react"
import { PROFILE, PROFILE_STATS, ANIMATION_CONFIG } from "@/lib/constants"
import { getAssetPath } from "@/lib/utils"

export function ProfileCard() {
  const nameControls = useAnimationControls()
  const statsControls = useAnimationControls()
  const [showStats, setShowStats] = useState(false)
  const [nameVisible, setNameVisible] = useState(false)

  useEffect(() => {
    const startAnimation = async () => {
      await nameControls.start({ clipPath: "inset(0 0 0 0)" })
      
      for (let i = 0; i < 3; i++) {
        await nameControls.start({ opacity: 0.3 }, { duration: 0.1 })
        await nameControls.start({ opacity: 1 }, { duration: 0.1 })
      }
      
      setNameVisible(true)
      setShowStats(true)
      
      await statsControls.start({ x: "0%" })
      await new Promise(r => setTimeout(r, 200))
      await statsControls.start({ x: "100%" })
    }

    const handler = () => startAnimation()
    window.addEventListener("startNameAnimation", handler)
    return () => window.removeEventListener("startNameAnimation", handler)
  }, [nameControls, statsControls])

  return (
    <div className="relative p-8 card">
      <div className="flex flex-col items-center">
        <div className="relative mb-6">
          <div className="w-24 h-24 overflow-hidden border-2 border-white/20">
            <Image
              src={getAssetPath(PROFILE.avatar)}
              alt="Avatar"
              fill
              className="object-cover"
            />
          </div>
          <div className="absolute bottom-1 right-1 w-3 h-3 bg-white border-2 border-[#111]" />
        </div>

        <div className="relative h-8 flex items-center justify-center overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={nameControls}
            transition={ANIMATION_CONFIG.sweep}
          />
          <motion.h1
            className="text-xl font-medium tracking-tight relative z-10 px-3 py-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: nameVisible ? 1 : 0, color: nameVisible ? "#000" : "#fff" }}
            transition={{ duration: 0.2 }}
          >
            {PROFILE.name}
          </motion.h1>
        </div>

        <p className="text-sm text-white/40 font-mono mt-1">{PROFILE.username}</p>

        <p className="text-center text-white/60 mt-4 text-sm leading-relaxed max-w-[280px]">
          {PROFILE.bio}
        </p>

        <div className="flex gap-8 mt-6 pt-6 border-t border-white/10 w-full justify-center">
          {PROFILE_STATS.map((stat, i) => (
            <div key={stat.label} className="text-center relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-white z-10 pointer-events-none"
                initial={{ x: "-100%" }}
                animate={statsControls}
                transition={{ ...ANIMATION_CONFIG.sweep, delay: i * 0.08 }}
              />
              <motion.p
                className="text-lg font-medium text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: showStats ? 1 : 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                {stat.value}
              </motion.p>
              <motion.p
                className="text-[11px] text-white/40 uppercase tracking-wider"
                initial={{ opacity: 0 }}
                animate={{ opacity: showStats ? 1 : 0 }}
                transition={{ duration: 0.3, delay: 0.05 + i * 0.08 }}
              >
                {stat.label}
              </motion.p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
