import { useState, useEffect, useRef, useCallback } from "react"
import type { Track } from "@/lib/types"

interface UseAudioPlayerOptions {
  tracks: Track[]
  autoPlay?: boolean
}

interface AudioPlayerState {
  playing: boolean
  trackIndex: number
  progress: number
  ready: boolean
}

export function useAudioPlayer({ tracks, autoPlay = false }: UseAudioPlayerOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [state, setState] = useState<AudioPlayerState>({
    playing: false,
    trackIndex: 0,
    progress: 0,
    ready: false,
  })

  const currentTrack = tracks[state.trackIndex]

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    const audio = new Audio(currentTrack.src)
    audio.preload = "auto"
    audioRef.current = audio

    const onTimeUpdate = () => {
      if (audio.duration) {
        setState(s => ({ ...s, progress: (audio.currentTime / audio.duration) * 100 }))
      }
    }

    const onEnded = () => {
      setState(s => ({ ...s, trackIndex: (s.trackIndex + 1) % tracks.length, progress: 0 }))
    }

    const onCanPlay = () => {
      if (state.ready && state.playing) {
        audio.play().catch(() => {})
      }
    }

    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("ended", onEnded)
    audio.addEventListener("canplay", onCanPlay)

    if (state.ready && state.playing) {
      audio.play().catch(() => {})
    }

    return () => {
      audio.pause()
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("ended", onEnded)
      audio.removeEventListener("canplay", onCanPlay)
    }
  }, [state.trackIndex, currentTrack.src, tracks.length])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !state.ready) return
    if (state.playing) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [state.playing, state.ready])

  useEffect(() => {
    const unlock = () => {
      setState(s => {
        if (s.ready) return s
        const shouldPlay = autoPlay || s.playing
        if (shouldPlay && audioRef.current) {
          audioRef.current.play().catch(() => {})
        }
        return { ...s, ready: true, playing: shouldPlay }
      })
    }
    document.addEventListener("click", unlock)
    document.addEventListener("touchstart", unlock)
    document.addEventListener("keydown", unlock)
    return () => {
      document.removeEventListener("click", unlock)
      document.removeEventListener("touchstart", unlock)
      document.removeEventListener("keydown", unlock)
    }
  }, [autoPlay])

  const play = useCallback(() => setState(s => ({ ...s, playing: true, ready: true })), [])
  const pause = useCallback(() => setState(s => ({ ...s, playing: false })), [])
  const toggle = useCallback(() => setState(s => ({ ...s, playing: !s.playing, ready: true })), [])

  const setTrack = useCallback((index: number) => {
    if (index < 0 || index >= tracks.length) return
    setState(s => ({ ...s, trackIndex: index, progress: 0 }))
  }, [tracks.length])

  const next = useCallback(() => {
    setState(s => ({ ...s, trackIndex: (s.trackIndex + 1) % tracks.length, progress: 0 }))
  }, [tracks.length])

  const prev = useCallback(() => {
    setState(s => ({ ...s, trackIndex: (s.trackIndex - 1 + tracks.length) % tracks.length, progress: 0 }))
  }, [tracks.length])

  return {
    ...state,
    currentTrack,
    play,
    pause,
    toggle,
    setTrack,
    next,
    prev,
  }
}
