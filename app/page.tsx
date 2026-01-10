"use client"

import { useState, useEffect } from "react"
import { ProfileCard } from "@/components/profile-card"
import { SocialLinks } from "@/components/social-links"
import { MusicPlayer } from "@/components/music-player"
import { CyberBackground } from "@/components/cyber-background"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [showWhiteStrip, setShowWhiteStrip] = useState(false)
  const [stripPhase, setStripPhase] = useState<"vertical" | "full" | "horizontal" | "done">("vertical")
  const [showProfileCard, setShowProfileCard] = useState(false)
  const [showSocialCard, setShowSocialCard] = useState(false)
  const [showMusicPlayer, setShowMusicPlayer] = useState(false)
  const [playerSweep, setPlayerSweep] = useState(false)
  const [showHelloOverlay, setShowHelloOverlay] = useState(true)

  useEffect(() => {
    if (!showHelloOverlay) {
      const timer = setTimeout(() => {
        setIsLoading(false)
        setTimeout(() => {
          setShowWhiteStrip(true)
          setStripPhase("vertical")
        }, 100)
        setTimeout(() => setStripPhase("full"), 500)
        setTimeout(() => setShowProfileCard(true), 700)
        setTimeout(() => setShowSocialCard(true), 1200)
        setTimeout(() => setStripPhase("horizontal"), 900)
        setTimeout(() => {
          setStripPhase("done")
          setShowWhiteStrip(false)
          window.dispatchEvent(new CustomEvent("startNameAnimation"))
        }, 1400)
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("startSocialAnimation"))
        }, 1700)
        // instead of showing player immediately, run a short sweep then reveal player (to match social card behavior)
        setTimeout(() => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const SWEEP_MS =  Math.round((0.5) * 1000)
          setPlayerSweep(true)
          setTimeout(() => {
            setPlayerSweep(false)
            setShowMusicPlayer(true)
          }, SWEEP_MS + 60)
        }, 2200)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [showHelloOverlay])

  useEffect(() => {
    const onMusicStarted = () => {
      if (showMusicPlayer || playerSweep) return
      setPlayerSweep(true)
      const ms = Math.round((ANIMATION_CONFIG.sweep.duration || 0.5) * 1000) + 60
      setTimeout(() => {
        setPlayerSweep(false)
        setShowMusicPlayer(true)
      }, ms)
    }

    window.addEventListener("musicStarted", onMusicStarted)
    return () => window.removeEventListener("musicStarted", onMusicStarted)
  }, [showMusicPlayer, playerSweep])

  return (
    <main className="relative min-h-screen overflow-hidden">
      <CyberBackground />

      {showHelloOverlay && (
        <div
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center cursor-pointer"
          onClick={() => {
            setShowHelloOverlay(false)
            // mark that audio was requested; dispatch unlock so hook will honor it when it mounts
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            window.__audioUnlockRequested = true
            requestAnimationFrame(() => requestAnimationFrame(() => window.dispatchEvent(new CustomEvent("unlockAudio"))))
          }}
        >
          <h1 className="text-white text-4xl font-bold">こんにちは</h1>
          <p className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/60 text-sm">Click anywhere to enter</p>
        </div>
      )}

      {!showHelloOverlay && (
        <>
          {isLoading && (
            <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
              <div className="flex flex-col items-center gap-6">
                <div className="w-48 h-0.5 bg-white/10 overflow-hidden">
                  <div className="h-full bg-white animate-loading-bar" />
                </div>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-mono">Loading</p>
              </div>
            </div>
          )}

          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20 pb-40">
            <div className="w-full max-w-sm space-y-4 relative">
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

              <div
                className={`transition-all duration-500 ease-out
                           ${showProfileCard ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
                style={{ transformOrigin: "center center" }}
              >
                <ProfileCard />
              </div>

              <div
                className={`transition-all duration-500 ease-out
                           ${showSocialCard ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
                style={{ transformOrigin: "center center" }}
              >
                <SocialLinks />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {playerSweep && (
              <motion.div
                className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white h-12 w-44"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: ANIMATION_CONFIG.sweep.duration, ease: ANIMATION_CONFIG.sweep.ease }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <MusicPlayer isVisible={showMusicPlayer} />
        </>
      )}
    </main>
  )
}
