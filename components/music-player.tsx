"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useAnimationControls } from "framer-motion"
import { Play, Pause, SkipBack, SkipForward } from "lucide-react"
import { useAudioPlayer } from "@/hooks/use-audio-player"
import { ANIMATION_CONFIG } from "@/lib/constants"
import type { Track } from "@/lib/types"

interface MusicPlayerProps {
  isVisible?: boolean
  onClose?: () => void
}

function AudioBars({ playing }: { playing: boolean }) {
  return (
    <div className="flex items-end gap-[2px] h-3">
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className="w-[3px] bg-white rounded-full origin-bottom"
          style={{ height: 12, scaleY: playing ? 0.8 : 0.3 }}
        />
      ))}
    </div>
  )
}

export function MusicPlayer({ isVisible = false, onClose }: MusicPlayerProps) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch tracks from API (works on Vercel - API route runs on server)
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch("/api/music")
        const data = await response.json()
        setTracks(data)
      } catch (error) {
        console.error("Failed to fetch music tracks:", error)
        setTracks([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTracks()
  }, [])

  const player = useAudioPlayer({
    tracks: tracks,
    autoPlay: true,
  })

  const expanded = isVisible
  const [visibleNow, setVisibleNow] = useState(isVisible)
  const [displayedIndex, setDisplayedIndex] = useState(player.trackIndex)
  const pendingIndex = useRef<number>(player.trackIndex)
  
  // Sweep animation controls
  const sweepControls = useAnimationControls()
  const [playerVisible, setPlayerVisible] = useState(false)

  useEffect(() => {
    // update displayed track index
    pendingIndex.current = player.trackIndex
    setDisplayedIndex(player.trackIndex)
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

  // Sweep animation sequence when player expands
  useEffect(() => {
    if (!expanded) {
      setPlayerVisible(false)
      return
    }

    let isMounted = true

    const runSweepAnimation = async () => {
      try {
        // Giai đoạn 1: Sweep từ trên xuống bao phủ toàn bộ (0.5s) - expand từ 0% đến 100%
        await sweepControls.start({
          scaleY: 1,
          transformOrigin: "top",
          transition: {
            duration: ANIMATION_CONFIG.sweep.duration,
            ease: ANIMATION_CONFIG.sweep.ease,
          },
        })
        if (!isMounted) return

        // Giai đoạn 2: Khi sweep bao phủ 100%, show player content (đã pre-render nên không lag)
        setPlayerVisible(true)

        // Giai đoạn 3: Sweep tiếp tục đi xuống biến mất (0.5s) - shrink từ 100% xuống 0%
        await sweepControls.start({
          scaleY: 0,
          transformOrigin: "bottom",
          transition: {
            duration: ANIMATION_CONFIG.sweep.duration,
            ease: ANIMATION_CONFIG.sweep.ease,
          },
        })
      } catch (error) {
        // Animation interrupted
      }
    }

    runSweepAnimation()

    return () => {
      isMounted = false
    }
  }, [expanded, sweepControls])

  const displayed = tracks[displayedIndex] ?? player.currentTrack
  const queueRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = queueRef.current
    if (!el) return
    const top = player.trackIndex * 48
    el.scrollTo({ top, behavior: "smooth" })
  }, [player.trackIndex])


  return (
    <div
      className="w-[380px]"
      style={{ height: "fit-content" }}
    >
      {/* Sweep overlay - always visible to animate from start */}
      {expanded && (
        <motion.div
          className="absolute inset-0 bg-white z-50 pointer-events-none w-[380px]"
          initial={{ scaleY: 0, transformOrigin: "top" }}
          animate={sweepControls}
        />
      )}

      {/* Player card - always render (pre-compiled), just toggle visibility */}
      <div
        className="w-full bg-[#0a0a0a]/95 border border-white/10 overflow-hidden backdrop-blur-xl relative flex flex-col"
        style={{
          boxShadow: "0 0 0 1px rgba(255,255,255,.1), 0 20px 50px -10px rgba(0,0,0,.8)",
          minHeight: "300px",
          maxHeight: "650px",
          visibility: playerVisible ? "visible" : "hidden",
        }}
      >
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center h-64 text-white/50 text-sm">
              Loading music...
            </div>
          )}

          {/* No tracks state */}
          {!isLoading && tracks.length === 0 && (
            <div className="flex items-center justify-center h-64 text-white/50 text-sm text-center px-4">
              No music files found in /public/music
            </div>
          )}

          {/* Normal player UI */}
          {!isLoading && tracks.length > 0 && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-2 relative z-0 flex-shrink-0">
                <p className="text-sm font-medium text-white">Now Playing</p>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="text-white/50 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Progress bar */}
              <motion.div
                className="h-[2px] bg-white/5 relative overflow-hidden z-0 flex-shrink-0"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <motion.div
                  className="absolute inset-y-0 left-0 bg-white"
                  animate={{ width: `${player.progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </motion.div>

              {/* Main content + queue */}
              <div className="flex-1 p-4 relative z-0 overflow-hidden flex flex-col">
                {/* Now playing content */}
                <AnimatePresence mode="wait">
                  {expanded && (
                    <motion.div
                      key="expanded"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex-shrink-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="min-w-0 flex-1 relative overflow-hidden">
                          <div className="relative">
                            <p 
                              className="font-medium text-white leading-tight text-[15px] relative z-10"
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {displayed.title}
                            </p>
                            <p 
                              className="text-white/50 text-xs mt-0.5 relative z-10"
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {displayed.artist}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={player.prev}
                            className="w-9 h-9 text-white/50 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
                          >
                            <SkipBack className="w-4 h-4" fill="currentColor" />
                          </button>

                          <button
                            onClick={player.toggle}
                            className="w-11 h-11 bg-white flex items-center justify-center hover:scale-105 transition-transform"
                          >
                            {player.playing ? (
                              <Pause className="text-black w-4 h-4" fill="currentColor" />
                            ) : (
                              <Play className="text-black w-4 h-4 ml-0.5" fill="currentColor" />
                            )}
                          </button>

                          <button
                            onClick={player.next}
                            className="w-9 h-9 text-white/50 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
                          >
                            <SkipForward className="w-4 h-4" fill="currentColor" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Queue section */}
                <div style={{ marginTop: 16, overflow: "hidden", flex: "1 1 auto", display: "flex", flexDirection: "column" }}>
                  <div className="border-t border-white/10 pt-4 flex-1 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-3 flex-shrink-0">
                      <p className="text-[10px] text-white/40 uppercase tracking-[.15em] font-medium">Queue</p>
                      <p className="text-[10px] text-white/30 font-mono">
                        {player.trackIndex + 1}/{tracks.length}
                      </p>
                    </div>

                    <div className="relative overflow-y-auto flex-1" ref={queueRef} style={{ minHeight: 0 }}>
                      <div
                        className="absolute left-0 right-0 flex items-center justify-between pointer-events-none z-10 px-2"
                        style={{ top: `${player.trackIndex * 48}px`, height: 48 }}
                      >
                        <span className="text-white text-sm font-mono">&gt;</span>
                        <span className="text-white text-sm font-mono">&lt;</span>
                      </div>

                      {tracks.map((track, i) => (
                        <button
                          key={`${track.title}-${i}`}
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
                            className={`text-sm flex-1 text-center transition-colors ${
                              player.trackIndex === i ? "text-white" : "text-white/50"
                            }`}
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {track.title}
                            {player.loadErrors && player.loadErrors[i] && (
                              <span className="ml-2 text-[10px] text-rose-400">(file missing)</span>
                            )}
                          </span>

                          <span className="text-[10px] font-mono text-white/30">{track.duration}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
    </div>
  )
}
