"use client"

import { useState, useEffect, useRef, useLayoutEffect } from "react"
import { motion, AnimatePresence, useAnimationControls, useMotionValue } from "framer-motion"
import Image from "next/image"
import { ProfileCard } from "@/components/profile-card"
import { DraggableMusicPlayer } from "@/components/draggable-music-player"
import { CyberBackground } from "@/components/cyber-background"
import { SplashScreen } from "@/components/splash-screen"
import { ANIMATION_CONFIG } from "@/lib/constants"

const getCornerClassName = (corner: number) => {
  switch (corner) {
    case 0: return "absolute top-[-80px] left-[-80px] w-[400px] h-[400px]"
    case 1: return "absolute top-[-80px] right-[-80px] w-[400px] h-[400px]"
    case 2: return "absolute bottom-[-80px] right-[-80px] w-[400px] h-[400px]"
    case 3: return "absolute bottom-[-80px] left-[-80px] w-[400px] h-[400px]"
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
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  return (
    <motion.div
      className={getCornerClassName(corner)}
      variants={getCornerVariants(corner)}
      initial="hidden"
      animate={visible ? "visible" : "hidden"}
      transition={customTransition}
    >
      {!error && (
        <img
          src={src}
          alt=""
          loading="eager"
          decoding="async"
          className="w-full h-full object-contain transition-opacity duration-200"
          style={{ opacity: loaded ? 1 : 0 }}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          ref={(el: HTMLImageElement | null) => {
            if (el) {
              if (el.complete) {
                if (el.naturalWidth > 0) {
                  setLoaded(true)
                } else {
                  setError(true)
                }
              }
            }
          }}
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

  const triggerRevealSequence = () => {
    if (sequenceTriggeredRef.current) return
    sequenceTriggeredRef.current = true

    setShowMusicPlayer(true)

    // start vertical-to-full white strip 1.55s after trigger/music starts
    setTimeout(() => {
      setShowWhiteStrip(true)
      setStripPhase("vertical")
    }, 1550)

    // Fills vertically (takes 280ms, completes at 1880ms)
    setTimeout(() => setStripPhase("full"), 1600)

    // Splits horizontally (takes 280ms, completes at 2230ms)
    // Reveal profile card at the exact start of horizontal split so it reveals behind the expanding strip
    setTimeout(() => {
      setShowProfileCard(true)
      setStripPhase("horizontal")
    }, 1950)
    
    // Hide all corner chibis exactly 2.9s (2900ms) after trigger
    // This lets the user see all 4 chibis together in the corners of the centered screen
    // before they slide out
    setTimeout(() => {
      setShowObj1(false)
      setShowObj2(false)
      setShowObj3(false)
      setShowObj4(false)
    }, 2900)

    // Complete the strip phase and trigger character name entrance animation
    setTimeout(() => {
      setStripPhase("done")
      setShowWhiteStrip(false)
      window.dispatchEvent(new CustomEvent("startNameAnimation"))
    }, 2300)
  }

  // Initialize website and audio when user enters from splash screen
  const handleSplashEnter = () => {
    setShowSplash(false)
    
    // Wait 100ms (0.1s) for the splash screen to fade out completely before playing music
    setTimeout(() => {
      // unlock audio and play music after user interaction
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.__audioUnlockRequested = true
      requestAnimationFrame(() => requestAnimationFrame(() => window.dispatchEvent(new CustomEvent("unlockAudio"))))
    }, 100)

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
      triggerRevealSequence()
    }
    window.addEventListener("musicStarted", onMusicStarted)
    return () => window.removeEventListener("musicStarted", onMusicStarted)
  }, [])

  useEffect(() => {
    // Only trigger the corner chibis sequential entry once the splash screen is fully faded out
    // and the music player is active (meaning music has started playing)
    if (!showSplash && showMusicPlayer) {
      // Set camera initially to centered normal view
      cameraControls.set({
        scale: 1,
        x: "0vw",
        y: "0vh"
      })

      // Smoothly zoom in to obj 1 (Bottom-Left)
      cameraControls.start({
        scale: 2.2,
        x: "90vw",
        y: "-80vh",
        transition: { duration: 0.28, ease: "easeOut" }
      })

      // Show obj 1 at 80ms (mid-zoom)
      const t_obj1 = setTimeout(() => {
        setShowObj1(true)
      }, 80)

      // Camera starts pan to Bottom-Right at 280ms (exactly as zoom-in completes, zero pause)
      const t_cam2 = setTimeout(() => {
        cameraControls.start({
          x: "-90vw",
          y: "-80vh",
          scale: 2.2,
          transition: { duration: 0.32, ease: "easeInOut" }
        })
      }, 280)

      // Show obj 2 at 360ms (mid-pan)
      const t_obj2 = setTimeout(() => {
        setShowObj2(true)
      }, 360)

      // Camera starts pan to Top-Left at 600ms (exactly as pan 2 completes, zero pause)
      const t_cam3 = setTimeout(() => {
        cameraControls.start({
          x: "90vw",
          y: "80vh",
          scale: 2.2,
          transition: { duration: 0.32, ease: "easeInOut" }
        })
      }, 600)

      // Show obj 3 at 680ms (mid-pan)
      const t_obj3 = setTimeout(() => {
        setShowObj3(true)
      }, 680)

      // Camera starts pan to Top-Right at 920ms (exactly as pan 3 completes, zero pause)
      const t_cam4 = setTimeout(() => {
        cameraControls.start({
          x: "-90vw",
          y: "80vh",
          scale: 2.2,
          transition: { duration: 0.32, ease: "easeInOut" }
        })
      }, 920)

      // Show obj 4 at 1000ms (mid-pan)
      const t_obj4 = setTimeout(() => {
        setShowObj4(true)
      }, 1000)

      // Zoom back out to normal view at 1550ms (310ms pause at obj 4 to show it off)
      const t_cam5 = setTimeout(() => {
        cameraControls.start({
          x: "0vw",
          y: "0vh",
          scale: 1,
          transition: { duration: 0.65, ease: [0.25, 1, 0.5, 1] }
        })
      }, 1550)

      return () => {
        clearTimeout(t_obj1)
        clearTimeout(t_cam2)
        clearTimeout(t_obj2)
        clearTimeout(t_cam3)
        clearTimeout(t_obj3)
        clearTimeout(t_cam4)
        clearTimeout(t_obj4)
        clearTimeout(t_cam5)
      }
    }
  }, [showSplash, showMusicPlayer, cameraControls])

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

  const getActiveStatForCard = () => {
    if (showAnchor) return showAnchor;
    // Don't assign layoutId to icon while expanded (prevents dual layoutId conflict)
    if (delmuExpanded) return null;
    if (isBoothHovered) return "Booth";
    if (isDelmuHovered) return "X";
    if (isWaveBoxHovered) return "WaveBox";
    return null;
  }
  const activeStat = getActiveStatForCard();

  return (
    <>
      {/* Splash Screen - Show before main content */}
      <AnimatePresence>
        {showSplash && <SplashScreen onEnter={handleSplashEnter} />}
      </AnimatePresence>

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
                    scale: Math.max(iconRect.width / 500, 0.04),
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
                width: isDelmuFullscreen ? "100vw" : 500,
                height: isDelmuFullscreen ? "100vh" : 460,
                borderRadius: 0,
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                margin: "auto",
                clipPath: isDelmuFullscreen ? 'none' : pixelClipPath(7),
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
                borderWidth: "14px",
                borderColor: "#5c3d2e",
                boxShadow: "inset 0 0 0 3px #d4af37, inset 0 0 15px rgba(0, 0, 0, 0.3)",
                filter: "drop-shadow(0 12px 30px rgba(92, 61, 46, 0.4)) drop-shadow(0 4px 6px rgba(92, 61, 46, 0.25))",
                y: [0, -12, 4, -8, 2, 0],
                rotate: [0, 1.2, -0.6, -1.2, 0.6, 0],
              } : {
                borderWidth: "14px",
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
              <PixelFrameCorners size={14} inset={1} visible={!isDelmuFullscreen && !closingAnimation} />
              <PixelFrameFlowers flowerSize={20} visible={!isDelmuFullscreen && !closingAnimation} />
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
                className="absolute top-5 right-5 z-30 w-9 h-9 flex items-center justify-center cursor-pointer border-0 p-0 group"
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
                      scale: Math.max(iconRect.width / 500, 0.04),
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
      <motion.div 
        animate={cameraControls} 
        className="w-full min-h-screen relative" 
        style={{ 
          transformOrigin: "center center",
          pointerEvents: profileAnimationComplete ? "auto" : "none",
          willChange: "transform"
        }}
      >
        <CyberBackground />
        <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-4 pt-48 pb-40">
          <AnimatePresence>
            {showProfileCard && (
              <div className="flex items-start justify-center relative">
                <div className="w-full max-w-3xl space-y-4 relative flex-shrink-0">
                  <motion.div style={{ transformOrigin: "center center" }} initial={{ opacity: 0, scale: 0.75 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}>
                    <ProfileCard showWhiteStrip={showWhiteStrip} stripPhase={stripPhase} activeStat={activeStat} />
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
      <DraggableMusicPlayer isVisible={musicPlayerExpanded} onClose={() => setMusicPlayerExpanded(false)} defaultX={musicPlayerX} defaultY={musicPlayerY} />
    </main>
    </>
  )
}
