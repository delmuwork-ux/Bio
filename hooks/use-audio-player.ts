import { useState, useEffect, useRef, useCallback } from "react"
import type { Track } from "@/lib/types"

interface UseAudioPlayerOptions {
  tracks: Track[]
  autoPlay?: boolean
}

export function useAudioPlayer({ tracks, autoPlay = false }: UseAudioPlayerOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [trackIndex, setTrackIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)
  const readyRef = useRef(false)
  const autoPlayRef = useRef(autoPlay)


  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const connectedAudioRef = useRef<HTMLAudioElement | null>(null)
  const animationFrameIdRef = useRef<number | null>(null)

  const setupAnalysis = useCallback((audio: HTMLAudioElement) => {
    if (typeof window === "undefined") return

    // If this specific audio element is already connected, do not attempt to reconnect it
    if (connectedAudioRef.current === audio && sourceRef.current) {
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume()
      }
      return
    }

    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
        audioCtxRef.current = new AudioContextClass()
      }
      
      const ctx = audioCtxRef.current
      if (ctx.state === "suspended") {
        ctx.resume()
      }

      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect()
        } catch (_) {}
      }

      if (!analyserRef.current) {
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 64
        analyser.smoothingTimeConstant = 0.7
        analyserRef.current = analyser
        analyser.connect(ctx.destination)
      }

      const source = ctx.createMediaElementSource(audio)
      source.connect(analyserRef.current)
      sourceRef.current = source
      connectedAudioRef.current = audio
    } catch (e) {
      console.warn("Failed to setup audio analysis:", e)
    }
  }, [])

  const startAnalysis = useCallback(() => {
    if (typeof window === "undefined") return

    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current)
    }

    const analyser = analyserRef.current
    if (!analyser) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const analyze = () => {
      if (!audioRef.current || audioRef.current.paused) return
      
      analyser.getByteFrequencyData(dataArray)
      
      let bassSum = 0
      const bassBins = Math.min(5, bufferLength)
      for (let i = 0; i < bassBins; i++) {
        bassSum += dataArray[i]
      }
      const bassAverage = bassSum / bassBins
      const beatValue = 1.0 + (bassAverage / 255) * 0.16
      
      // Extract 4 mid-to-high frequency bins from dataArray for visualizer effect
      const values4 = [
        dataArray[4] / 255,
        dataArray[7] / 255,
        dataArray[11] / 255,
        dataArray[16] / 255
      ]

      window.dispatchEvent(new CustomEvent("musicBeat", { detail: { beatValue } }))
      window.dispatchEvent(new CustomEvent("musicVisualizer", { 
        detail: { values: values4 } 
      }))
      window.dispatchEvent(new CustomEvent("audioTimeUpdate", {
        detail: { currentTime: audioRef.current.currentTime }
      }))
      
      animationFrameIdRef.current = requestAnimationFrame(analyze)
    }

    analyze()
  }, [])

  useEffect(() => {
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current)
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {})
      }
    }
  }, [])

  // track load errors map
  const [loadErrors, setLoadErrors] = useState<Record<number, boolean>>({})

  const currentTrack = tracks[trackIndex]

  useEffect(() => {
    // Don't set up audio if no tracks are available
    if (!currentTrack) {
      return
    }

    const audio = new Audio(currentTrack.src)
    audio.preload = "auto"
    audioRef.current = audio

    audio.ontimeupdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
      window.dispatchEvent(new CustomEvent("audioTimeUpdate", {
        detail: { currentTime: audio.currentTime }
      }))
    }

    audio.onended = () => {
      setTrackIndex(i => (i + 1) % tracks.length)
      setProgress(0)
    }

    audio.onpause = () => {
      window.dispatchEvent(new CustomEvent("musicVisualizer", {
        detail: { values: Array(4).fill(0.15) }
      }))
    }

    audio.oncanplaythrough = () => {
      // clear any previous error for this track
      setLoadErrors(prev => ({ ...prev, [trackIndex]: false }))
      if (readyRef.current) {
        audio.play().then(() => {
          setupAnalysis(audio)
          startAnalysis()
        }).catch(() => {})
      }
    }

    audio.onerror = () => {
      console.error("Failed to load audio:", currentTrack.src)
      setLoadErrors(prev => ({ ...prev, [trackIndex]: true }))
    }

    if (readyRef.current) {
      audio.play().then(() => {
        setPlaying(true)
        window.dispatchEvent(new CustomEvent("musicStarted"))
        setupAnalysis(audio)
        startAnalysis()
      }).catch(() => {})
    }

    return () => {
      audio.pause()
      audio.ontimeupdate = null
      audio.onended = null
      audio.oncanplaythrough = null
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current)
      }
    }
  }, [trackIndex, currentTrack, tracks.length, setupAnalysis, startAnalysis])

  useEffect(() => {
    const handleInteraction = () => {
      if (readyRef.current) return
      readyRef.current = true
      setReady(true)
      
      const audio = audioRef.current
      if (audio && autoPlayRef.current) {
        audio.play().then(() => {
          setPlaying(true)
          // notify UI that music started so components can appear
          window.dispatchEvent(new CustomEvent("musicStarted"))
          // set a marker so listeners mounted later can check
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          window.__musicStarted = true
          setupAnalysis(audio)
          startAnalysis()
        }).catch(() => {})
      }
    }

    const handleUnlockAudio = () => {
      autoPlayRef.current = true
      
      const audio = audioRef.current
      if (audio) {
        // 1. Play synchronously to satisfy Chrome user gesture requirement
        audio.play().then(() => {
          // 2. Immediately pause and reset so we don't start the audio sound yet
          audio.pause()
          audio.currentTime = 0
          
          // 3. Play for real after 200ms of delay to match the user's requested 0.2s start delay
          setTimeout(() => {
            audio.play().then(() => {
              setPlaying(true)
              window.dispatchEvent(new CustomEvent("musicStarted"))
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              window.__musicStarted = true
              setupAnalysis(audio)
              startAnalysis()
            }).catch((e) => {
              console.warn("Failed delayed audio start:", e)
            })
          }, 200)
        }).catch((e) => {
          console.warn("Failed synchronous audio unlock, falling back:", e)
          handleInteraction()
        })
      } else {
        handleInteraction()
      }
    }

    // If a page-level click already requested audio before this hook mounted,
    // honor it immediately.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if ((typeof window !== "undefined" && (window.__audioUnlockRequested === true))) {
      handleUnlockAudio()
      // clear flag so we don't replay on every mount
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.__audioUnlockRequested = false
    }

    document.addEventListener("click", handleInteraction)
    document.addEventListener("touchstart", handleInteraction)
    document.addEventListener("keydown", handleInteraction)
    window.addEventListener("unlockAudio", handleUnlockAudio)
    
    return () => {
      document.removeEventListener("click", handleInteraction)
      document.removeEventListener("touchstart", handleInteraction)
      document.removeEventListener("keydown", handleInteraction)
      window.removeEventListener("unlockAudio", handleUnlockAudio)
    }
  }, [setupAnalysis, startAnalysis])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (playing && readyRef.current) {
      audio.play().then(() => {
        setupAnalysis(audio)
        startAnalysis()
      }).catch(() => setPlaying(false))
    } else {
      audio.pause()
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current)
      }
    }
  }, [playing, setupAnalysis, startAnalysis])

  const play = useCallback(() => {
    readyRef.current = true
    setReady(true)
    setPlaying(true)
  }, [])



  const pause = useCallback(() => setPlaying(false), [])
  
  const toggle = useCallback(() => {
    readyRef.current = true
    setReady(true)
    setPlaying(p => !p)
  }, [])

  const changeTrack = useCallback((index: number) => {
    if (index < 0 || index >= tracks.length) return
    setTrackIndex(index)
    setProgress(0)
  }, [tracks.length])

  const next = useCallback(() => {
    setTrackIndex(i => (i + 1) % tracks.length)
    setProgress(0)
  }, [tracks.length])

  const prev = useCallback(() => {
    setTrackIndex(i => (i - 1 + tracks.length) % tracks.length)
    setProgress(0)
  }, [tracks.length])

  return {
    playing,
    trackIndex,
    progress,
    ready,
    currentTrack,
    play,
    pause,
    toggle,
    setTrack: changeTrack,
    next,
    prev,
    // load error state
    loadErrors,
  }
}
