"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, SkipBack, SkipForward, Music2 } from "lucide-react"
import { useAudioPlayer } from "@/hooks/use-audio-player"
import { TRACKS, ANIMATION_CONFIG } from "@/lib/constants"
import { getAssetPath } from "@/lib/utils"

interface MusicPlayerProps {
  isVisible?: boolean
}

function AudioBars({ playing }: { playing: boolean }) {
  return (
    <div className="flex items-end gap-[2px] h-3">
      {[0, 1, 2, 3].map(i => (
        <motion.div
          key={i}
          className="w-[3px] bg-white rounded-full origin-bottom"
          animate={playing ? {
            scaleY: [0.3, 1, 0.5, 0.8, 0.3],
          } : { scaleY: 0.3 }}
          transition={playing ? {
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          } : { duration: 0.2 }}
          style={{ height: 12 }}
        />
      ))}
    </div>
  )
}

export function MusicPlayer({ isVisible = false }: MusicPlayerProps) {
  const [hovered, setHovered] = useState(false)
  const player = useAudioPlayer({
    tracks: TRACKS.map(t => ({ ...t, src: getAssetPath(t.src) })),
    autoPlay: true,
  })

  const expanded = hovered && isVisible
  const [visibleNow, setVisibleNow] = useState(isVisible)
  const [nameSweep, setNameSweep] = useState(false)

  // trigger a short white sweep over the track title when the track changes
  useEffect(() => {
    const ms = Math.round(((ANIMATION_CONFIG.sweep.duration || 0.5)) * 1000)
    setNameSweep(true)
    const t = setTimeout(() => setNameSweep(false), ms + 120)
    return () => clearTimeout(t)
  }, [player.trackIndex])

  // listen for overlay unlock event (fires inside the user's click) and play immediately
  useEffect(() => {
    const handler = () => {
      player.play()
    }
    const started = () => setVisibleNow(true)
    window.addEventListener("unlockAudio", handler)
    window.addEventListener("musicStarted", started)

    // if the music already started (rare), show immediately
    if ((typeof window !== "undefined") && (window as any).__musicStarted) setVisibleNow(true)

    return () => {
      window.removeEventListener("unlockAudio", handler)
      window.removeEventListener("musicStarted", started)
    }
  }, [player])

  useEffect(() => {
    if (!isVisible) setVisibleNow(false)
  }, [isVisible])

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
        className="bg-[#0a0a0a]/95 border border-white/10 overflow-hidden backdrop-blur-xl relative"
        animate={{
          width: expanded ? 340 : 180,
          height: expanded ? 80 + 32 + TRACKS.length * 52 : 48,
        }}
        transition={ANIMATION_CONFIG.sweep}
        style={{
          boxShadow: expanded
            ? "0 0 0 1px rgba(255,255,255,.1), 0 20px 50px -10px rgba(0,0,0,.8)"
            : "0 0 40px rgba(255,255,255,.05), 0 4px 20px -5px rgba(0,0,0,.5)",
        }}
      >
        <AnimatePresence>
          {isVisible && (
            <motion.div
              className="absolute inset-0 bg-white z-30 pointer-events-none"
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              animate={{ clipPath: "inset(0 0 0 100%)" }}
              transition={{ duration: (ANIMATION_CONFIG.sweep.duration || 0.5) * 1.8, ease: ANIMATION_CONFIG.sweep.ease }}
              style={{ borderRadius: "inherit" }}
            />
          )}
        </AnimatePresence>

        <motion.div
          className="h-[2px] bg-white/5 relative overflow-hidden"
          animate={{ opacity: expanded ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-y-0 left-0 bg-white"
            animate={{ width: `${player.progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </motion.div>

        <motion.div
          className="h-full"
          animate={{ padding: expanded ? 16 : 10 }}
          transition={ANIMATION_CONFIG.sweep}
        >
          <AnimatePresence mode="wait">
            {!expanded ? (
              <motion.div
                key="compact"
                className="flex items-center gap-3 h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <motion.button
                  onClick={player.toggle}
                  className="w-7 h-7 bg-white flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform"
                  whileTap={{ scale: 0.95 }}
                >
                  {player.playing ? (
                    <Pause className="text-black w-3 h-3" fill="currentColor" />
                  ) : (
                    <Play className="text-black w-3 h-3 ml-0.5" fill="currentColor" />
                  )}
                </motion.button>

                <div className="min-w-0 flex-1 relative">
                  <AnimatePresence>
                    {nameSweep && (
                      <motion.div
                        className="absolute inset-0 bg-white z-0 pointer-events-none"
                        initial={{ x: "-100%" }}
                        animate={["-100%", "0%", "0%", "100%"]}
                        exit={{ x: "100%" }}
                        transition={{
                          duration: (ANIMATION_CONFIG.sweep.duration || 0.5) + 0.1,
                          ease: ANIMATION_CONFIG.sweep.ease,
                          times: (() => {
                            const D = (ANIMATION_CONFIG.sweep.duration || 0.5)
                            const H = 0.1
                            const total = D + H
                            const t1 = (D / 2) / total
                            const t2 = (D / 2 + H) / total
                            return [0, t1, t2, 1]
                          })(),
                        }}
                      />
                    )}
                  </AnimatePresence>

                  <p className="text-[11px] font-medium text-white truncate leading-tight relative z-10">
                    {player.currentTrack.title}
                  </p>

                  <p className="text-[10px] text-white/40 truncate relative z-10">
                    {player.currentTrack.artist}
                  </p>
                </div>

                <AudioBars playing={player.playing} />
              </motion.div>
            ) : (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1 relative overflow-hidden">
                    <div className="relative">
                      <AnimatePresence>
                        {nameSweep && (
                          <motion.div
                            className="absolute inset-0 bg-white z-0 pointer-events-none"
                            initial={{ x: "-100%" }}
                            animate={["-100%", "0%", "0%", "100%"]}
                            exit={{ x: "100%" }}
                            transition={{
                              duration: (ANIMATION_CONFIG.sweep.duration || 0.5) + 0.1,
                              ease: ANIMATION_CONFIG.sweep.ease,
                              times: (() => {
                                const D = (ANIMATION_CONFIG.sweep.duration || 0.5)
                                const H = 0.1
                                const total = D + H
                                const t1 = (D / 2) / total
                                const t2 = (D / 2 + H) / total
                                return [0, t1, t2, 1]
                              })(),
                            }}
                          />
                        )}
                      </AnimatePresence>

                      <p className="font-medium text-white truncate leading-tight text-[15px] relative z-10">
                        {player.currentTrack.title}
                      </p>
                      <p className="text-white/50 truncate text-xs mt-0.5 relative z-10">{player.currentTrack.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <motion.button
                      onClick={player.prev}
                      className="w-9 h-9 text-white/50 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
                      whileTap={{ scale: 0.9 }}
                    >
                      <SkipBack className="w-4 h-4" fill="currentColor" />
                    </motion.button>

                    <motion.button
                      onClick={player.toggle}
                      className="w-11 h-11 bg-white flex items-center justify-center hover:scale-105 transition-transform"
                      whileTap={{ scale: 0.95 }}
                    >
                      {player.playing ? (
                        <Pause className="text-black w-4 h-4" fill="currentColor" />
                      ) : (
                        <Play className="text-black w-4 h-4 ml-0.5" fill="currentColor" />
                      )}
                    </motion.button>

                    <motion.button
                      onClick={player.next}
                      className="w-9 h-9 text-white/50 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
                      whileTap={{ scale: 0.9 }}
                    >
                      <SkipForward className="w-4 h-4" fill="currentColor" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
