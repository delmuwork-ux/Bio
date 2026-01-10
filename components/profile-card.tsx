"use client"

import Image from "next/image"
import { useState, useEffect } from "react"

const stats = [
  { value: "21.1K+", label: "Followers" },
  { value: "95", label: "Following" },
  { value: "idk ¯\\_(ツ)_/¯", label: "Post" },
]

export function ProfileCard() {
  const [phase, setPhase] = useState<"hidden" | "sweep" | "blink" | "done">("hidden")
  const [showName, setShowName] = useState(false)
  const [blinks, setBlinks] = useState(0)
  const [statsPhase, setStatsPhase] = useState<"hidden" | "in" | "out" | "done">("hidden")

  useEffect(() => {
    const start = () => setPhase("sweep")
    window.addEventListener("startNameAnimation", start)
    return () => window.removeEventListener("startNameAnimation", start)
  }, [])

  useEffect(() => {
    if (phase === "sweep") {
      const t = setTimeout(() => setPhase("blink"), 600)
      return () => clearTimeout(t)
    }
  }, [phase])

  useEffect(() => {
    if (phase !== "blink") return
    if (blinks < 6) {
      const t = setTimeout(() => setBlinks(n => n + 1), 80)
      return () => clearTimeout(t)
    }
    setShowName(true)
    setPhase("done")
    setTimeout(() => setStatsPhase("in"), 300)
  }, [phase, blinks])

  useEffect(() => {
    if (statsPhase === "in") {
      const t = setTimeout(() => setStatsPhase("out"), 400)
      return () => clearTimeout(t)
    }
    if (statsPhase === "out") {
      const t = setTimeout(() => setStatsPhase("done"), 400)
      return () => clearTimeout(t)
    }
  }, [statsPhase])

  const bgOpacity = phase === "blink" ? (blinks % 2 === 0 ? 1 : 0.2) : phase === "hidden" ? 0 : 1
  const textOpacity = phase === "blink" ? (blinks % 2 === 0 ? 0 : 1) : showName ? 1 : 0

  return (
    <div className="relative p-8 card">
      <div className="flex flex-col items-center">
        <div className="relative mb-6">
          <div className="w-24 h-24 overflow-hidden border-2 border-white/20">
            <Image src="/Bio/avatar/avatar.png" alt="Avatar" fill className="object-cover" />
          </div>
          <div className="absolute bottom-1 right-1 w-3 h-3 bg-white border-2 border-[#111]" />
        </div>

        <div className="relative h-8 flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-white"
            style={{
              clipPath: phase === "hidden" ? "inset(0 100% 0 0)" : "inset(0)",
              opacity: bgOpacity,
              transition: phase === "sweep" ? "clip-path .5s cubic-bezier(.32,.72,0,1)" : "opacity .06s",
            }}
          />
          <h1
            className="text-xl font-medium tracking-tight relative z-10 px-3 py-1"
            style={{ color: showName ? "#000" : "transparent", opacity: textOpacity, transition: "opacity .06s" }}
          >
            - やめとけ -
          </h1>
        </div>

        <p className="text-sm text-white/40 font-mono mt-1">@_Delmu</p>

        <p className="text-center text-white/60 mt-4 text-sm leading-relaxed max-w-[280px]">
          配慮無し。フォローお勧めしないよ‼️🥩GORE・NSFW🔞下ネタ😃.
        </p>

        <div className="flex gap-8 mt-6 pt-6 border-t border-white/10 w-full justify-center">
          {stats.map((s, i) => (
            <div key={s.label} className="text-center relative overflow-hidden">
              <div
                className="absolute inset-0 bg-white z-10 pointer-events-none"
                style={{
                  transform: statsPhase === "hidden" ? "translateX(-100%)" : statsPhase === "in" ? "translateX(0)" : "translateX(100%)",
                  transition: "transform .4s cubic-bezier(.32,.72,0,1)",
                  transitionDelay: `${i * 80}ms`,
                }}
              />
              <p
                className="text-lg font-medium text-white"
                style={{ opacity: statsPhase === "done" ? 1 : 0, transition: "opacity .3s", transitionDelay: `${i * 80 + 200}ms` }}
              >
                {s.value}
              </p>
              <p
                className="text-[11px] text-white/40 uppercase tracking-wider"
                style={{ opacity: statsPhase === "done" ? 1 : 0, transition: "opacity .3s", transitionDelay: `${i * 80 + 250}ms` }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
