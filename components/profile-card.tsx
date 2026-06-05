"use client"

import Image from "next/image"
import { motion, useAnimationControls } from "framer-motion"
import { useState, useEffect } from "react"
import { PROFILE, PROFILE_STATS, ANIMATION_CONFIG } from "@/lib/constants"

export function ProfileCard() {
  const nameControls = useAnimationControls()
  const usernameControls = useAnimationControls()
  const bioControls = useAnimationControls()
  const statsControls = useAnimationControls()
  const avatarControls = useAnimationControls()
  const [showStats, setShowStats] = useState(false)
  const [showBio, setShowBio] = useState(false)
  const [showAvatar, setShowAvatar] = useState(false)
  const [showUsername, setShowUsername] = useState(false)
  const [nameVisible, setNameVisible] = useState(false)

  useEffect(() => {
    const startAnimation = async () => {
      // avatar top-down sweep
      setShowAvatar(false)
      await avatarControls.start({ y: "0%", transition: { duration: (ANIMATION_CONFIG.sweep.duration || 0.5) / 2, ease: ANIMATION_CONFIG.sweep.ease } })
      await new Promise(r => setTimeout(r, 50))
      setShowAvatar(true)
      await avatarControls.start({ y: "100%", transition: { duration: (ANIMATION_CONFIG.sweep.duration || 0.5) / 2, ease: ANIMATION_CONFIG.sweep.ease } })

      await nameControls.start({ clipPath: "inset(0 0 0 0)" })
      
      setNameVisible(true)
      // wait 50ms before username sweep
      await new Promise(r => setTimeout(r, 50))

      // USERNAME sweep (left → right)
      await usernameControls.start({ x: "0%", transition: { duration: (ANIMATION_CONFIG.sweep.duration || 0.5), ease: ANIMATION_CONFIG.sweep.ease } })
      await new Promise(r => setTimeout(r, 3))
      setShowUsername(true)
      await usernameControls.start({ x: "100%", transition: { duration: (ANIMATION_CONFIG.sweep.duration || 0.5), ease: ANIMATION_CONFIG.sweep.ease } })

      // BIO sweep (starts immediately after username sweep completes)
      await bioControls.start({ x: "0%", transition: { duration: (ANIMATION_CONFIG.sweep.duration || 0.5), ease: ANIMATION_CONFIG.sweep.ease } })
      setShowBio(true)
      await bioControls.start({ x: "100%", transition: { duration: (ANIMATION_CONFIG.sweep.duration || 0.5), ease: ANIMATION_CONFIG.sweep.ease } })

      // STATS sweep (static background)
      await statsControls.start({ clipPath: "inset(0 0 0 0)", transition: { duration: (ANIMATION_CONFIG.sweep.duration || 0.5), ease: ANIMATION_CONFIG.sweep.ease } })
      setShowStats(true)
      
      // Emit event when all animations are complete
      window.dispatchEvent(new CustomEvent("profileAnimationComplete"))
    }

    const handler = () => startAnimation()
    window.addEventListener("startNameAnimation", handler)
    return () => window.removeEventListener("startNameAnimation", handler)
  }, [nameControls, usernameControls, bioControls, statsControls, avatarControls])

  return (
    <div className="relative p-8 card">
      <div className="flex flex-col items-center">
        <div className="relative mb-6">
          <div
            className="w-24 h-24 overflow-hidden border-2 border-white/20 relative"
            style={{ borderRadius: "inherit" }}
          >
            <motion.div
              className="absolute inset-0 bg-white z-10 pointer-events-none"
              initial={{ y: "-100%" }}
              animate={avatarControls}
              transition={{ duration: (ANIMATION_CONFIG.sweep.duration || 0.5) / 2, ease: ANIMATION_CONFIG.sweep.ease }}
              style={{ borderRadius: "inherit" }}
            />
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: showAvatar ? 1 : 0 }} 
              transition={{ duration: 0.08 }} 
              className="absolute inset-0"
            >
              <Image
                src={PROFILE.avatar}
                alt="Avatar"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
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

        <div className="relative mt-1 overflow-hidden">
          <motion.div
            className="absolute bg-white z-10 pointer-events-none"
            style={{ top: "-5px", bottom: "-5px", left: "-5px", right: "-5px" }}
            initial={{ x: "-100%" }}
            animate={usernameControls}
            transition={{ ...ANIMATION_CONFIG.sweep, duration: 0.45 }}
          />
          <motion.p
            className="text-sm text-white/40 font-mono relative z-0 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: showUsername ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {PROFILE.username}
          </motion.p>
        </div>

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
            transition={{ duration: 0.3 }}
          >
            {PROFILE.bio}
          </motion.p>
        </div>

        <div className="flex gap-8 mt-6 pt-6 border-t border-white/10 w-full justify-center relative">
          {PROFILE_STATS.map((stat, i) => (
            <div key={stat.label} className="text-center relative">
              <motion.div
                className="absolute inset-0 bg-white z-10 pointer-events-none"
                style={{ left: "-10px", right: "-10px" }}
                initial={{ clipPath: "inset(0 100% 0 0)" }}
                animate={statsControls}
                transition={{ ...ANIMATION_CONFIG.sweep, duration: 0.45 }}
              />
              <motion.p
                className="text-lg font-medium relative z-20"
                initial={{ opacity: 0, color: "#fff" }}
                animate={{ opacity: showStats ? 1 : 0, color: showStats ? "#000" : "#fff" }}
                transition={{ duration: 0.3 }}
              >
                {stat.value}
              </motion.p>
              <motion.p
                className="text-[11px] uppercase tracking-wider relative z-20"
                initial={{ opacity: 0, color: "rgba(255,255,255,0.4)" }}
                animate={{ opacity: showStats ? 1 : 0, color: showStats ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)" }}
                transition={{ duration: 0.3 }}
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
