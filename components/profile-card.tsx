"use client"

import Image from "next/image"
import { motion, useAnimationControls } from "framer-motion"
import { useState, useEffect } from "react"
import { PROFILE, PROFILE_STATS, ANIMATION_CONFIG } from "@/lib/constants"
import { getAssetPath } from "@/lib/utils"

export function ProfileCard() {
  const nameControls = useAnimationControls()
  const statsControls = useAnimationControls()
  const bioControls = useAnimationControls()
  const avatarControls = useAnimationControls()
  const [showStats, setShowStats] = useState(false)
  const [showBio, setShowBio] = useState(false)
  const [nameVisible, setNameVisible] = useState(false)

  useEffect(() => {
    const startAnimation = async () => {
      // avatar top-down sweep
      await avatarControls.start({ y: "0%", transition: { duration: (ANIMATION_CONFIG.sweep.duration || 0.5) / 2, ease: ANIMATION_CONFIG.sweep.ease } })
      await new Promise(r => setTimeout(r, 120))
      await avatarControls.start({ y: "100%", transition: { duration: (ANIMATION_CONFIG.sweep.duration || 0.5) / 2, ease: ANIMATION_CONFIG.sweep.ease } })

      await nameControls.start({ clipPath: "inset(0 0 0 0)" })
      
      for (let i = 0; i < 3; i++) {
        await nameControls.start({ opacity: 0.3 }, { duration: 0.1 })
        await nameControls.start({ opacity: 1 }, { duration: 0.1 })
      }
      
      setNameVisible(true)
      // small pause so the name's blink finishes visually before the bio sweep
      await new Promise(r => setTimeout(r, 350))

      // BIO sweep: reveal overlay, wait, then show bio text, then finish sweep
      await bioControls.start({ x: "0%" })
      await new Promise(r => setTimeout(r, 120))
      setShowBio(true)
      await new Promise(r => setTimeout(r, 200))
      await bioControls.start({ x: "100%" })

      // start the stats sweep after bio completes
      await statsControls.start({ x: "0%" })
      await new Promise(r => setTimeout(r, 120))
      setShowStats(true)

      // keep the sweep visible for a longer moment while text fades in
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
          <div className="w-24 h-24 overflow-hidden border-2 border-white/20 relative" style={{ borderRadius: "inherit" }}>
            <motion.div
              className="absolute inset-0 bg-white z-10 pointer-events-none"
              initial={{ y: "-100%" }}
              animate={avatarControls}
              transition={{ duration: (ANIMATION_CONFIG.sweep.duration || 0.5) / 2, ease: ANIMATION_CONFIG.sweep.ease }}
              style={{ borderRadius: "inherit" }}
            />
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

        <div className="relative mt-4 overflow-hidden" style={{ borderRadius: "inherit" }}>
          <motion.div
            className="absolute inset-0 bg-white z-10 pointer-events-none"
            initial={{ x: "-100%" }}
            animate={bioControls}
            transition={{ ...ANIMATION_CONFIG.sweep, duration: 0.45 }}
            style={{ borderRadius: "inherit" }}
          />
          <motion.p
            className="text-center text-white/60 text-sm leading-relaxed max-w-[280px] mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: showBio ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.12 }}
          >
            {PROFILE.bio}
          </motion.p>
        </div>

        <div className="flex gap-8 mt-6 pt-6 border-t border-white/10 w-full justify-center">
          {PROFILE_STATS.map((stat, i) => (
            <div key={stat.label} className="text-center relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-white z-10 pointer-events-none"
                initial={{ x: "-100%" }}
                animate={statsControls}
                transition={{ ...ANIMATION_CONFIG.sweep, delay: i * 0.04, duration: 0.45 }}
              />
              <motion.p
                className="text-lg font-medium text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: showStats ? 1 : 0 }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
              >
                {stat.value}
              </motion.p>
              <motion.p
                className="text-[11px] text-white/40 uppercase tracking-wider"
                initial={{ opacity: 0 }}
                animate={{ opacity: showStats ? 1 : 0 }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.15 }}
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
