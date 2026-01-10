"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, SkipBack, SkipForward } from "lucide-react"

const tracks = [
  { title: "超学生ぴんく @歌ってみた", artist: "超学生", duration: "3:50", src: "/Bio/music/超学生ぴんく @歌ってみた.mp3" },
  { title: "黒塗り世界宛て書簡", artist: "Unknown", duration: "2:09", src: "/Bio/music/黒塗り世界宛て書簡.mp3" },
  { title: "Psychotrance", artist: "Baby Jane", duration: "2:30", src: "/Bio/music/Baby Jane - Psychotrance (Official Video).mp3" },
]

type Phase = "hidden" | "sweep" | "done"

export function MusicPlayer({ isVisible = false }: { isVisible?: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [phase, setPhase] = useState<Phase>("hidden")
  const [playing, setPlaying] = useState(true)
  const [track, setTrack] = useState(0)
  const [progress, setProgress] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [ready, setReady] = useState(false)
  const [switching, setSwitching] = useState(false)

  useEffect(() => {
    if (!isVisible) { setPhase("hidden"); return }
    setPhase("sweep")
    setReady(true)
    const t = setTimeout(() => setPhase("done"), 500)
    return () => clearTimeout(t)
  }, [isVisible])

  useEffect(() => {
    const unlock = () => {
      setReady(true)
      audioRef.current?.play().catch(() => {})
    }
    window.addEventListener("click", unlock, { once: true })
    window.addEventListener("keydown", unlock, { once: true })
    return () => {
      window.removeEventListener("click", unlock)
      window.removeEventListener("keydown", unlock)
    }
  }, [])

  useEffect(() => {
    const el = audioRef.current
    if (!el || !ready) return
    playing ? el.play().catch(() => {}) : el.pause()
  }, [playing, track, ready])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const tick = () => el.duration && setProgress((el.currentTime / el.duration) * 100)
    const next = () => changeTrack((track + 1) % tracks.length)
    el.addEventListener("timeupdate", tick)
    el.addEventListener("ended", next)
    return () => { el.removeEventListener("timeupdate", tick); el.removeEventListener("ended", next) }
  }, [track])

  function changeTrack(i: number) {
    if (i === track || switching) return
    setSwitching(true)
    setTrack(i)
    setProgress(0)
    const el = audioRef.current
    if (el) { el.src = tracks[i].src; playing && el.play().catch(() => {}) }
    setTimeout(() => setSwitching(false), 350)
  }

  const prev = () => changeTrack((track - 1 + tracks.length) % tracks.length)
  const next = () => changeTrack((track + 1) % tracks.length)
  const toggle = () => { setReady(true); setPlaying(p => !p) }

  const boxStyle = {
    width: hovered ? 340 : 200,
    height: hovered ? 80 + 32 + tracks.length * 52 : 56,
    transition: "all .5s cubic-bezier(.32,.72,0,1)",
    boxShadow: hovered
      ? "0 0 0 1px rgba(255,255,255,.1), 0 20px 50px -10px rgba(0,0,0,.8)"
      : "0 0 0 1px rgba(255,255,255,.05), 0 4px 20px -5px rgba(0,0,0,.5)",
  }

  const clipPath = phase === "hidden" ? "inset(0 100% 0 0)" : phase === "sweep" ? "inset(0)" : "inset(0 0 0 100%)"

  return (
    <div
      className={`fixed bottom-8 left-1/2 z-50 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      style={{ transform: `translateX(-50%) scale(${isVisible ? 1 : .5})`, transition: "transform .6s cubic-bezier(.34,1.56,.64,1), opacity .4s" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <audio ref={audioRef} src={tracks[track].src} />

      <div className="bg-[#0a0a0a] border border-white/10 overflow-hidden backdrop-blur-xl relative" style={boxStyle}>
        <div className="absolute inset-0 bg-white z-30 pointer-events-none" style={{ clipPath, transition: "clip-path .5s cubic-bezier(.32,.72,0,1)" }} />

        <div className="h-[2px] bg-white/5 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-white" style={{ width: `${progress}%`, transition: "width .1s linear" }} />
        </div>

        <div style={{ padding: hovered ? 16 : 12, transition: "padding .5s cubic-bezier(.32,.72,0,1)" }}>
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1 relative overflow-hidden">
              <p className="font-medium text-white truncate leading-tight" style={{ fontSize: hovered ? 15 : 13, transition: "font-size .4s" }}>
                {tracks[track].title}
              </p>
              <p className="text-white/50 truncate" style={{ fontSize: hovered ? 12 : 11, marginTop: hovered ? 2 : 0, transition: "all .4s" }}>
                {tracks[track].artist}
              </p>
            </div>

            <div className="flex items-center">
              <button onClick={prev} className="text-white/50 hover:text-white transition-colors" style={{ width: hovered ? 36 : 0, height: 36, opacity: hovered ? 1 : 0, overflow: "hidden", transition: "all .4s" }}>
                <SkipBack className="w-4 h-4" fill="currentColor" />
              </button>
              <button onClick={toggle} className="bg-white flex items-center justify-center hover:bg-white/90" style={{ width: hovered ? 44 : 32, height: hovered ? 44 : 32, transition: "all .4s" }}>
                {playing ? <Pause className="text-black w-4 h-4" fill="currentColor" /> : <Play className="text-black w-4 h-4 ml-0.5" fill="currentColor" />}
              </button>
              <button onClick={next} className="text-white/50 hover:text-white transition-colors" style={{ width: hovered ? 36 : 0, height: 36, opacity: hovered ? 1 : 0, overflow: "hidden", transition: "all .4s" }}>
                <SkipForward className="w-4 h-4" fill="currentColor" />
              </button>
            </div>
          </div>

          <div style={{ height: hovered ? "auto" : 0, marginTop: hovered ? 16 : 0, opacity: hovered ? 1 : 0, overflow: "hidden", transition: "all .5s cubic-bezier(.32,.72,0,1)" }}>
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] text-white/40 uppercase tracking-[.15em] font-medium">Queue</p>
                <p className="text-[10px] text-white/30 font-mono">{track + 1}/{tracks.length}</p>
              </div>
              <div className="relative" style={{ height: tracks.length * 48 }}>
                <div className="absolute left-0 right-0 flex items-center justify-between pointer-events-none z-10 px-2" style={{ top: track * 48, height: 48, transition: "top .5s cubic-bezier(.32,.72,0,1)" }}>
                  <span className="text-white text-sm font-mono animate-pulse">&gt;</span>
                  <span className="text-white text-sm font-mono animate-pulse">&lt;</span>
                </div>
                {tracks.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => changeTrack(i)}
                    className={`w-full flex items-center gap-3 px-6 text-left transition-all duration-300 ${track === i ? "bg-white/5" : "hover:bg-white/5"}`}
                    style={{ height: 48 }}
                  >
                    <span className="text-[10px] font-mono text-white/30 w-4">{String(i + 1).padStart(2, "0")}</span>
                    <span className={`text-sm flex-1 truncate text-center transition-colors ${track === i ? "text-white" : "text-white/50"}`}>{t.title}</span>
                    <span className="text-[10px] font-mono text-white/30">{t.duration}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
