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

  // volume and mute
  const [volume, setVolumeState] = useState<number>(1)
  const lastVolumeRef = useRef<number>(1)

  // track load errors map
  const [loadErrors, setLoadErrors] = useState<Record<number, boolean>>({})

  const currentTrack = tracks[trackIndex]

  useEffect(() => {
    const audio = new Audio(currentTrack.src)
    audio.preload = "auto"
    audioRef.current = audio

    audio.ontimeupdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
    }

    // apply currently set volume
    audio.volume = volume

    audio.onended = () => {
      setTrackIndex(i => (i + 1) % tracks.length)
      setProgress(0)
    }

    audio.oncanplaythrough = () => {
      // clear any previous error for this track
      setLoadErrors(prev => ({ ...prev, [trackIndex]: false }))
      if (readyRef.current) {
        audio.play().catch(() => {})
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
      }).catch(() => {})
    }

    return () => {
      audio.pause()
      audio.ontimeupdate = null
      audio.onended = null
      audio.oncanplaythrough = null
    }
  }, [trackIndex, currentTrack.src, tracks.length, volume])

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
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    
    // sync volume when changed
    audio.volume = volume

    if (playing && readyRef.current) {
      audio.play().catch(() => setPlaying(false))
    } else {
      audio.pause()
    }
  }, [playing, volume])

  const play = useCallback(() => {
    readyRef.current = true
    setReady(true)
    setPlaying(true)
  }, [])

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v))
    setVolumeState(clamped)
    if (clamped > 0) lastVolumeRef.current = clamped
    const audio = audioRef.current
    if (audio) audio.volume = clamped
  }, [])

  const toggleMute = useCallback(() => {
    setVolumeState(v => {
      const newV = v > 0 ? 0 : (lastVolumeRef.current || 1)
      const audio = audioRef.current
      if (audio) audio.volume = newV
      return newV
    })
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
    // volume controls
    volume,
    setVolume,
    toggleMute,
    // load error state
    loadErrors,
  }
}
