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

      <div className="space-y-1">
        {SOCIAL_LINKS.map((link, i) => {
          const Icon = ICONS[link.platform]
          const active = hovered === i

          return (
            <motion.a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block overflow-hidden"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: show ? 1 : 0, y: show ? 0 : 10 }}
              transition={{ ...ANIMATION_CONFIG.fade, delay: i * 0.05 }}
            >
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex">
                <motion.div
                  className="bg-white h-full"
                  animate={{ width: active ? "50%" : "0%" }}
                  transition={ANIMATION_CONFIG.fade}
                />
                <motion.div
                  className="bg-white h-full ml-auto"
                  animate={{ width: active ? "50%" : "0%" }}
                  transition={ANIMATION_CONFIG.fade}
                />
              </div>

              <div className="flex items-center gap-4 p-3 -mx-1 relative z-10">
                <motion.div
                  className="w-10 h-10 flex items-center justify-center border flex-shrink-0"
                  animate={{
                    backgroundColor: active ? "black" : "rgba(255,255,255,.05)",
                    borderColor: active ? "black" : "rgba(255,255,255,.1)",
                  }}
                  transition={ANIMATION_CONFIG.fade}
                >
                  <Icon
                    className="w-4 h-4"
                    style={{ color: active ? "white" : "rgba(255,255,255,.7)" }}
                  />
                </motion.div>

                <div className="flex-1 min-w-0">
                  <motion.span
                    className="text-sm block font-medium"
                    animate={{ color: active ? "black" : "rgba(255,255,255,.8)" }}
                  >
                    {link.name}
                  </motion.span>
                  <motion.div
                    className="overflow-hidden"
                    animate={{ height: active ? "auto" : 0, opacity: active ? 1 : 0 }}
                    transition={ANIMATION_CONFIG.fade}
                  >
                    <span className="text-xs text-black/60 block mt-0.5">{link.username}</span>
                    <span className="text-[11px] text-black/40 block truncate">{link.bio}</span>
                  </motion.div>
                </div>

                <motion.div
                  animate={{
                    color: active ? "rgba(0,0,0,.6)" : "rgba(255,255,255,.2)",
                    x: active ? 2 : 0,
                    y: active ? -2 : 0,
                  }}
                  transition={ANIMATION_CONFIG.fade}
                >
                  <ArrowUpRight className="w-4 h-4" />
                </motion.div>
              </div>
            </motion.a>
          )
        })}
      </div>
    </div>
  )
}
