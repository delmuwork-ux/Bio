import React from "react";
import { useState, useEffect, useRef } from "react"
import AnimatedRing from "./ui/animated-ring";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react"

const tracks = [
    {
    title: "超学生ぴんく @歌ってみた",
    artist: "超学生",
    duration: "3:50",
    src: "/Bio/music/超学生ぴんく @歌ってみた.mp3",
  },
  {
    title: "黒塗り世界宛て書簡",
    artist: "Unknown",
    duration: "2:09",
    src: "/Bio/music/黒塗り世界宛て書簡.mp3",
  },
  {
    title: "Psychotrance",
    artist: "Baby Jane",
    duration: "2:30",
    src: "/Bio/music/Baby Jane - Psychotrance (Official Video).mp3",
  },
]

export function MusicPlayer({ isVisible = false }: { isVisible?: boolean }) {
    const [introPhase, setIntroPhase] = useState<'hidden' | 'sweep' | 'done'>('hidden');

    useEffect(() => {
      if (isVisible) {
        setIntroPhase('sweep');
        const timer = setTimeout(() => {
          setIntroPhase('done');
        }, 500);
        return () => clearTimeout(timer);
      } else {
        setIntroPhase('hidden');
      }
    }, [isVisible]);
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isChangingTrack, setIsChangingTrack] = useState(false)
  const [isTrackChanged, setIsTrackChanged] = useState(false)
  const [displayTrack, setDisplayTrack] = useState(0)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)

  
  useEffect(() => {
    if (isVisible) {
      setHasUserInteracted(true)
    }
  }, [isVisible])

  useEffect(() => {
    if (isVisible && hasUserInteracted && audioRef.current && isPlaying) {
      audioRef.current.play().catch(() => {})
    }
  }, [isVisible, hasUserInteracted, isPlaying])

  useEffect(() => {
    const handleInteraction = () => {
      setHasUserInteracted(true)
      if (audioRef.current && isPlaying) {
        audioRef.current.play().catch(() => {})
      }
    }

    window.addEventListener("click", handleInteraction, { once: true })
    window.addEventListener("keydown", handleInteraction, { once: true })

    return () => {
      window.removeEventListener("click", handleInteraction)
      window.removeEventListener("keydown", handleInteraction)
    }
  }, [isPlaying])

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && hasUserInteracted) {
        audioRef.current.play().catch(() => {})
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying, currentTrack, hasUserInteracted])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
    }

    const handleEnded = () => {
      handleTrackChange((currentTrack + 1) % tracks.length)
    }

    audio.addEventListener("timeupdate", updateProgress)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", updateProgress)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [currentTrack])

  const handleTrackChange = (newTrack: number) => {
    if (newTrack === currentTrack) return
    setIsChangingTrack(false)
    setIsTrackChanged(false)

    setTimeout(() => {
      setCurrentTrack(newTrack)
      setDisplayTrack(newTrack)
      setProgress(0)
      if (audioRef.current) {
        audioRef.current.src = tracks[newTrack].src
        if (isPlaying) {
          audioRef.current.play().catch(() => {})
        }
      }
      setIsChangingTrack(true)
      setIsTrackChanged(true)
      setTimeout(() => {
        setIsChangingTrack(false)
      }, 400)
    }, 10)
  }

  const handleNext = () => {
    if (isChangingTrack) return
    handleTrackChange((currentTrack + 1) % tracks.length)
  }

  const handlePrev = () => {
    if (isChangingTrack) return
    handleTrackChange((currentTrack - 1 + tracks.length) % tracks.length)
  }

  const handlePlayPause = () => {
    setHasUserInteracted(true)
    setIsPlaying(!isPlaying)
  }

  const getArrowOffset = (trackIndex: number) => {
    return trackIndex * 48
  }

  return (
    <div
      className={`fixed bottom-8 left-1/2 z-50 
                 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      style={{
        transform: `translateX(-50%) scale(${isVisible ? 1 : 0.5})`,
        transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease-out",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <audio ref={audioRef} src={tracks[currentTrack].src} />

      <div
        ref={containerRef}
        className="bg-[#0a0a0a] border border-white/10 overflow-hidden backdrop-blur-xl relative"
        style={{
          width: isHovered ? 340 : 200,
          height: isHovered ? (80 + 32 + tracks.length * 52) : 56,
          transition: "all 0.5s cubic-bezier(0.32, 0.72, 0, 1)",
          boxShadow: isHovered
            ? "0 0 0 1px rgba(255,255,255,0.1), 0 20px 50px -10px rgba(0,0,0,0.8)"
            : "0 0 0 1px rgba(255,255,255,0.05), 0 4px 20px -5px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="absolute inset-0 bg-white z-30 pointer-events-none"
          style={{
            clipPath:
              introPhase === 'hidden'
                ? 'inset(0 100% 0 0)'
                : introPhase === 'sweep'
                  ? 'inset(0 0 0 0)'
                  : 'inset(0 0 0 100%)',
            transition: 'clip-path 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        />
        <div className="h-[2px] bg-white/5 relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-white"
            style={{
              width: `${progress}%`,
              transition: "width 0.1s linear",
            }}
          />
          <div
            className="absolute inset-y-0 left-0 bg-white/20"
            style={{
              width: "100%",
              transform: `scaleX(${progress / 100})`,
              transformOrigin: "left",
            }}
          />
        </div>

        <div
          style={{
            padding: isHovered ? 16 : 12,
            transition: "padding 0.5s cubic-bezier(0.32, 0.72, 0, 1)",
          }}
        >
          <div className="flex items-center gap-3">
              {}


            <div className="min-w-0 flex-1 relative overflow-hidden">
              <div
                className="absolute inset-0 bg-white z-10"
                style={{
                  transform: isTrackChanged ? "translateX(100%)" : "translateX(-100%)",
                  transition: isTrackChanged ? "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
                }}
              />
              <p
                className="font-medium text-white truncate leading-tight"
                style={{
                  fontSize: isHovered ? 15 : 13,
                  transition: "font-size 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
                }}
              >
                {tracks[currentTrack].title}
              </p>
              <p
                className="text-white/50 truncate"
                style={{
                  fontSize: isHovered ? 12 : 11,
                  marginTop: isHovered ? 2 : 0,
                  transition: "all 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
                }}
              >
                {tracks[currentTrack].artist}
              </p>
            </div>

            <div className="flex items-center gap-0">
              <button
                onClick={handlePrev}
                className="flex items-center justify-center text-white/50 hover:text-white transition-colors"
                style={{
                  width: isHovered ? 36 : 0,
                  height: 36,
                  opacity: isHovered ? 1 : 0,
                  transition: "all 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
                  overflow: "hidden",
                }}
              >
                <SkipBack className="w-4 h-4" fill="currentColor" />
              </button>

              <button
                onClick={handlePlayPause}
                className="bg-white flex items-center justify-center hover:bg-white/90 transition-colors"
                style={{
                  width: isHovered ? 44 : 32,
                  height: isHovered ? 44 : 32,
                  transition: "all 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
                }}
              >
                {isPlaying ? (
                  <Pause className="text-black" style={{ width: 16, height: 16 }} fill="currentColor" />
                ) : (
                  <Play className="text-black ml-0.5" style={{ width: 16, height: 16 }} fill="currentColor" />
                )}
              </button>

              <button
                onClick={handleNext}
                className="flex items-center justify-center text-white/50 hover:text-white transition-colors"
                style={{
                  width: isHovered ? 36 : 0,
                  height: isHovered ? 36 : 32,
                  opacity: isHovered ? 1 : 0,
                  transition: "all 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
                  overflow: "hidden",
                }}
              >
                <SkipForward className="w-4 h-4" fill="currentColor" />
              </button>
            </div>
          </div>

          <div
            style={{
              height: isHovered ? "auto" : 0,
              marginTop: isHovered ? 16 : 0,
              opacity: isHovered ? 1 : 0,
              overflow: "hidden",
              transition: "all 0.5s cubic-bezier(0.32, 0.72, 0, 1)",
            }}
          >
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] text-white/40 uppercase tracking-[0.15em] font-medium">Queue</p>
                <p className="text-[10px] text-white/30 font-mono">
                  {currentTrack + 1}/{tracks.length}
                </p>
              </div>

              <div className="relative" style={{ height: tracks.length * 48 }}>
                <div
                  className="absolute left-0 right-0 flex items-center justify-between pointer-events-none z-10 px-2"
                  style={{
                    top: displayTrack * 48,
                    height: 48,
                    transition: "top 0.5s cubic-bezier(0.32, 0.72, 0, 1)",
                  }}
                >
                  <span className="text-white text-sm font-mono animate-pulse">&gt;</span>
                  <span className="text-white text-sm font-mono animate-pulse">&lt;</span>
                </div>

                <div className="space-y-0">
                  {tracks.map((track, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (index !== currentTrack && !isChangingTrack) {
                          handleTrackChange(index)
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-6 text-left transition-all duration-300
                                 ${currentTrack === index ? "bg-white/5" : "hover:bg-white/5"}`}
                      style={{ height: 48 }}
                    >
                      <span className="text-[10px] font-mono text-white/30 w-4">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`text-sm flex-1 truncate text-center transition-colors duration-300
                                   ${currentTrack === index ? "text-white" : "text-white/50"}`}
                      >
                        {track.title}
                      </span>
                      <span className="text-[10px] font-mono text-white/30">{track.duration}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
