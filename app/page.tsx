"use client"

import { useState, useEffect, useRef, useLayoutEffect } from "react"
import { motion, AnimatePresence, useAnimationControls, useMotionValue } from "framer-motion"
import Image from "next/image"
import { ProfileCard } from "@/components/profile-card"
import { CyberBackground } from "@/components/cyber-background"
import { SplashScreen } from "@/components/splash-screen"
import { MusicPlayer } from "@/components/music-player"
import { ANIMATION_CONFIG } from "@/lib/constants"

const getCornerClassName = (corner: number) => {
  switch (corner) {
    case 0: return "absolute top-[-40px] left-[-40px] w-[200px] h-[200px] sm:top-[-60px] sm:left-[-60px] sm:w-[300px] sm:h-[300px] md:top-[-80px] md:left-[-80px] md:w-[400px] md:h-[400px]"
    case 1: return "absolute top-[-40px] right-[-40px] w-[200px] h-[200px] sm:top-[-60px] sm:right-[-60px] sm:w-[300px] sm:h-[300px] md:top-[-80px] md:right-[-80px] md:w-[400px] md:h-[400px]"
    case 2: return "absolute bottom-[-40px] right-[-40px] w-[200px] h-[200px] sm:bottom-[-60px] sm:right-[-60px] sm:w-[300px] sm:h-[300px] md:bottom-[-80px] md:right-[-80px] md:w-[400px] md:h-[400px]"
    case 3: return "absolute bottom-[-40px] left-[-40px] w-[200px] h-[200px] sm:bottom-[-60px] sm:left-[-60px] sm:w-[300px] sm:h-[300px] md:bottom-[-80px] md:left-[-80px] md:w-[400px] md:h-[400px]"
    default: return ""
  }
}

const getCornerVariants = (corner: number) => {
  let xOffset = 0
  let yOffset = 0
  let rotation = 0
  switch (corner) {
    case 0: xOffset = -400; yOffset = -400; rotation = 135; break
    case 1: xOffset = 400; yOffset = -400; rotation = 225; break
    case 2: xOffset = 400; yOffset = 400; rotation = -45; break
    case 3: xOffset = -400; yOffset = 400; rotation = 45; break
  }
  return {
    hidden: { 
      x: xOffset, 
      y: yOffset, 
      rotate: rotation, 
      opacity: 0, 
      transition: { type: "tween", duration: 0.35, ease: "easeIn" } 
    },
    visible: { 
      x: 0, 
      y: 0, 
      rotate: rotation, 
      opacity: 1, 
      transition: { type: "spring", stiffness: 150, damping: 18 } 
    }
  }
}

const OBJ_POOL = [
  "/img website/obj 1.png",
  "/img website/obj 2.png",
  "/img website/obj 3.png",
  "/img website/obj 4.png",
]

const CornerOrnament = ({ corner, src, customTransition, visible = true }: { corner: number; src: string; customTransition?: any; visible?: boolean }) => {
  const [error, setError] = useState(false)

  return (
    <motion.div
      className={getCornerClassName(corner)}
      variants={getCornerVariants(corner)}
      initial="hidden"
      animate={visible ? "visible" : "hidden"}
      transition={customTransition}
      style={{ willChange: "transform, opacity" }}
    >
      {!error && (
        <img
          src={src}
          alt=""
          loading="eager"
          decoding="async"
          className="w-full h-full object-contain"
          onError={() => setError(true)}
        />
      )}
    </motion.div>
  )
}

// Pixel art clip-path for stepped corners (2-step staircase)
const pixelClipPath = (s: number) => `polygon(
  0 ${s*2}px, ${s}px ${s*2}px, ${s}px ${s}px, ${s*2}px ${s}px, ${s*2}px 0,
  calc(100% - ${s*2}px) 0, calc(100% - ${s*2}px) ${s}px, calc(100% - ${s}px) ${s}px, calc(100% - ${s}px) ${s*2}px, 100% ${s*2}px,
  100% calc(100% - ${s*2}px), calc(100% - ${s}px) calc(100% - ${s*2}px), calc(100% - ${s}px) calc(100% - ${s}px), calc(100% - ${s*2}px) calc(100% - ${s}px), calc(100% - ${s*2}px) 100%,
  ${s*2}px 100%, ${s*2}px calc(100% - ${s}px), ${s}px calc(100% - ${s}px), ${s}px calc(100% - ${s*2}px), 0 calc(100% - ${s*2}px)
)`

// Pixel art corner studs for picture frame decoration
const PixelFrameCorners = ({ size = 12, inset = 2, visible = true }: { size?: number; inset?: number; visible?: boolean }) => {
  if (!visible) return null
  const positions = [
    { top: inset, left: inset },
    { top: inset, right: inset },
    { bottom: inset, left: inset },
    { bottom: inset, right: inset },
  ] as const
  return (
    <>
      {positions.map((pos, i) => (
        <svg
          key={i}
          className="absolute z-20 pointer-events-none"
          style={{ ...pos, width: size, height: size }}
          viewBox="0 0 5 5"
          shapeRendering="crispEdges"
        >
          {/* Gold diamond stud with highlight and shadow */}
          <rect x="1" y="0" width="3" height="1" fill="#d4af37"/>
          <rect x="0" y="1" width="1" height="3" fill="#d4af37"/>
          <rect x="1" y="1" width="3" height="3" fill="#ffd27d"/>
          <rect x="4" y="1" width="1" height="3" fill="#b8942e"/>
          <rect x="1" y="4" width="3" height="1" fill="#b8942e"/>
          {/* Center highlight pixel */}
          <rect x="2" y="2" width="1" height="1" fill="#ffe8b0"/>
        </svg>
      ))}
    </>
  )
}

