"use client"

import { useState, useEffect, useRef, useLayoutEffect } from "react"
import { motion, AnimatePresence, useAnimationControls, useMotionValue } from "framer-motion"
import { ProfileCard } from "@/components/profile-card"
import { DraggableMusicPlayer } from "@/components/draggable-music-player"
import { CyberBackground } from "@/components/cyber-background"
import { SplashScreen } from "@/components/splash-screen"
import { ANIMATION_CONFIG } from "@/lib/constants"

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const [showWhiteStrip, setShowWhiteStrip] = useState(false)
  const [stripPhase, setStripPhase] = useState<"vertical" | "full" | "horizontal" | "done">("vertical")
  const [showProfileCard, setShowProfileCard] = useState(false)
  const [showMusicPlayer, setShowMusicPlayer] = useState(false)
  const [profileAnimationComplete, setProfileAnimationComplete] = useState(false)
  const [musicPlayerExpanded, setMusicPlayerExpanded] = useState(false)
  const [musicPlayerX, setMusicPlayerX] = useState(0)
  const [musicPlayerY, setMusicPlayerY] = useState(0)
  const [showPlaylistButton, setShowPlaylistButton] = useState(false)
  const [showPlaylistButtonText, setShowPlaylistButtonText] = useState(false)
  const [showNowPlayingButtonText, setShowNowPlayingButtonText] = useState(false)
  const [hoveredStatLabel, setHoveredStatLabel] = useState<string | null>(null)
  const [currentTrackTitle, setCurrentTrackTitle] = useState<string>("Now Playing")
  const [tooltipWidth, setTooltipWidth] = useState(0)
  const tooltipTextRef = useRef<HTMLSpanElement>(null)
  const playlistSweepControls = useAnimationControls()
  const nowPlayingSweepControls = useAnimationControls()
  
  // Motion values for cursor follower - no re-renders on mouse move
  const mouseXMotion = useMotionValue(0)
  const mouseYMotion = useMotionValue(0)

  // Initialize website and audio when user enters from splash screen
  const handleSplashEnter = () => {
    setShowSplash(false)
    
    // start vertical-to-full white strip
    setTimeout(() => {
      setShowWhiteStrip(true)
      setStripPhase("vertical")
    }, 100)

    setTimeout(() => setStripPhase("full"), 500)

    // begin horizontal reveal and finish the strip, then start the name animation
    setTimeout(() => setStripPhase("horizontal"), 1000)
    
    // show profile card so sweep animation is visible
    setTimeout(() => setShowProfileCard(true), 900)
    
    setTimeout(() => {
      setStripPhase("done")
      setShowWhiteStrip(false)
      window.dispatchEvent(new CustomEvent("startNameAnimation"))
    }, 1250)

    // unlock audio and play music after user interaction
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.__audioUnlockRequested = true
    requestAnimationFrame(() => requestAnimationFrame(() => window.dispatchEvent(new CustomEvent("unlockAudio"))))
  }

  // Calculate position below "My playlist" button when player expands for the first time
  useEffect(() => {
    if (!musicPlayerExpanded) {
      // Reset position when player is closed
      setMusicPlayerX(0)
      setMusicPlayerY(0)
      return
    }

    if (musicPlayerX === 0 && musicPlayerY === 0) {
      // Wait a frame to ensure DOM is rendered
      requestAnimationFrame(() => {
        if (typeof window !== "undefined") {
          // Center position on screen
          setMusicPlayerX(Math.max(10, (window.innerWidth - 380) / 2))
          setMusicPlayerY(Math.max(10, (window.innerHeight - 420) / 2))
        }
      })
    }
  }, [musicPlayerExpanded])

  useEffect(() => {
    const onMusicStarted = () => {
      if (showMusicPlayer) return
      setShowMusicPlayer(true)
    }

    window.addEventListener("musicStarted", onMusicStarted)
    return () => window.removeEventListener("musicStarted", onMusicStarted)
  }, [showMusicPlayer])

  useEffect(() => {
    const onProfileAnimationComplete = () => {
      setProfileAnimationComplete(true)
      
      // Show playlist button after profile animation completes
      setShowPlaylistButton(true)
      
      // Show music player after profile animation completes
      setTimeout(() => {
        setShowMusicPlayer(true)
      }, 100)
    }

    window.addEventListener("profileAnimationComplete", onProfileAnimationComplete)
    return () => window.removeEventListener("profileAnimationComplete", onProfileAnimationComplete)
  }, [showMusicPlayer])

  useEffect(() => {
    const runPlaylistSweep = async () => {
      // Reset initial state
      await playlistSweepControls.set({
        scaleX: 0,
        transformOrigin: "left",
      })

      // Stage 1: Sweep covers từ trái sang phải (scaleX 0 -> 1) để cover content
      await playlistSweepControls.start({
        scaleX: 1,
        transformOrigin: "left",
        transition: {
          duration: ANIMATION_CONFIG.sweep.duration || 0.5,
          ease: ANIMATION_CONFIG.sweep.ease,
        },
      })
      
      // Show text khi sweep lấp đầy 100%
      setShowPlaylistButtonText(true)
      
      // Stage 2: Sweep biến mất từ phải sang trái (scaleX 1 -> 0)
      await playlistSweepControls.start({
        scaleX: 0,
        transformOrigin: "right",
        transition: {
          duration: ANIMATION_CONFIG.sweep.duration || 0.5,
          ease: ANIMATION_CONFIG.sweep.ease,
        },
      })
    }

    const runNowPlayingSweep = async () => {
      // Reset initial state
      await nowPlayingSweepControls.set({
        scaleX: 0,
        transformOrigin: "left",
      })

      // Stage 1: Sweep covers từ trái sang phải (scaleX 0 -> 1) để cover content
      await nowPlayingSweepControls.start({
        scaleX: 1,
        transformOrigin: "left",
        transition: {
          duration: ANIMATION_CONFIG.sweep.duration || 0.5,
          ease: ANIMATION_CONFIG.sweep.ease,
        },
      })
      
      // Show text khi sweep lấp đầy 100%
      setShowNowPlayingButtonText(true)
      
      // Stage 2: Sweep biến mất từ phải sang trái (scaleX 1 -> 0)
      await nowPlayingSweepControls.start({
        scaleX: 0,
        transformOrigin: "right",
        transition: {
          duration: ANIMATION_CONFIG.sweep.duration || 0.5,
          ease: ANIMATION_CONFIG.sweep.ease,
        },
      })
    }

    if (showPlaylistButton) {
      setShowPlaylistButtonText(false)
      setShowNowPlayingButtonText(false)
      runPlaylistSweep()
      runNowPlayingSweep()
    }
  }, [showPlaylistButton, playlistSweepControls, nowPlayingSweepControls])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseXMotion.set(e.clientX + 20)
      mouseYMotion.set(e.clientY - 30)
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseXMotion, mouseYMotion])

  useEffect(() => {
    const handleStatHover = (e: Event) => {
      const customEvent = e as CustomEvent<{ label: string | null }>
      setHoveredStatLabel(customEvent.detail.label)
    }

    const handleCloseButtonHover = (e: Event) => {
      const customEvent = e as CustomEvent<{ label: string | null }>
      setHoveredStatLabel(customEvent.detail.label)
    }

    const handleTrackChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ title: string }>
      setCurrentTrackTitle(customEvent.detail.title)
    }

    const handleNowPlayingHover = (e: Event) => {
      const customEvent = e as CustomEvent<{ label: string | null }>
      setHoveredStatLabel(customEvent.detail.label)
    }

    const handlePlaylistButtonHover = (e: Event) => {
      const customEvent = e as CustomEvent<{ label: string | null }>
      setHoveredStatLabel(customEvent.detail.label)
    }

    const handleRectangleHover = (e: Event) => {
      const customEvent = e as CustomEvent<{ label: string | null }>
      setHoveredStatLabel(customEvent.detail.label)
    }

    const handleThumbnailHover = (e: Event) => {
      const customEvent = e as CustomEvent<{ label: string | null }>
      setHoveredStatLabel(customEvent.detail.label)
    }

    window.addEventListener("statHover", handleStatHover)
    window.addEventListener("closeButtonHover", handleCloseButtonHover)
    window.addEventListener("trackChange", handleTrackChange)
    window.addEventListener("nowPlayingHover", handleNowPlayingHover)
    window.addEventListener("playlistButtonHover", handlePlaylistButtonHover)
    window.addEventListener("rectangleHover", handleRectangleHover)
    window.addEventListener("thumbnailHover", handleThumbnailHover)
    return () => {
      window.removeEventListener("statHover", handleStatHover)
      window.removeEventListener("closeButtonHover", handleCloseButtonHover)
      window.removeEventListener("trackChange", handleTrackChange)
      window.removeEventListener("nowPlayingHover", handleNowPlayingHover)
      window.removeEventListener("playlistButtonHover", handlePlaylistButtonHover)
      window.removeEventListener("rectangleHover", handleRectangleHover)
      window.removeEventListener("thumbnailHover", handleThumbnailHover)
    }
  }, [])

  // Measure tooltip text width using ResizeObserver - reacts to any size change
  useEffect(() => {
    if (!tooltipTextRef.current || !hoveredStatLabel) return

    const resizeObserver = new ResizeObserver(() => {
      const width = tooltipTextRef.current?.offsetWidth
      if (width && width > 0) {
        setTooltipWidth(width + 16)
      }
    })

    resizeObserver.observe(tooltipTextRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [hoveredStatLabel])

  return (
    <>
      {/* Splash Screen - Show before main content */}
      <AnimatePresence>
        {showSplash && <SplashScreen onEnter={handleSplashEnter} />}
      </AnimatePresence>

      {/* Mouse Following White Rectangle - Optimized with MotionValues */}
      <motion.div
        className="fixed flex items-center justify-center"
        style={{
          backgroundColor: "white",
          zIndex: 100,
          x: mouseXMotion,
          y: mouseYMotion,
          height: 32,
          pointerEvents: "auto",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          overflow: "hidden",
        }}
        onMouseEnter={() => window.dispatchEvent(new CustomEvent("rectangleHover", { detail: { label: "Wana see it?" } }))}
        onMouseLeave={() => window.dispatchEvent(new CustomEvent("rectangleHover", { detail: { label: null } }))}
        animate={{
          width: hoveredStatLabel ? Math.max(70, tooltipWidth) : 0,
        }}
        transition={{
          width: { type: "tween", duration: 0.3, ease: "easeOut" }
        }}
      >
        <AnimatePresence mode="wait">
          {hoveredStatLabel && (
            <motion.span               ref={tooltipTextRef}              className="text-sm font-bold text-black whitespace-nowrap px-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              key={hoveredStatLabel}
            >
              {hoveredStatLabel}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      <main className="relative min-h-screen overflow-hidden w-screen">
      <CyberBackground />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20 pb-40">
        {/* Profile Card */}
        <AnimatePresence>
          {showProfileCard && (
            <div className="flex items-start justify-center relative">
              <div className="w-full max-w-sm space-y-4 relative flex-shrink-0">
                {showWhiteStrip && stripPhase !== "done" && (
                  <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
                    <div
                      className="absolute bg-white left-0 right-0"
                      style={{
                        top: 0,
                        height: stripPhase === "vertical" ? "0%" : "50%",
                        left: stripPhase === "horizontal" ? "50%" : "0%",
                        right: stripPhase === "horizontal" ? "50%" : "0%",
                        transition: "all 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
                      }}
                    />
                    <div
                      className="absolute bg-white left-0 right-0"
                      style={{
                        bottom: 0,
                        height: stripPhase === "vertical" ? "0%" : "50%",
                        left: stripPhase === "horizontal" ? "50%" : "0%",
                        right: stripPhase === "horizontal" ? "50%" : "0%",
                        transition: "all 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
                      }}
                    />
                  </div>
                )}

                <motion.div
                  style={{ transformOrigin: "center center" }}
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <ProfileCard />
                </motion.div>
              </div>

              {/* MyPlaylist Button - Horizontal Bar Above ProfileCard */}
              <motion.button
                className="h-10 px-6 flex items-center justify-center text-white font-medium text-sm tracking-tight cursor-pointer z-30 whitespace-nowrap overflow-hidden"
                style={{
                  position: "absolute",
                  top: "-48px",
                  left: "0px",
                  background: "#0f0f11",
                  border: "1px solid rgba(255,255,255,.06)",
                  boxShadow: "0 8px 20px rgba(0,0,0,.6)",
                  opacity: showPlaylistButton ? 1 : 0,
                  pointerEvents: showPlaylistButton ? "auto" : "none",
                }}
                onClick={() => setMusicPlayerExpanded(true)}
                onMouseEnter={() => window.dispatchEvent(new CustomEvent("playlistButtonHover", { detail: { label: "Wana see it?" } }))}
                onMouseLeave={() => window.dispatchEvent(new CustomEvent("playlistButtonHover", { detail: { label: null } }))}
              >
                {/* Sweep overlay */}
                <motion.div
                  className="absolute inset-0 bg-white pointer-events-none"
                  initial={{ scaleX: 0, transformOrigin: "left" }}
                  animate={playlistSweepControls}
                  style={{ 
                    transformOrigin: "left",
                    zIndex: 50,
                  }}
                />
                {/* Text - always visible, opacity controlled */}
                <span className="relative z-10" style={{ opacity: showPlaylistButtonText ? 1 : 0 }}>
                  My playlist&lt;3
                </span>
              </motion.button>

              {/* Now Playing Display - Horizontal Bar Above ProfileCard */}
              <motion.div
                className="h-10 px-6 flex items-center justify-center text-white font-medium text-sm tracking-tight z-30 whitespace-nowrap overflow-hidden relative"
                style={{
                  position: "absolute",
                  top: "-48px",
                  left: "140px",
                  background: "#0f0f11",
                  border: "1px solid rgba(255,255,255,.06)",
                  boxShadow: "0 8px 20px rgba(0,0,0,.6)",
                  opacity: showPlaylistButton ? 1 : 0,
                  pointerEvents: "auto",
                  minWidth: "218px",
                  maxWidth: "218px",
                  cursor: "pointer",
                }}
                onMouseEnter={() => window.dispatchEvent(new CustomEvent("nowPlayingHover", { detail: { label: currentTrackTitle } }))}
                onMouseLeave={() => window.dispatchEvent(new CustomEvent("nowPlayingHover", { detail: { label: null } }))}
              >
                {/* Sweep overlay */}
                <motion.div
                  className="absolute inset-0 bg-white pointer-events-none"
                  initial={{ scaleX: 0, transformOrigin: "left" }}
                  animate={nowPlayingSweepControls}
                  style={{ 
                    transformOrigin: "left",
                    zIndex: 50,
                  }}
                />
                {/* Text - always visible, opacity controlled with truncation */}
                <span className="truncate relative z-10" style={{ opacity: showNowPlayingButtonText ? 1 : 0 }}>
                  Now Playing: {currentTrackTitle}
                </span>
              </motion.div>
            </div>
            )}
          </AnimatePresence>
        </div>

      {/* Music Player - Draggable - Always mounted to keep audio playing */}
      <DraggableMusicPlayer
        isVisible={musicPlayerExpanded}
        onClose={() => {
          setMusicPlayerExpanded(false)
        }}
        defaultX={musicPlayerX}
        defaultY={musicPlayerY}
      />

    </main>
    </>
  )
}
