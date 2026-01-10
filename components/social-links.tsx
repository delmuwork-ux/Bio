"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Twitter, Instagram, Youtube, ArrowUpRight, type LucideIcon } from "lucide-react"
import { SOCIAL_LINKS, ANIMATION_CONFIG } from "@/lib/constants"
import type { SocialLink } from "@/lib/types"

const ICONS: Record<SocialLink["platform"], LucideIcon> = {
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  github: Twitter,
  discord: Twitter,
}

const sweepVariants = {
  hidden: { clipPath: "inset(0 100% 0 0)" },
  visible: { clipPath: "inset(0 0 0 0)" },
  exit: { clipPath: "inset(0 0 0 100%)" },
}

export function SocialLinks() {
  const [hovered, setHovered] = useState<number | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const start = () => setShow(true)
    window.addEventListener("startSocialAnimation", start)
    return () => window.removeEventListener("startSocialAnimation", start)
  }, [])

  return (
    <div className="relative p-6 card overflow-hidden">
      <AnimatePresence>
        {!show && (
          <motion.div
            className="absolute inset-0 bg-white z-30 pointer-events-none"
            variants={sweepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={ANIMATION_CONFIG.sweep}
          />
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {SOCIAL_LINKS.map((link, i) => {
          const Icon = ICONS[link.platform]
          const active = hovered === i

          return (
            <motion.a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: show ? 1 : 0, y: show ? 0 : 10 }}
              transition={{ ...ANIMATION_CONFIG.fade, delay: i * 0.05 }}
            >
              <motion.div
                className="absolute inset-0 z-0 pointer-events-none"
                animate={{
                  backgroundColor: active ? "rgba(255,255,255,1)" : "rgba(255,255,255,0)",
                  scale: active ? 1 : 0.98,
                }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              />

              <motion.div
                className="absolute inset-0 z-0 pointer-events-none border"
                animate={{
                  borderColor: active ? "rgba(255,255,255,.3)" : "rgba(255,255,255,.06)",
                  boxShadow: active 
                    ? "0 8px 32px rgba(255,255,255,.15), inset 0 1px 0 rgba(255,255,255,.1)" 
                    : "none",
                }}
                transition={{ duration: 0.25 }}
              />

              <div className="flex items-center gap-4 p-4 relative z-10">
                <motion.div
                  className="w-10 h-10 flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                  animate={{
                    backgroundColor: active ? "#000" : "rgba(255,255,255,.05)",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                    animate={{ opacity: active ? 0 : 0.5 }}
                  />
                  <motion.div
                    animate={{ 
                      scale: active ? 1.1 : 1,
                      rotate: active ? -5 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Icon
                      className="w-4 h-4 relative z-10"
                      style={{ color: active ? "white" : "rgba(255,255,255,.7)" }}
                    />
                  </motion.div>
                </motion.div>

                <div className="flex-1 min-w-0">
                  <motion.span
                    className="text-sm block font-medium tracking-wide"
                    animate={{ 
                      color: active ? "#000" : "rgba(255,255,255,.85)",
                      x: active ? 4 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {link.name}
                  </motion.span>
                  <motion.span
                    className="text-xs block mt-0.5"
                    animate={{ 
                      color: active ? "rgba(0,0,0,.5)" : "rgba(255,255,255,.4)",
                      x: active ? 4 : 0,
                    }}
                    transition={{ duration: 0.2, delay: 0.02 }}
                  >
                    {link.username}
                  </motion.span>
                </div>

                <motion.div
                  className="relative"
                  animate={{
                    color: active ? "#000" : "rgba(255,255,255,.25)",
                    x: active ? 4 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    animate={{
                      rotate: active ? 45 : 0,
                      scale: active ? 1.2 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <ArrowUpRight className="w-5 h-5" />
                  </motion.div>
                </motion.div>
              </div>
            </motion.a>
          )
        })}
      </div>
    </div>
  )
}
