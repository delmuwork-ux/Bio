"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, useAnimationControls } from "framer-motion"
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
  const playlistSweepControls = useAnimationControls()

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
    if (musicPlayerExpanded && (musicPlayerX === 0 && musicPlayerY === 0)) {
      // Wait a frame to ensure DOM is rendered
      requestAnimationFrame(() => {
        // Find profile card by looking for card that contains the profile text
        const allCards = Array.from(document.querySelectorAll('.card'))
        let profileCard = null
        
        // Profile card contains avatar and bio text - find it by looking for specific content
        for (const card of allCards) {
          if (card.textContent?.includes('@Tofu')) {
            profileCard = card
            break
          }
        }
        
        // Fallback: use first card if found
        if (!profileCard && allCards.length > 0) {
          profileCard = allCards[0]
        }
        
        if (profileCard) {
          const rect = profileCard.getBoundingClientRect()
          // Position player to the right of profile card
          const x = Math.max(10, rect.right + window.scrollX + 20)
          // Center vertically with profile card or position higher if needed
          const y = Math.max(10, rect.top + window.scrollY + (rect.height - 420) / 2)
          
          setMusicPlayerX(x)
          setMusicPlayerY(y)
        } else if (typeof window !== "undefined") {
          // Fallback: center position
          setMusicPlayerX(Math.max(10, (window.innerWidth - 380) / 2))
          setMusicPlayerY(Math.max(10, (window.innerHeight - 400) / 2))
        }
      })
    }
  }, [musicPlayerExpanded, musicPlayerX, musicPlayerY])

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
    if (!showPlaylistButton) return

    const runPlaylistSweep = async () => {
      // Stage 1: Sweep covers từ trái sang phải (scaleX 0 -> 1)
      await playlistSweepControls.start({
        scaleX: 1,
        transformOrigin: "left",
        transition: {
          duration: ANIMATION_CONFIG.sweep.duration || 0.5,
          ease: ANIMATION_CONFIG.sweep.ease,
        },
      })
      
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

    runPlaylistSweep()
  }, [showPlaylistButton, playlistSweepControls])

  return (
    <>
      {/* Splash Screen - Show before main content */}
      <AnimatePresence>
        {showSplash && <SplashScreen onEnter={handleSplashEnter} />}
      </AnimatePresence>

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
                  className="cursor-pointer"
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
                {/* Text - always visible */}
                <span className="relative z-10">My playlist&lt;3</span>
              </motion.button>
            </div>
            )}
          </AnimatePresence>
        </div>

      {/* Music Player - Draggable - Always mounted to keep audio playing */}
      <DraggableMusicPlayer
        isVisible={musicPlayerExpanded}
        onClose={() => setMusicPlayerExpanded(false)}
        defaultX={musicPlayerX}
        defaultY={musicPlayerY}
      />

    </main>
    </>
  )
}
