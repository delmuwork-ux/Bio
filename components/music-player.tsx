"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence, useAnimationControls } from "framer-motion"
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
          style={{ height: 12, transform: `scaleY(${playing ? 0.8 : 0.3})` }}
        />
      ))}
    </div>
  )
}

export function MusicPlayer({ isVisible = false, onClose }: MusicPlayerProps) {
  // ALL STATES
  const [tracks, setTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [visibleNow, setVisibleNow] = useState(isVisible)
  const [displayedIndex, setDisplayedIndex] = useState(0)
  const [isClosing, setIsClosing] = useState(false)
  const [isAnimatingExpand, setIsAnimatingExpand] = useState(false)
  const [sweepDirection, setSweepDirection] = useState<'left' | 'right' | null>(null)
  const [playerVisible, setPlayerVisible] = useState(false)
  const [sweepClosing, setSweepClosing] = useState(false)

  // ALL REFS
  const pendingIndex = useRef<number>(0)
  const touchStartX = useRef<number>(0)
  const prevExpandedRef = useRef(isVisible)
  const prevClosingRef = useRef(isClosing)
  const isMountedRef = useRef(true)
  const sweepProcessingRef = useRef(false)

  // ALL ANIMATION CONTROLS - Top level!
  const sweepControls = useAnimationControls()
  const trackChangeSweepControls = useAnimationControls()

  // Get player hook
  const player = useAudioPlayer({
    tracks: tracks,
    autoPlay: true,
  })

  // Sync displayedIndex with player
  useEffect(() => {
    setDisplayedIndex(player.trackIndex)
    pendingIndex.current = player.trackIndex
    
    const currentTrack = tracks[player.trackIndex]
    if (currentTrack) {
      window.dispatchEvent(new CustomEvent("trackChange", { detail: { title: currentTrack.title } }))
    }
  }, [player.trackIndex, tracks])

  // Fetch tracks from API
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

  // Listen for audio unlock events
  useEffect(() => {
    const handler = () => {
      player.play()
    }
    const started = () => setVisibleNow(true)
    window.addEventListener("unlockAudio", handler)
    window.addEventListener("musicStarted", started)

    if ((typeof window !== "undefined") && (window as any).__musicStarted) setVisibleNow(true)

    return () => {
      window.removeEventListener("unlockAudio", handler)
      window.removeEventListener("musicStarted", started)
    }
  }, [player])

  // Sync visible state
  useEffect(() => {
    if (!isVisible) {
      setVisibleNow(false)
      setSweepClosing(false)
      setSweepDirection(null)
      sweepProcessingRef.current = false
    }
  }, [isVisible])

  // Main animation effect for open/close
  useEffect(() => {
    const expanded = isVisible
    
    const runAnimation = async () => {
      // Check if state actually changed
      const expandedChanged = prevExpandedRef.current !== expanded
      const closingChanged = prevClosingRef.current !== isClosing
      
      prevExpandedRef.current = expanded
      prevClosingRef.current = isClosing
      
      if (!expandedChanged && !closingChanged) return

      // OPENING animation
      if (expanded && expandedChanged) {
        setIsAnimatingExpand(true)
        setSweepClosing(false)
        setSweepDirection(null)
        sweepProcessingRef.current = false
        try {
          await sweepControls.set({
            scaleY: 0,
            transformOrigin: "top",
          })
          await trackChangeSweepControls.set({
            scaleX: 0,
            transformOrigin: "left",
          })
          if (!isMountedRef.current) return

          await sweepControls.start({
            scaleY: 1,
            transformOrigin: "top",
            transition: {
              duration: ANIMATION_CONFIG.sweep.duration,
              ease: ANIMATION_CONFIG.sweep.ease,
            },
          })
          if (!isMountedRef.current) return

          setPlayerVisible(true)

          await sweepControls.start({
            scaleY: 0,
            transformOrigin: "bottom",
            transition: {
              duration: ANIMATION_CONFIG.sweep.duration,
              ease: ANIMATION_CONFIG.sweep.ease,
            },
          })
          if (!isMountedRef.current) return
        } catch (error) {
          // Ignore animation errors
        } finally {
          if (isMountedRef.current) {
            setIsAnimatingExpand(false)
          }
        }
      }
      // CLOSING animation
      else if (isClosing && closingChanged) {
        setIsAnimatingExpand(true)
        setSweepClosing(true)
        setSweepDirection(null)
        sweepProcessingRef.current = false
        try {
          await trackChangeSweepControls.set({
            scaleX: 0,
            transition: { duration: 0 },
          })
          if (!isMountedRef.current) return

          // Phase 1: Sweep từ dưới lên phủ 100% card
          await sweepControls.start({
            scaleY: 1,
            transformOrigin: "bottom",
            transition: {
              duration: ANIMATION_CONFIG.sweep.duration,
              ease: ANIMATION_CONFIG.sweep.ease,
            },
          })
          if (!isMountedRef.current) return

          // Phase 2: Card biến mất (sweep vẫn phủ 100%)
          setPlayerVisible(false)
          if (!isMountedRef.current) return

          // Phase 3: Sweep biến mất từ dưới lên trên
          await sweepControls.start({
            scaleY: 0,
            transformOrigin: "top",
            transition: {
              duration: ANIMATION_CONFIG.sweep.duration,
              ease: ANIMATION_CONFIG.sweep.ease,
            },
          })
          if (!isMountedRef.current) return

          // Phase 4: Tắt sweep và gọi onClose
          setSweepClosing(false)
          if (onClose) onClose()
          
        } catch (error) {
          setSweepClosing(false)
          if (onClose) onClose()
        } finally {
          if (isMountedRef.current) {
            setIsClosing(false)
            setIsAnimatingExpand(false)
          }
        }
      }
    }

    runAnimation()
  }, [isVisible, isClosing, sweepControls, trackChangeSweepControls, onClose])

  // Track change sweep animation
  useEffect(() => {
    if (!sweepDirection || !playerVisible || isAnimatingExpand || sweepProcessingRef.current) return

    sweepProcessingRef.current = true
    let isMounted = true

    const runTrackChangeSweep = async () => {
      try {
        const transformOrigin = sweepDirection === 'left' ? 'right' : 'left'

        await trackChangeSweepControls.start({
          scaleX: 1,
          transformOrigin,
          transition: {
            duration: ANIMATION_CONFIG.sweep.duration / 1.5,
            ease: ANIMATION_CONFIG.sweep.ease,
          },
        })
        if (!isMounted) return

        if (sweepDirection === 'left') {
          player.next()
        } else {
          player.prev()
        }

        await trackChangeSweepControls.start({
          scaleX: 0,
          transformOrigin: sweepDirection === 'left' ? 'left' : 'right',
          transition: {
            duration: ANIMATION_CONFIG.sweep.duration / 1.5,
            ease: ANIMATION_CONFIG.sweep.ease,
          },
        })
        if (!isMounted) return

        if (isMounted) {
          setSweepDirection(null)
          sweepProcessingRef.current = false
        }
      } catch (error) {
        if (isMounted) {
          setSweepDirection(null)
          sweepProcessingRef.current = false
        }
      }
    }

    runTrackChangeSweep()

    return () => {
      isMounted = false
    }
  }, [sweepDirection, trackChangeSweepControls, playerVisible, isAnimatingExpand])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Compute expanded state
  const expanded = isVisible

  // Get displayed track
  const displayed = tracks[displayedIndex] ?? { title: "Unknown", artist: "Unknown", cover: null }

  // Event handlers
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      setSweepDirection('left')
    } else if (e.deltaY > 0) {
      setSweepDirection('right')
    }
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX
    const swipeDistance = touchStartX.current - touchEndX
    const minSwipeDistance = 50

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        setSweepDirection('left')
      } else {
        setSweepDirection('right')
      }
    }
  }, [])

  return (
    <div
      className="w-[320px]"
      style={{ height: "fit-content" }}
    >
      {/* Sweep overlay - render khi mở hoặc đang tắt */}
      {(expanded || sweepClosing) && (
        <motion.div
          className="absolute inset-0 bg-white z-50 pointer-events-none w-[320px]"
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
                <div className="flex items-center gap-1">
                  <p className="text-sm font-medium text-white">Now</p>
                  <p className="text-sm font-medium text-black bg-white px-1.5 py-0.5">Playing</p>
                </div>
                {onClose && (
                  <button
                    onClick={() => !isAnimatingExpand && !isClosing && setIsClosing(true)}
                    onMouseEnter={() => window.dispatchEvent(new CustomEvent("closeButtonHover", { detail: { label: "Close?" } }))}
                    onMouseLeave={() => window.dispatchEvent(new CustomEvent("closeButtonHover", { detail: { label: null } }))}
                    disabled={isAnimatingExpand || isClosing}
                    className="flex items-center justify-center w-6 h-6 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 rounded"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="2" width="12" height="12" fill="white"/>
                    </svg>
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
              <div className="flex-1 p-4 relative z-0 overflow-hidden flex flex-col" onWheel={handleWheel} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                {/* Album cover */}
              <div 
                className="mb-4 flex justify-center flex-shrink-0 cursor-pointer relative" 
                onClick={() => player.toggle()}
                onMouseEnter={() => window.dispatchEvent(new CustomEvent("thumbnailHover", { detail: { label: "Scroll to change tracks" } }))}
                onMouseLeave={() => window.dispatchEvent(new CustomEvent("thumbnailHover", { detail: { label: null } }))}
              >
                {displayed.cover ? (
                  <img
                    src={displayed.cover}
                    alt={displayed.title}
                    className="w-56 h-56 object-cover hover:opacity-80 transition-opacity"
                  />
                ) : (
                  <div className="w-56 h-56 bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center hover:opacity-80 transition-opacity">
                    <div className="text-center">
                      <p className="text-white/40 text-sm">♪</p>
                    </div>
                  </div>
                )}
                {/* Track change sweep overlay */}
                <motion.div
                  className="absolute inset-0 bg-white pointer-events-none"
                  initial={{ scaleX: 0 }}
                  animate={trackChangeSweepControls}
                  style={{
                    transformOrigin: sweepDirection === 'left' ? 'right' : 'left',
                  }}
                />
              </div>

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
                              className="font-medium text-black leading-tight text-[15px] relative z-10 bg-white px-1.5 py-0.5 truncate inline-block"
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: "230px",
                              }}
                            >
                              {displayed.title}
                            </p>
                          </div>
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

                        <div className="flex items-center gap-1">
                          {/* Controls removed - use scroll wheel to change tracks and click thumbnail to toggle play */}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>


              </div>
            </>
          )}
        </div>
    </div>
  )
}
