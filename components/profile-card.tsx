"use client"

import Image from "next/image"
import { useState, useEffect } from "react"

interface ProfileCardProps {
  onNameAnimationStart?: () => void
}

export function ProfileCard({ onNameAnimationStart }: ProfileCardProps) {
  const [nameBgPhase, setNameBgPhase] = useState<"hidden" | "sweep" | "blink" | "done">("hidden")
  const [nameVisible, setNameVisible] = useState(false)
  const [blinkCount, setBlinkCount] = useState(0)
  const [statsPhase, setStatsPhase] = useState<"hidden" | "sweepIn" | "sweepOut" | "done">("hidden")
  const [introPhase, setIntroPhase] = useState<'hidden' | 'sweep' | 'done'>('hidden');

  useEffect(() => {
    setIntroPhase('sweep');
    const timer = setTimeout(() => {
      setIntroPhase('done');
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleStartNameAnimation = () => {
      setNameBgPhase("sweep")
    }

    window.addEventListener("startNameAnimation", handleStartNameAnimation)
    return () => window.removeEventListener("startNameAnimation", handleStartNameAnimation)
  }, [])

  useEffect(() => {
    if (nameBgPhase === "sweep") {
      const blinkTimer = setTimeout(() => {
        setNameBgPhase("blink")
      }, 600)
      return () => clearTimeout(blinkTimer)
    }
  }, [nameBgPhase])

  useEffect(() => {
    if (nameBgPhase === "blink") {
      if (blinkCount < 6) {
        const timer = setTimeout(() => {
          setBlinkCount((prev) => prev + 1)
        }, 80)
        return () => clearTimeout(timer)
      } else {
        setNameVisible(true)
        setNameBgPhase("done")
        // Start stats animation after name is done
        setTimeout(() => setStatsPhase("sweepIn"), 300)
      }
    }
  }, [nameBgPhase, blinkCount])

  useEffect(() => {
    if (statsPhase === "sweepIn") {
      const timer = setTimeout(() => setStatsPhase("sweepOut"), 400)
      return () => clearTimeout(timer)
    }
    if (statsPhase === "sweepOut") {
      const timer = setTimeout(() => setStatsPhase("done"), 400)
      return () => clearTimeout(timer)
    }
  }, [statsPhase])

  return (
    <div className="relative p-8 card">
      {/* Avatar */}
      <div className="flex flex-col items-center">
        <div className="relative mb-6">
           <div className="w-24 h-24 overflow-hidden border-2 border-white/20">
             <Image src="/Bio/avatar/avatar.png" alt="Avatar" fill className="object-cover" />
           </div>
          <div className="absolute bottom-1 right-1 w-3 h-3 bg-white border-2 border-[#111]" />
        </div>

        <div className="relative h-8 flex items-center justify-center overflow-hidden">
          {/* Background trắng sweep từ trái qua phải */}
          <div
            className="absolute inset-0 bg-white"
            style={{
              clipPath: nameBgPhase === "hidden" ? "inset(0 100% 0 0)" : "inset(0 0 0 0)",
              opacity: nameBgPhase === "blink" ? (blinkCount % 2 === 0 ? 1 : 0.2) : nameBgPhase === "hidden" ? 0 : 1,
              transition: nameBgPhase === "sweep" ? "clip-path 0.5s cubic-bezier(0.32, 0.72, 0, 1)" : "opacity 0.06s",
            }}
          />

          {/* Text */}
          <h1
            className="text-xl font-medium tracking-tight relative z-10 px-3 py-1"
            style={{
              color: nameVisible ? "#000" : "transparent",
              opacity: nameBgPhase === "blink" ? (blinkCount % 2 === 0 ? 0 : 1) : nameVisible ? 1 : 0,
              transition: "opacity 0.06s",
            }}
          >
            - やめとけ -
          </h1>
        </div>

        {/* Username */}
        <p className="text-sm text-white/40 font-mono mt-1">@_Delmu</p>

         {/* Bio */}
         <p className="text-center text-white/60 mt-4 text-sm leading-relaxed max-w-[280px]">
           配慮無し。フォローお勧めしないよ‼️🥩GORE・NSFW🔞下ネタ😃.
         </p>

        {/* Stats */}
        <div className="flex gap-8 mt-6 pt-6 border-t border-white/10 w-full justify-center">
          {[
            { value: "21.1K+", label: "Followers" },
            { value: "95", label: "Following" },
            { value: "idk ¯\_(ツ)_/¯", label: "Post" },
          ].map((stat, index) => (
            <div key={stat.label} className="text-center relative overflow-hidden">
              <div
                className="absolute inset-0 bg-white z-10 pointer-events-none"
                style={{
                  transform:
                    statsPhase === "hidden"
                      ? "translateX(-100%)"
                      : statsPhase === "sweepIn"
                        ? "translateX(0%)"
                        : "translateX(100%)",
                  transition: "transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
                  transitionDelay: `${index * 0.08}s`,
                }}
              />
              <p
                className="text-lg font-medium text-white relative z-0"
                style={{
                  opacity: statsPhase === "done" ? 1 : 0,
                  transition: "opacity 0.3s ease",
                  transitionDelay: `${index * 0.08 + 0.2}s`,
                }}
              >
                {stat.value}
              </p>
              <p
                className="text-[11px] text-white/40 uppercase tracking-wider relative z-0"
                style={{
                  opacity: statsPhase === "done" ? 1 : 0,
                  transition: "opacity 0.3s ease",
                  transitionDelay: `${index * 0.08 + 0.25}s`,
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
