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
    playing: autoPlay,
    trackIndex: 0,
    progress: 0,
    ready: false,
  })

  const currentTrack = tracks[state.trackIndex]

  useEffect(() => {
    const audio = new Audio(currentTrack.src)
    audioRef.current = audio

    const onTimeUpdate = () => {
      if (audio.duration) {
        setState(s => ({ ...s, progress: (audio.currentTime / audio.duration) * 100 }))
      }
    }

    const onEnded = () => {
      const nextIndex = (state.trackIndex + 1) % tracks.length
      setState(s => ({ ...s, trackIndex: nextIndex, progress: 0 }))
    }

    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("ended", onEnded)

    return () => {
      audio.pause()
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("ended", onEnded)
    }
  }, [state.trackIndex, tracks])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !state.ready) return
    if (state.playing) {
      audio.play().catch(() => setState(s => ({ ...s, playing: false })))
    } else {
      audio.pause()
    }
  }, [state.playing, state.ready, state.trackIndex])

  useEffect(() => {
    const unlock = () => {
      setState(s => ({ ...s, ready: true, playing: autoPlay || s.playing }))
    }
    window.addEventListener("click", unlock, { once: true })
    window.addEventListener("touchstart", unlock, { once: true })
    window.addEventListener("keydown", unlock, { once: true })
    return () => {
      window.removeEventListener("click", unlock)
      window.removeEventListener("touchstart", unlock)
      window.removeEventListener("keydown", unlock)
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
