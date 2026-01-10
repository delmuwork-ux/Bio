"use client"

import Image from "next/image"
import { motion, useAnimationControls } from "framer-motion"
import { useEffect } from "react"
import { PROFILE, PROFILE_STATS, ANIMATION_CONFIG } from "@/lib/constants"
import { getAssetPath } from "@/lib/utils"

const sweepVariants = {
  hidden: { clipPath: "inset(0 100% 0 0)" },
  visible: { clipPath: "inset(0 0 0 0)" },
  exit: { clipPath: "inset(0 0 0 100%)" },
}

const statVariants = {
  hidden: { x: "-100%" },
  visible: { x: "0%" },
  exit: { x: "100%" },
}

export function ProfileCard() {
  const nameControls = useAnimationControls()
  const statsControls = useAnimationControls()

  useEffect(() => {
    const startAnimation = async () => {
      await nameControls.start("visible")
      await new Promise(r => setTimeout(r, 100))
      await nameControls.start("exit")
      statsControls.start("visible")
      await new Promise(r => setTimeout(r, 400))
      statsControls.start("exit")
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
            variants={sweepVariants}
            initial="hidden"
            animate={nameControls}
            transition={ANIMATION_CONFIG.sweep}
          />
          <motion.h1
            className="text-xl font-medium tracking-tight relative z-10 px-3 py-1 text-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.1 }}
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
                variants={statVariants}
                initial="hidden"
                animate={statsControls}
                transition={{ ...ANIMATION_CONFIG.sweep, delay: i * 0.08 }}
              />
              <motion.p
                className="text-lg font-medium text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 + i * 0.08, duration: 0.3 }}
              >
                {stat.value}
              </motion.p>
              <motion.p
                className="text-[11px] text-white/40 uppercase tracking-wider"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.85 + i * 0.08, duration: 0.3 }}
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
