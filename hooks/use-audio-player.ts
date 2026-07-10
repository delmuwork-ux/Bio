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
  const animationFrameIdRef = useRef<number | null>(null)

  const setupAnalysis = useCallback((audio: HTMLAudioElement) => {
    if (typeof window === "undefined") return

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
        analyserRef.current = analyser
        analyser.connect(ctx.destination)
      }

      const source = ctx.createMediaElementSource(audio)
      source.connect(analyserRef.current)
      sourceRef.current = source
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
      
      // Calculate averages for 4 bands
      let band1Sum = 0
      for (let i = 0; i < 3; i++) band1Sum += dataArray[i]
      const val1 = band1Sum / 3 / 255
      
      let band2Sum = 0
      for (let i = 3; i < 7; i++) band2Sum += dataArray[i]
      const val2 = band2Sum / 4 / 255
      
      let band3Sum = 0
      for (let i = 7; i < 12; i++) band3Sum += dataArray[i]
      const val3 = band3Sum / 5 / 255
      
      let band4Sum = 0
      for (let i = 12; i < 20; i++) band4Sum += dataArray[i]
      const val4 = band4Sum / 8 / 255

      window.dispatchEvent(new CustomEvent("musicBeat", { detail: { beatValue } }))
      window.dispatchEvent(new CustomEvent("musicVisualizer", { 
        detail: { values: [val1, val2, val3, val4] } 
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
        detail: { values: [0.15, 0.15, 0.15, 0.15] }
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
      // mark that the user requested music and ensure play happens
      autoPlayRef.current = true
      handleInteraction()
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
