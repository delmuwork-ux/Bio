"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, SkipBack, SkipForward } from "lucide-react"
import { useAudioPlayer } from "@/hooks/use-audio-player"
import { TRACKS, ANIMATION_CONFIG } from "@/lib/constants"
import { getAssetPath } from "@/lib/utils"

interface MusicPlayerProps {
  isVisible?: boolean
}

export function MusicPlayer({ isVisible = false }: MusicPlayerProps) {
  const [hovered, setHovered] = useState(false)
  const player = useAudioPlayer({
    tracks: TRACKS.map(t => ({ ...t, src: getAssetPath(t.src) })),
    autoPlay: true,
  })

  const expanded = hovered && isVisible

  return (
    <motion.div
      className="fixed bottom-8 left-1/2 z-50"
      initial={{ opacity: 0, scale: 0.5, x: "-50%" }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.5,
        x: "-50%",
      }}
      transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      style={{ pointerEvents: isVisible ? "auto" : "none" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className="bg-[#0a0a0a] border border-white/10 overflow-hidden backdrop-blur-xl relative"
        animate={{
          width: expanded ? 340 : 200,
          height: expanded ? 80 + 32 + TRACKS.length * 52 : 56,
        }}
        transition={ANIMATION_CONFIG.sweep}
        style={{
          boxShadow: expanded
            ? "0 0 0 1px rgba(255,255,255,.1), 0 20px 50px -10px rgba(0,0,0,.8)"
            : "0 0 0 1px rgba(255,255,255,.05), 0 4px 20px -5px rgba(0,0,0,.5)",
        }}
      >
        <AnimatePresence>
          {isVisible && (
            <motion.div
              className="absolute inset-0 bg-white z-30 pointer-events-none"
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              animate={{ clipPath: "inset(0 0 0 100%)" }}
              transition={{ duration: 1, ease: ANIMATION_CONFIG.sweep.ease }}
            />
          )}
        </AnimatePresence>

        <div className="h-[2px] bg-white/5 relative overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-white"
            animate={{ width: `${player.progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        <motion.div
          animate={{ padding: expanded ? 16 : 12 }}
          transition={ANIMATION_CONFIG.sweep}
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1 relative overflow-hidden">
              <motion.p
                className="font-medium text-white truncate leading-tight"
                animate={{ fontSize: expanded ? 15 : 13 }}
              >
                {player.currentTrack.title}
              </motion.p>
              <motion.p
                className="text-white/50 truncate"
                animate={{ fontSize: expanded ? 12 : 11, marginTop: expanded ? 2 : 0 }}
              >
                {player.currentTrack.artist}
              </motion.p>
            </div>

            <div className="flex items-center">
              <motion.button
                onClick={player.prev}
                className="text-white/50 hover:text-white transition-colors flex items-center justify-center"
                animate={{ width: expanded ? 36 : 0, opacity: expanded ? 1 : 0 }}
                style={{ height: 36, overflow: "hidden" }}
              >
                <SkipBack className="w-4 h-4" fill="currentColor" />
              </motion.button>

              <motion.button
                onClick={player.toggle}
                className="bg-white flex items-center justify-center hover:bg-white/90"
                animate={{ width: expanded ? 44 : 32, height: expanded ? 44 : 32 }}
              >
                {player.playing ? (
                  <Pause className="text-black w-4 h-4" fill="currentColor" />
                ) : (
                  <Play className="text-black w-4 h-4 ml-0.5" fill="currentColor" />
                )}
              </motion.button>

              <motion.button
                onClick={player.next}
                className="text-white/50 hover:text-white transition-colors flex items-center justify-center"
                animate={{ width: expanded ? 36 : 0, opacity: expanded ? 1 : 0 }}
                style={{ height: 36, overflow: "hidden" }}
              >
                <SkipForward className="w-4 h-4" fill="currentColor" />
              </motion.button>
            </div>
          </div>

          <motion.div
            animate={{ height: expanded ? "auto" : 0, marginTop: expanded ? 16 : 0, opacity: expanded ? 1 : 0 }}
            transition={ANIMATION_CONFIG.sweep}
            style={{ overflow: "hidden" }}
          >
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] text-white/40 uppercase tracking-[.15em] font-medium">Queue</p>
                <p className="text-[10px] text-white/30 font-mono">
                  {player.trackIndex + 1}/{TRACKS.length}
                </p>
              </div>

              <div className="relative" style={{ height: TRACKS.length * 48 }}>
                <motion.div
                  className="absolute left-0 right-0 flex items-center justify-between pointer-events-none z-10 px-2"
                  animate={{ top: player.trackIndex * 48 }}
                  transition={ANIMATION_CONFIG.sweep}
                  style={{ height: 48 }}
                >
                  <span className="text-white text-sm font-mono animate-pulse">&gt;</span>
                  <span className="text-white text-sm font-mono animate-pulse">&lt;</span>
                </motion.div>

                {TRACKS.map((track, i) => (
                  <button
                    key={track.title}
                    onClick={() => player.setTrack(i)}
                    className={`w-full flex items-center gap-3 px-6 text-left transition-all duration-300 ${
                      player.trackIndex === i ? "bg-white/5" : "hover:bg-white/5"
                    }`}
                    style={{ height: 48 }}
                  >
                    <span className="text-[10px] font-mono text-white/30 w-4">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`text-sm flex-1 truncate text-center transition-colors ${
                        player.trackIndex === i ? "text-white" : "text-white/50"
                      }`}
                    >
                      {track.title}
                    </span>
                    <span className="text-[10px] font-mono text-white/30">{track.duration}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