// Pixel art golden flower decorations on frame edges
const PixelFrameFlowers = ({ visible = true, flowerSize = 18 }: { visible?: boolean; flowerSize?: number }) => {
  if (!visible) return null
  const half = flowerSize / 2
  const flowers = [
    { style: { top: -half + 1, left: '50%', transform: 'translateX(-50%)' } as React.CSSProperties },
    { style: { bottom: -half + 1, left: '50%', transform: 'translateX(-50%)' } as React.CSSProperties },
    { style: { left: -half + 1, top: '50%', transform: 'translateY(-50%)' } as React.CSSProperties },
    { style: { right: -half + 1, top: '50%', transform: 'translateY(-50%)' } as React.CSSProperties },
  ]
  return (
    <>
      {flowers.map((f, i) => (
        <svg
          key={i}
          className="absolute z-20 pointer-events-none"
          style={{ ...f.style, width: flowerSize, height: flowerSize }}
          viewBox="0 0 9 9"
          shapeRendering="crispEdges"
        >
          {/* Outer petals - light gold */}
          <rect x="4" y="0" width="1" height="1" fill="#ffd27d"/>
          <rect x="3" y="1" width="1" height="1" fill="#ffd27d"/>
          <rect x="5" y="1" width="1" height="1" fill="#ffd27d"/>
          <rect x="0" y="4" width="1" height="1" fill="#ffd27d"/>
          <rect x="1" y="3" width="1" height="1" fill="#ffd27d"/>
          <rect x="1" y="5" width="1" height="1" fill="#ffd27d"/>
          <rect x="8" y="4" width="1" height="1" fill="#ffd27d"/>
          <rect x="7" y="3" width="1" height="1" fill="#ffd27d"/>
          <rect x="7" y="5" width="1" height="1" fill="#ffd27d"/>
          <rect x="4" y="8" width="1" height="1" fill="#ffd27d"/>
          <rect x="3" y="7" width="1" height="1" fill="#ffd27d"/>
          <rect x="5" y="7" width="1" height="1" fill="#ffd27d"/>
          {/* Inner petals - bright gold */}
          <rect x="4" y="1" width="1" height="1" fill="#ffe8b0"/>
          <rect x="1" y="4" width="1" height="1" fill="#ffe8b0"/>
          <rect x="7" y="4" width="1" height="1" fill="#ffe8b0"/>
          <rect x="4" y="7" width="1" height="1" fill="#ffe8b0"/>
          {/* Center bloom - 3x3 */}
          <rect x="3" y="2" width="3" height="1" fill="#d4af37"/>
          <rect x="2" y="3" width="1" height="3" fill="#d4af37"/>
          <rect x="6" y="3" width="1" height="3" fill="#d4af37"/>
          <rect x="3" y="6" width="3" height="1" fill="#d4af37"/>
          <rect x="3" y="3" width="3" height="3" fill="#ffd27d"/>
          {/* Center pistil */}
          <rect x="4" y="3" width="1" height="1" fill="#ffe8b0"/>
          <rect x="3" y="4" width="1" height="1" fill="#ffe8b0"/>
          <rect x="4" y="4" width="1" height="1" fill="#b8942e"/>
          <rect x="5" y="4" width="1" height="1" fill="#d4af37"/>
          <rect x="4" y="5" width="1" height="1" fill="#d4af37"/>
        </svg>
      ))}
    </>
  )
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const showSplashRef = useRef(true)
  const musicStartedRef = useRef(false)
  const timelineTriggeredRef = useRef<Record<string, boolean>>({})
  const virtualTimeRef = useRef(0)
  const lastFrameTimeRef = useRef<number | null>(null)
  const timelineLoopActiveRef = useRef(false)
  const visBarsRef = useRef<HTMLDivElement[]>([])
  const lastVisualizerValues = useRef<number[]>(Array(4).fill(0.15))
  const [showObj1, setShowObj1] = useState(false)
  const [showObj2, setShowObj2] = useState(false)
  const [showObj3, setShowObj3] = useState(false)
  const [showObj4, setShowObj4] = useState(false)
  const [showWhiteStrip, setShowWhiteStrip] = useState(false)
  const [stripPhase, setStripPhase] = useState<"vertical" | "full" | "horizontal" | "done">("vertical")
  const [showProfileCard, setShowProfileCard] = useState(false)
  const [showMusicPlayer, setShowMusicPlayer] = useState(false)
  const [profileAnimationComplete, setProfileAnimationComplete] = useState(false)
  const [musicPlayerExpanded, setMusicPlayerExpanded] = useState(false)
  const [musicPlayerX, setMusicPlayerX] = useState(0)
  const [musicPlayerY, setMusicPlayerY] = useState(0)
  const [showPlaylistButton, setShowPlaylistButton] = useState(false)
  const [hudPositionState, setHudPositionState] = useState<"initial" | "centerUp" | "corner">("initial")
  const [showPlaylistButtonText, setShowPlaylistButtonText] = useState(false)
  const [showNowPlayingButtonText, setShowNowPlayingButtonText] = useState(false)
  const [hoveredStatLabel, setHoveredStatLabel] = useState<string | null>(null)
  const isDelmuHovered = hoveredStatLabel?.trim().toLowerCase() === "@_delmu"
  const isWaveBoxHovered = hoveredStatLabel?.trim() === "δあくむ✁︎🥀"
  const isBoothHovered = hoveredStatLabel?.trim().toLowerCase() === "booth"
  const [currentTrackTitle, setCurrentTrackTitle] = useState<string>("Now Playing")
  const [tooltipWidth, setTooltipWidth] = useState(0)
  const tooltipTextRef = useRef<HTMLSpanElement>(null)
  const playlistSweepControls = useAnimationControls()
  const nowPlayingSweepControls = useAnimationControls()
  const cameraControls = useAnimationControls()
  const bgControls = useAnimationControls()
  const [delmuImageVisible, setDelmuImageVisible] = useState(false)
  const delmuSweepControls = useAnimationControls()
  const [delmuExpanded, setDelmuExpanded] = useState(false)
  const [isFloating, setIsFloating] = useState(false)
  const [isDelmuFullscreen, setIsDelmuFullscreen] = useState(false)
  const [showAnchor, setShowAnchor] = useState<"X" | "WaveBox" | "Booth" | null>(null)
  const [activeExpandedStat, setActiveExpandedStat] = useState<"X" | "WaveBox" | "Booth" | null>(null)
  const [randomCorner1, setRandomCorner1] = useState<number | null>(null)
  const [randomCorner2, setRandomCorner2] = useState<number | null>(null)
  const [randomImage1, setRandomImage1] = useState<string | null>(null)
  const [randomImage2, setRandomImage2] = useState<string | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [closingAnimation, setClosingAnimation] = useState<{
    x: number; y: number; scale: number
  } | null>(null)
  const fullscreenTimeoutRef = useRef<any>(null)
  const closingTimeoutRef = useRef<any>(null)
  
  // Motion values for cursor follower - no re-renders on mouse move
  const mouseXMotion = useMotionValue(0)
  const mouseYMotion = useMotionValue(0)



  const sequenceTriggeredRef = useRef(false)

  // Drives the timeline logic using virtualTimeRef (synced with actual audio currentTime or virtual clock)
  const processTimeline = (time: number) => {
    const triggered = timelineTriggeredRef.current
    const isMobileDevice = typeof window !== "undefined" && window.innerWidth < 768
    const zoomScale = isMobileDevice ? 1.55 : 2.2
    const panOffset = isMobileDevice ? 32 : 60

    // Helper to convert vw/vh to absolute pixels for high-performance GPU compositing
    const getPixelCoordinates = (xVw: number, yVh: number) => {
      if (typeof window === "undefined") return { x: 0, y: 0 }
      return {
        x: (window.innerWidth * xVw) / 100,
        y: (window.innerHeight * yVh) / 100
      }
    }

    // Set camera initially to centered normal view at start
    if (time >= 0 && !triggered.initCam) {
      triggered.initCam = true
      cameraControls.set({ scale: 1, x: 0, y: 0 })
      bgControls.set({ scale: 1, x: 0, y: 0 })
    }

    // Obj 1 & Camera 1 (Bottom-Left)
    if (time >= 0.23 && !triggered.cam1) {
      triggered.cam1 = true
      const cam = getPixelCoordinates(panOffset, -panOffset)
      const bg = getPixelCoordinates(panOffset / 10, -panOffset / 10)
      cameraControls.start({
        scale: zoomScale,
        x: cam.x,
        y: cam.y,
        transition: { duration: 0.28, ease: "easeOut" }
      })
      bgControls.start({
        scale: 1.05,
        x: bg.x,
        y: bg.y,
        transition: { duration: 0.28, ease: "easeOut" }
      })
    }
    if (time >= 0.31 && !triggered.obj1) {
      triggered.obj1 = true
      setShowObj1(true)
    }

    // Obj 2 & Camera 2 (Bottom-Right)
    if (time >= 0.51 && !triggered.cam2) {
      triggered.cam2 = true
      const cam = getPixelCoordinates(-panOffset, -panOffset)
      const bg = getPixelCoordinates(-panOffset / 10, -panOffset / 10)
      cameraControls.start({
        x: cam.x,
        y: cam.y,
        scale: zoomScale,
        transition: { duration: 0.32, ease: "easeInOut" }
      })
      bgControls.start({
        x: bg.x,
        y: bg.y,
        scale: 1.05,
        transition: { duration: 0.32, ease: "easeInOut" }
      })
    }
    if (time >= 0.59 && !triggered.obj2) {
      triggered.obj2 = true
      setShowObj2(true)
    }

    // Obj 3 & Camera 3 (Top-Left)
    if (time >= 0.83 && !triggered.cam3) {
      triggered.cam3 = true
      const cam = getPixelCoordinates(panOffset, panOffset)
      const bg = getPixelCoordinates(panOffset / 10, panOffset / 10)
      cameraControls.start({
        x: cam.x,
        y: cam.y,
        scale: zoomScale,
        transition: { duration: 0.32, ease: "easeInOut" }
      })
      bgControls.start({
        x: bg.x,
        y: bg.y,
        scale: 1.05,
        transition: { duration: 0.32, ease: "easeInOut" }
      })
    }
    if (time >= 0.91 && !triggered.obj3) {
      triggered.obj3 = true
      setShowObj3(true)
    }

    // Obj 4 & Camera 4 (Top-Right)
    if (time >= 1.15 && !triggered.cam4) {
      triggered.cam4 = true
      const cam = getPixelCoordinates(-panOffset, panOffset)
      const bg = getPixelCoordinates(-panOffset / 10, panOffset / 10)
      cameraControls.start({
        x: cam.x,
        y: cam.y,
        scale: zoomScale,
        transition: { duration: 0.32, ease: "easeInOut" }
      })
      bgControls.start({
        x: bg.x,
        y: bg.y,
        scale: 1.05,
        transition: { duration: 0.32, ease: "easeInOut" }
      })
    }
    if (time >= 1.23 && !triggered.obj4) {
      triggered.obj4 = true
      setShowObj4(true)
    }

    // Zoom back out & start White Strip (Vertical)
    if (time >= 1.78 && !triggered.cam5) {
      triggered.cam5 = true
      cameraControls.start({
        x: 0,
        y: 0,
        scale: 1,
        transition: { duration: 0.65, ease: [0.25, 1, 0.5, 1] }
      })
      bgControls.start({
        x: 0,
        y: 0,
        scale: 1,
        transition: { duration: 0.65, ease: [0.25, 1, 0.5, 1] }
      })

      setShowWhiteStrip(true)
      setStripPhase("vertical")
    }

    // White Strip Full
    if (time >= 1.83 && !triggered.stripFull) {
      triggered.stripFull = true
      setStripPhase("full")
    }

    // Reveal Profile Card & Split Horizontally
    if (time >= 2.18 && !triggered.cardReveal) {
      triggered.cardReveal = true
      setShowProfileCard(true)
      setStripPhase("horizontal")
    }

    // Complete Strip Phase & Character Name Entrance
    if (time >= 2.53 && !triggered.stripDone) {
      triggered.stripDone = true
      setStripPhase("done")
      setShowWhiteStrip(false)
      window.dispatchEvent(new CustomEvent("startNameAnimation"))

      // Slide up from bottom-center to below social SVG icons (when camera is fully centered)
      setShowPlaylistButton(true)
      setHudPositionState("centerUp")
    }

    // Hide Chibis
    if (time >= 3.13 && !triggered.chibisHide) {
      triggered.chibisHide = true
      setShowObj1(false)
      setShowObj2(false)
      setShowObj3(false)
      setShowObj4(false)
      
      // Move Vinyl HUD player to bottom-left corner
      setHudPositionState("corner")
      timelineLoopActiveRef.current = false
    }
  }

  // Animation frame loop driving timeline via virtualTimeRef (as a fallback or lockstep clock)
  const startTimelineLoop = () => {
    if (timelineLoopActiveRef.current) return
    timelineLoopActiveRef.current = true
    lastFrameTimeRef.current = performance.now()

    const tick = (now: number) => {
      if (!timelineLoopActiveRef.current) return

      const delta = (now - (lastFrameTimeRef.current ?? now)) / 1000
      lastFrameTimeRef.current = now

      // Increment virtual time by delta
      virtualTimeRef.current += delta

      // Execute timeline tick checks
      processTimeline(virtualTimeRef.current)

      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  const triggerRevealSequence = () => {
    if (sequenceTriggeredRef.current) return
    sequenceTriggeredRef.current = true

    setShowMusicPlayer(true)
    startTimelineLoop()
  }

  // Initialize website and audio when user enters from splash screen
  const handleSplashEnter = () => {
    setShowSplash(false)
    showSplashRef.current = false
    
    // Audio is already pre-unlocked and playing since click, but we dispatch a fail-safe event.
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.__audioUnlockRequested = true
      window.dispatchEvent(new CustomEvent("unlockAudio"))
    } catch (_) {}

    // If the music has already started playing, trigger the reveal sequence immediately!
    if (musicStartedRef.current) {
      triggerRevealSequence()
    }

    // FAIL-SAFE BACKUP TIMER:
    // If the musicStarted event doesn't fire within 1.0s (due to browser audio block or slow load),
    // trigger the reveal sequence anyway so the page doesn't get stuck on a blank screen.
    setTimeout(() => {
      triggerRevealSequence()
    }, 1000)
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

  // Preload all critical visual assets while the user is on the splash screen
  useEffect(() => {
    if (typeof window !== "undefined") {
      const assetsToPreload = [
        "/img website/obj 1.png",
        "/img website/obj 2.png",
        "/img website/obj 3.png",
        "/img website/obj 4.png",
        "/img website/@_Delmu.png",
        "/img website/WaveBox @_Delmu.png",
        "/img website/Booth @_Delmu.png",
        "/img website/x.png",
        "/img website/Wavebox.png",
      ]
      assetsToPreload.forEach((src) => {
        const img = new window.Image()
        img.src = src
      })
    }
  }, [])

  useEffect(() => {
    const onMusicStarted = () => {
      musicStartedRef.current = true
      // Only trigger if splash screen has finished exiting (otherwise handleSplashEnter will trigger it)
      if (!showSplashRef.current) {
        triggerRevealSequence()
      }
    }
    window.addEventListener("musicStarted", onMusicStarted)
    return () => window.removeEventListener("musicStarted", onMusicStarted)
  }, [])

  useEffect(() => {
    const handleTimeUpdate = (e: Event) => {
      const audioTime = (e as CustomEvent<{ currentTime: number }>).detail.currentTime
      
      // Update virtualTime to stay completely locked to actual audio currentTime
      virtualTimeRef.current = audioTime
      lastFrameTimeRef.current = performance.now()
      
      // Make sure the timeline loop is active if music is actively running
      if (sequenceTriggeredRef.current) {
        startTimelineLoop()
      }
    }
    
    window.addEventListener("audioTimeUpdate", handleTimeUpdate)
    return () => {
      window.removeEventListener("audioTimeUpdate", handleTimeUpdate)
      timelineLoopActiveRef.current = false
    }
  }, [])

  useEffect(() => {
    const handleVisualizer = (e: Event) => {
      const { values } = (e as CustomEvent<{ values: number[] }>).detail
      // Multipliers for the 4 kept mid-to-high channels
      const multipliers = [1.25, 1.4, 1.6, 1.9]
      const prev = lastVisualizerValues.current
      
      const nextValues = values.map((val, i) => {
        // Use a power of 1.4 to increase contrast (dynamic range) between loud and quiet signals
        const amplified = Math.pow(val, 1.4) * (multipliers[i] ?? 1.5)
        // LERP: smooth transition (75% previous + 25% new target) to eliminate high-frequency jitter
        const smoothed = prev[i] * 0.75 + amplified * 0.25
        // Clamp between minimum scale 0.15 and maximum scale 1.0 (fits perfectly inside container)
        return Math.min(1.0, Math.max(0.15, smoothed))
      })
      
      lastVisualizerValues.current = nextValues
      
      for (let i = 0; i < 4; i++) {
        const bar = visBarsRef.current[i]
        if (bar) {
          bar.style.transform = `scaleY(${nextValues[i]})`
        }
      }
    }
    
    window.addEventListener("musicVisualizer", handleVisualizer)
    return () => {
      window.removeEventListener("musicVisualizer", handleVisualizer)
    }
  }, [])

  useEffect(() => {
    const onProfileAnimationComplete = () => {
      setProfileAnimationComplete(true)
      
      // Show music player after profile animation completes
      setTimeout(() => {
        setShowMusicPlayer(true)
      }, 100)
    }

    window.addEventListener("profileAnimationComplete", onProfileAnimationComplete)
    return () => window.removeEventListener("profileAnimationComplete", onProfileAnimationComplete)
  }, [])

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

    const handleDelmuClick = () => {
      if (fullscreenTimeoutRef.current) {
        clearTimeout(fullscreenTimeoutRef.current)
      }
      if (closingTimeoutRef.current) {
        clearTimeout(closingTimeoutRef.current)
        closingTimeoutRef.current = null
      }
      setDelmuExpanded(true)
      setActiveExpandedStat("X")
      setIsDelmuFullscreen(false)
      setShowAnchor(null)
      
      const shuffledImages = [...OBJ_POOL].sort(() => 0.5 - Math.random())
      const img1 = shuffledImages[0]
      const img2 = shuffledImages[1]
      const c1 = Math.floor(Math.random() * 4)
      const c2 = (c1 + 2) % 4
      
      setRandomCorner1(c1)
      setRandomImage1(img1)
      setRandomCorner2(c2)
      setRandomImage2(img2)
    }

    const handleWaveboxClick = () => {
      if (fullscreenTimeoutRef.current) {
        clearTimeout(fullscreenTimeoutRef.current)
      }
      if (closingTimeoutRef.current) {
        clearTimeout(closingTimeoutRef.current)
        closingTimeoutRef.current = null
      }
      setDelmuExpanded(true)
      setActiveExpandedStat("WaveBox")
      setIsDelmuFullscreen(false)
      setShowAnchor(null)
      
      const shuffledImages = [...OBJ_POOL].sort(() => 0.5 - Math.random())
      const img1 = shuffledImages[0]
      const img2 = shuffledImages[1]
      const c1 = Math.floor(Math.random() * 4)
      const c2 = (c1 + 2) % 4
      
      setRandomCorner1(c1)
      setRandomImage1(img1)
      setRandomCorner2(c2)
      setRandomImage2(img2)
    }

    const handleBoothClick = () => {
      if (fullscreenTimeoutRef.current) {
        clearTimeout(fullscreenTimeoutRef.current)
      }
      if (closingTimeoutRef.current) {
        clearTimeout(closingTimeoutRef.current)
        closingTimeoutRef.current = null
      }
      setDelmuExpanded(true)
      setActiveExpandedStat("Booth")
      setIsDelmuFullscreen(false)
      setShowAnchor(null)
      
      const shuffledImages = [...OBJ_POOL].sort(() => 0.5 - Math.random())
      const img1 = shuffledImages[0]
      const img2 = shuffledImages[1]
      const c1 = Math.floor(Math.random() * 4)
      const c2 = (c1 + 2) % 4
      
      setRandomCorner1(c1)
      setRandomImage1(img1)
      setRandomCorner2(c2)
      setRandomImage2(img2)
    }

    window.addEventListener("statHover", handleStatHover)
    window.addEventListener("closeButtonHover", handleCloseButtonHover)
    window.addEventListener("trackChange", handleTrackChange)
    window.addEventListener("nowPlayingHover", handleNowPlayingHover)
    window.addEventListener("playlistButtonHover", handlePlaylistButtonHover)
    window.addEventListener("rectangleHover", handleRectangleHover)
    window.addEventListener("thumbnailHover", handleThumbnailHover)
    window.addEventListener("delmuClick", handleDelmuClick)
    window.addEventListener("waveboxClick", handleWaveboxClick)
    window.addEventListener("boothClick", handleBoothClick)
    return () => {
      window.removeEventListener("statHover", handleStatHover)
      window.removeEventListener("closeButtonHover", handleCloseButtonHover)
      window.removeEventListener("trackChange", handleTrackChange)
      window.removeEventListener("nowPlayingHover", handleNowPlayingHover)
      window.removeEventListener("playlistButtonHover", handlePlaylistButtonHover)
      window.removeEventListener("rectangleHover", handleRectangleHover)
      window.removeEventListener("thumbnailHover", handleThumbnailHover)
      window.removeEventListener("delmuClick", handleDelmuClick)
      window.removeEventListener("waveboxClick", handleWaveboxClick)
      window.removeEventListener("boothClick", handleBoothClick)
    }
  }, [])

  // Measure tooltip text width using ResizeObserver - reacts to any size change
  useEffect(() => {
    if (!tooltipTextRef.current || !hoveredStatLabel) return

    const resizeObserver = new ResizeObserver(() => {
      const width = tooltipTextRef.current?.offsetWidth
      if (width && width > 0) {
        setTooltipWidth(width + 24)
      }
    })

    resizeObserver.observe(tooltipTextRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [hoveredStatLabel])

  // Manage transition from fullscreen to floating
  useEffect(() => {
    if (delmuExpanded && !isDelmuFullscreen) {
      const timer = setTimeout(() => {
        setIsFloating(true)
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setIsFloating(false)
    }
  }, [delmuExpanded, isDelmuFullscreen])

  // Animation for the hover image sweep
  useEffect(() => {
    if ((isDelmuHovered || isWaveBoxHovered || isBoothHovered) && !isClosing && !delmuExpanded) {
      const runSweep = async () => {
        setDelmuImageVisible(false)
        await delmuSweepControls.set({ x: "-100%" })
        await delmuSweepControls.start({
          x: "0%",
          transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] }
        })
        setDelmuImageVisible(true)
        await delmuSweepControls.start({
          x: "100%",
          transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] }
        })
      }
      runSweep()
    } else {
      setDelmuImageVisible(false)
    }
  }, [isDelmuHovered, isWaveBoxHovered, isBoothHovered, isClosing, delmuExpanded, delmuSweepControls])


  return (
    <>
      {/* Splash Screen - Rendered statically to prevent layout unmount reflows */}
      <SplashScreen onEnter={handleSplashEnter} show={showSplash} />

      {/* Mouse Following White Rectangle - Optimized with MotionValues */}
      <motion.div
        className="fixed flex items-center justify-center border-[3px] border-[#5c3d2e]"
        style={{
          top: 0,
          left: 0,
          backgroundColor: "#fffcf7",
          zIndex: 10000,
          x: mouseXMotion,
          y: mouseYMotion,
          height: 32,
          pointerEvents: (hoveredStatLabel && !isDelmuHovered && !isWaveBoxHovered && !isBoothHovered) ? "auto" : "none",
          cursor: "pointer",
          boxShadow: "inset 0 0 0 1px #d4af37, 0 4px 10px rgba(92, 61, 46, 0.2)",
          borderRadius: 0,
          clipPath: pixelClipPath(3),
          overflow: "hidden",
        }}
        onMouseEnter={() => window.dispatchEvent(new CustomEvent("rectangleHover", { detail: { label: "Wana see it?" } }))}
        onMouseLeave={() => window.dispatchEvent(new CustomEvent("rectangleHover", { detail: { label: null } }))}
        animate={{
          width: (hoveredStatLabel && !isDelmuHovered && !isWaveBoxHovered && !isBoothHovered) ? Math.max(76, tooltipWidth) : 0,
          opacity: (hoveredStatLabel && !isDelmuHovered && !isWaveBoxHovered && !isBoothHovered) ? 1 : 0,
        }}
        transition={{
          width: { type: "tween", duration: 0.3, ease: "easeOut" },
          opacity: { type: "tween", duration: 0.2 }
        }}
      >
        <AnimatePresence mode="wait">
          {hoveredStatLabel && !isDelmuHovered && !isWaveBoxHovered && !isBoothHovered && (
            <motion.span
              ref={tooltipTextRef}
              className="text-xs font-bold text-[#5c3d2e] whitespace-nowrap px-3"
              style={{
                fontFamily: "'DotGothic16', 'Press Start 2P', monospace",
              }}
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

      {/* Mouse Following Image Preview for @_Delmu, WaveBox & Booth */}
      <AnimatePresence>
        {(isDelmuHovered || isWaveBoxHovered || isBoothHovered) && !delmuExpanded && !isClosing && (
          <motion.div
            layoutId="delmu-image-card"
            className="fixed z-[100] pointer-events-none overflow-hidden border-[12px] border-[#5c3d2e] bg-[#fffcf7]/95"
            style={{
              top: 0,
              left: 0,
              x: mouseXMotion,
              y: mouseYMotion,
              width: 325,
              height: 300,
              borderRadius: 0,
              clipPath: pixelClipPath(6),
              boxShadow: "inset 0 0 0 2px #d4af37, inset 0 0 10px rgba(0,0,0,0.3)",
              filter: "drop-shadow(0 8px 20px rgba(92, 61, 46, 0.35)) drop-shadow(0 2px 4px rgba(92, 61, 46, 0.25))",
            }}
            initial={{ opacity: 0, scale: 0.2, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{
              opacity: 0,
              scale: 0.2,
              rotate: 4,
              transition: { duration: 0.22, ease: "easeIn" }
            }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Pixel frame decorations */}
            <PixelFrameCorners size={10} inset={1} />
            {/* The Image */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: delmuImageVisible ? 1 : 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Image
                src={isDelmuHovered ? "/img website/@_Delmu.png" : isWaveBoxHovered ? "/img website/WaveBox @_Delmu.png" : "/img website/Booth @_Delmu.png"}
                alt="Profile Preview"
                fill
                className="object-cover"
                unoptimized
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded @_Delmu Image with floating sea-surface effect */}
      <AnimatePresence>
        {delmuExpanded && (
          <motion.div
            key="expanded-modal-wrapper"
            initial={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-[9998] pointer-events-none"
          >
            {/* Backdrop Blur Overlay */}
            <motion.div
              key="expanded-backdrop"
              className={`fixed inset-0 cursor-pointer ${isClosing ? "pointer-events-none" : "pointer-events-auto"}`}
              initial={{
                backgroundColor: "rgba(0, 0, 0, 0)",
                backdropFilter: "blur(0px)",
              }}
              animate={{
                backgroundColor: isClosing ? "rgba(0, 0, 0, 0)" : (isDelmuFullscreen ? "#202020" : "rgba(0, 0, 0, 0.35)"),
                backdropFilter: isClosing ? "blur(0px)" : (isDelmuFullscreen ? "blur(0px)" : "blur(8px)"),
              }}
              exit={{
                backgroundColor: "rgba(0, 0, 0, 0)",
                backdropFilter: "blur(0px)",
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              onClick={() => {
                if (fullscreenTimeoutRef.current) {
                  clearTimeout(fullscreenTimeoutRef.current)
                }
                const iconEl = document.querySelector(`[data-icon-id="${activeExpandedStat}"]`)
                if (iconEl) {
                  const iconRect = iconEl.getBoundingClientRect()
                  const cardCenterX = window.innerWidth / 2
                  const cardCenterY = window.innerHeight / 2
                  const iconCenterX = iconRect.left + iconRect.width / 2
                  const iconCenterY = iconRect.top + iconRect.height / 2
                  setClosingAnimation({
                    x: iconCenterX - cardCenterX,
                    y: iconCenterY - cardCenterY,
                    scale: Math.max(iconRect.width / (isMobile ? window.innerWidth * 0.9 : 500), 0.04),
                  })
                } else {
                  setClosingAnimation({ x: 0, y: 0, scale: 0.04 })
                }
                setIsClosing(true)
                setIsDelmuFullscreen(false)
                setHoveredStatLabel(null)
                setIsFloating(false)
              }}
            />

            {/* Screen Corner Ornaments */}
            <motion.div
              key="expanded-ornaments"
              className="fixed inset-0 pointer-events-none z-[9999]"
              animate={{ opacity: (isDelmuFullscreen || isClosing) ? 0 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {randomCorner1 !== null && randomImage1 !== null && (
                <CornerOrnament
                  key={`obj1-${randomCorner1}-${randomImage1}`}
                  corner={randomCorner1}
                  src={randomImage1}
                />
              )}

              {randomCorner2 !== null && randomImage2 !== null && (
                <CornerOrnament
                  key={`obj2-${randomCorner2}-${randomImage2}`}
                  corner={randomCorner2}
                  src={randomImage2}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Card */}
      <AnimatePresence>
        {delmuExpanded && (
            <motion.div
              key="expanded-card"
              layoutId="delmu-image-card"
              className={`fixed bg-[#fffcf7] cursor-pointer z-[9999] ${isClosing ? "pointer-events-none" : "pointer-events-auto"}`}
              style={{
                width: isDelmuFullscreen ? "100vw" : (isMobile ? "90vw" : 500),
                height: isDelmuFullscreen ? "100vh" : (isMobile ? "calc(90vw * 0.92)" : 460),
                borderRadius: 0,
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                margin: "auto",
                clipPath: isDelmuFullscreen ? 'none' : pixelClipPath(isMobile ? 4 : 7),
              }}
              onClick={(e) => {
                e.stopPropagation()
                if (isClosing) return
                setIsDelmuFullscreen(true)
                if (fullscreenTimeoutRef.current) {
                  clearTimeout(fullscreenTimeoutRef.current)
                }
                fullscreenTimeoutRef.current = setTimeout(() => {
                  if (activeExpandedStat === "X") {
                    window.open("https://x.com/_Delmu", "_blank")
                  } else if (activeExpandedStat === "WaveBox") {
                    window.open("https://wavebox.me/wave/89r0pcgrxy2r1r8p/", "_blank")
                  } else if (activeExpandedStat === "Booth") {
                    window.open("https://delmu.booth.pm/", "_blank")
                  }
                  setIsDelmuFullscreen(false)
                }, 1000)
              }}
              onMouseEnter={() => {
                if (!isClosing) {
                  const label = "open it?"
                  window.dispatchEvent(new CustomEvent("rectangleHover", { detail: { label } }))
                }
              }}
              onMouseLeave={() => window.dispatchEvent(new CustomEvent("rectangleHover", { detail: { label: null } }))}
              animate={closingAnimation ? {
                x: closingAnimation.x,
                y: closingAnimation.y,
                scale: closingAnimation.scale,
                opacity: 0,
                borderWidth: "0px",
                borderColor: "rgba(255,255,255,0)",
                boxShadow: "none",
                rotate: 0,
              } : isDelmuFullscreen ? {
                borderWidth: "0px",
                borderColor: "rgba(255,255,255,0)",
                boxShadow: "none",
                y: 0,
                rotate: 0,
              } : (isFloating ? {
                borderWidth: isMobile ? "8px" : "14px",
                borderColor: "#5c3d2e",
                boxShadow: "inset 0 0 0 3px #d4af37, inset 0 0 15px rgba(0, 0, 0, 0.3)",
                filter: "drop-shadow(0 12px 30px rgba(92, 61, 46, 0.4)) drop-shadow(0 4px 6px rgba(92, 61, 46, 0.25))",
                y: [0, -12, 4, -8, 2, 0],
                rotate: [0, 1.2, -0.6, -1.2, 0.6, 0],
              } : {
                borderWidth: isMobile ? "8px" : "14px",
                borderColor: "#5c3d2e",
                boxShadow: "inset 0 0 0 3px #d4af37, inset 0 0 15px rgba(0, 0, 0, 0.3)",
                filter: "drop-shadow(0 12px 30px rgba(92, 61, 46, 0.4)) drop-shadow(0 4px 6px rgba(92, 61, 46, 0.25))",
                y: 0,
                rotate: 0,
              })}
              transition={closingAnimation ? {
                duration: 0.45,
                ease: "easeInOut",
              } : isFloating ? {
                y: { repeat: Infinity, duration: 8, ease: "easeInOut" },
                rotate: { repeat: Infinity, duration: 9, ease: "easeInOut" },
                borderWidth: { duration: 0.3 },
                borderColor: { duration: 0.3 },
                boxShadow: { duration: 0.3 },
                layout: { duration: 0.45, ease: [0.25, 1, 0.5, 1] }
              } : {
                borderWidth: { duration: 0.3 },
                borderColor: { duration: 0.3 },
                boxShadow: { duration: 0.3 },
                layout: { duration: 0.45, ease: [0.25, 1, 0.5, 1] }
              }}
              onAnimationComplete={() => {
                if (closingAnimation) {
                  setDelmuExpanded(false)
                  setClosingAnimation(null)
                  setIsClosing(false)
                  setShowAnchor(null)
                  setRandomCorner1(null)
                  setRandomCorner2(null)
                  setRandomImage1(null)
                  setRandomImage2(null)
                }
              }}
            >
               <PixelFrameCorners size={isMobile ? 8 : 14} inset={1} visible={!isDelmuFullscreen && !closingAnimation} />
               <PixelFrameFlowers flowerSize={isMobile ? 12 : 20} visible={!isDelmuFullscreen && !closingAnimation} />
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute inset-0"
                  animate={{ opacity: isDelmuFullscreen ? 0 : 1 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  <Image
                    src={activeExpandedStat === "X" ? "/img website/@_Delmu.png" : activeExpandedStat === "WaveBox" ? "/img website/WaveBox @_Delmu.png" : "/img website/Booth @_Delmu.png"}
                    alt="Profile Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </motion.div>
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isDelmuFullscreen ? 1 : 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  <Image
                    src={activeExpandedStat === "X" ? "/img website/x.png" : activeExpandedStat === "WaveBox" ? "/img website/Wavebox.png" : "/img website/Booth @_Delmu.png"}
                    alt="Overlay Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </motion.div>
              </div>
              <button
                className="absolute top-3 right-3 sm:top-5 sm:right-5 z-30 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center cursor-pointer border-0 p-0 group"
                style={{ background: 'none' }}
                onClick={(e) => {
                  e.stopPropagation()
                  if (fullscreenTimeoutRef.current) {
                    clearTimeout(fullscreenTimeoutRef.current)
                  }
                  const iconEl = document.querySelector(`[data-icon-id="${activeExpandedStat}"]`)
                  if (iconEl) {
                    const iconRect = iconEl.getBoundingClientRect()
                    const cardCenterX = window.innerWidth / 2
                    const cardCenterY = window.innerHeight / 2
                    const iconCenterX = iconRect.left + iconRect.width / 2
                    const iconCenterY = iconRect.top + iconRect.height / 2
                    setClosingAnimation({
                      x: iconCenterX - cardCenterX,
                      y: iconCenterY - cardCenterY,
                      scale: Math.max(iconRect.width / (isMobile ? window.innerWidth * 0.9 : 500), 0.04),
                    })
                  } else {
                    setClosingAnimation({ x: 0, y: 0, scale: 0.04 })
                  }
                  setIsClosing(true)
                  setIsDelmuFullscreen(false)
                  setHoveredStatLabel(null)
                  setIsFloating(false)
                }}
              >
                <svg viewBox="0 0 9 9" shapeRendering="crispEdges" className="w-full h-full transition-transform group-hover:scale-110" style={{ filter: "drop-shadow(1px 1px 0 rgba(92, 61, 46, 0.5))" }}>
                  <rect x="1" y="0" width="7" height="1" fill="#5c3d2e"/>
                  <rect x="0" y="1" width="9" height="7" fill="#5c3d2e"/>
                  <rect x="1" y="8" width="7" height="1" fill="#5c3d2e"/>
                  <rect x="1" y="1" width="7" height="7" fill="#8b6b4a"/>
                  <rect x="2" y="2" width="1" height="1" fill="#fffcf7"/>
                  <rect x="6" y="2" width="1" height="1" fill="#fffcf7"/>
                  <rect x="3" y="3" width="1" height="1" fill="#fffcf7"/>
                  <rect x="5" y="3" width="1" height="1" fill="#fffcf7"/>
                  <rect x="4" y="4" width="1" height="1" fill="#fffcf7"/>
                  <rect x="3" y="5" width="1" height="1" fill="#fffcf7"/>
                  <rect x="5" y="5" width="1" height="1" fill="#fffcf7"/>
                  <rect x="2" y="6" width="1" height="1" fill="#fffcf7"/>
                  <rect x="6" y="6" width="1" height="1" fill="#fffcf7"/>
                </svg>
              </button>
            </motion.div>
        )}
      </AnimatePresence>

      <main className="relative min-h-screen overflow-hidden w-screen bg-[#d9a75d]">
        <CyberBackground animate={bgControls} />
        <motion.div 
          animate={cameraControls} 
          className="w-full min-h-screen relative" 
          style={{ 
            transformOrigin: "center center",
            pointerEvents: profileAnimationComplete ? "auto" : "none",
            willChange: "transform",
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
          }}
        >
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
          <AnimatePresence>
            {showProfileCard && (
              <div className="flex items-start justify-center relative -mt-20">
                <div className="w-full max-w-3xl space-y-4 relative flex-shrink-0">
                  <motion.div style={{ transformOrigin: "center center", willChange: "transform, opacity" }} initial={{ opacity: 0, scale: 0.75 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}>
                    <ProfileCard showWhiteStrip={showWhiteStrip} stripPhase={stripPhase} />
                  </motion.div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          <CornerOrnament 
            corner={3} 
            src="/img website/obj 1.png" 
            visible={!showSplash && showObj1}
            customTransition={{ type: "tween", duration: 0.22, ease: "easeOut" }} 
          />
          <CornerOrnament 
            corner={2} 
            src="/img website/obj 2.png" 
            visible={!showSplash && showObj2}
            customTransition={{ type: "tween", duration: 0.5, ease: "easeOut" }} 
          />
          <CornerOrnament 
            corner={0} 
            src="/img website/obj 3.png" 
            visible={!showSplash && showObj3}
            customTransition={{ type: "tween", duration: 0.5, ease: "easeOut" }} 
          />
          <CornerOrnament 
            corner={1} 
            src="/img website/obj 4.png" 
            visible={!showSplash && showObj4}
            customTransition={{ type: "tween", duration: 0.5, ease: "easeOut" }} 
          />
        </div>
      </motion.div>

      {/* Bottom-Left Music HUD Bar */}
      <AnimatePresence>
        {showPlaylistButton && (
          <motion.div
            variants={{
              initial: {
                left: "50%",
                top: "100%",
                x: "-50%",
                y: "0px",
                opacity: 0,
                scale: 0.95
              },
              centerUp: {
                left: "50%",
                top: "50%",
                x: "-50%",
                y: isMobile ? "142px" : "155px",
                opacity: 1,
                scale: isMobile ? 0.9 : 1,
                transition: {
                  duration: 0.65,
                  ease: [0.25, 1, 0.5, 1]
                }
              },
              corner: {
                left: isMobile ? "50%" : "24px",
                top: isMobile ? "calc(100vh - 72px)" : "calc(100vh - 82px)",
                x: isMobile ? "-50%" : "0%",
                y: "0px",
                opacity: 1,
                scale: isMobile ? 0.9 : 1,
                transition: {
                  duration: 0.8,
                  ease: [0.25, 1, 0.5, 1]
                }
              }
            }}
            initial="initial"
            animate={hudPositionState}
            exit="initial"
            className="fixed z-[40] flex items-center border-[3px] border-[#5c3d2e] select-none pointer-events-none"
            style={{
              height: 58,
              width: 260,
              background: "linear-gradient(135deg, #fffdfb 0%, #f5e8cf 100%)",
              boxShadow: "inset 0 0 0 1px #d4af37, 0 6px 0px rgba(92, 61, 46, 0.45)",
              clipPath: pixelClipPath(4),
            }}
          >
            <div className="flex items-center gap-3 px-3 py-1 flex-1 min-w-0 h-full relative">
              {/* Spinning Vinyl Record and Tonearm Container */}
              <div className="relative w-11 h-11 flex-shrink-0 flex items-center justify-center">
                {/* Spinning Vinyl Disc */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  className="w-10 h-10 rounded-full bg-[#302217] flex items-center justify-center relative border-2 border-[#5c3d2e] shadow-inner"
                >
                  {/* Concentric Groove Lines */}
                  <div className="absolute inset-1 rounded-full border border-[#5c3d2e]/30" />
                  <div className="absolute inset-2 rounded-full border border-dashed border-[#b58c5a]/40" />
                  {/* Center Sticker */}
                  <div className="w-3.5 h-3.5 rounded-full bg-[#ffd27d] border border-[#5c3d2e] flex items-center justify-center">
                    {/* Spindle hole */}
                    <div className="w-1 h-1 rounded-full bg-[#302217]" />
                  </div>
                </motion.div>
                
                {/* Tonearm/Stylus resting on Vinyl */}
                <motion.div 
                  animate={{ rotate: [0, -2, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute top-0.5 right-0.5 w-5 h-5 origin-top-right pointer-events-none"
                >
                  <svg viewBox="0 0 10 10" className="w-full h-full fill-none stroke-[#5c3d2e] stroke-[1.5] shape-rendering-crisp-edges">
                    {/* Spindle pivot */}
                    <circle cx="8" cy="2" r="1.2" fill="#5c3d2e" stroke="none" />
                    {/* Arm curve */}
                    <path d="M8,2 C7,4 6,4 4,6 L2.5,6" />
                    {/* Cartridge needle head */}
                    <rect x="1" y="5" width="1.5" height="2" fill="#b58c5a" stroke="#5c3d2e" strokeWidth="0.5" />
                  </svg>
                </motion.div>
              </div>

              {/* Scrolling/Truncated Track text */}
              <div className="flex flex-col min-w-0 flex-1 justify-center" style={{ fontFamily: "var(--font-pixel), monospace" }}>
                <div className="flex items-center gap-1.5 leading-none mb-[2px]">
                  {/* Static Music Note Icon */}
                  <span className="text-[9px] text-[#d95d5d] leading-none">
                    ♫
                  </span>
                  <span className="text-[7.5px] uppercase tracking-wider text-[#b58c5a] font-bold">
                    SPINNING
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#5c3d2e] truncate leading-tight">
                  {currentTrackTitle}
                </span>
              </div>

              {/* Mini Audio Equalizer Visualizer */}
              <div className="flex-shrink-0 flex items-end gap-[2.5px] h-4 px-1 pb-1">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    ref={(el) => { if (el) visBarsRef.current[idx] = el }}
                    className={`w-[3px] h-full origin-bottom ${idx % 2 === 0 ? "bg-[#5c3d2e]" : "bg-[#b58c5a]"}`}
                    style={{ transform: "scaleY(0.15)" }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden">
        <MusicPlayer isVisible={false} />
      </div>
    </main>
    </>
  )
}
