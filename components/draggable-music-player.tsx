"use client"

import { useState, useRef, useEffect } from "react"
import { MusicPlayer } from "./music-player"

interface DraggableMusicPlayerProps {
  isVisible?: boolean
  onClose: () => void
  defaultX?: number
  defaultY?: number
}

export function DraggableMusicPlayer({
  isVisible = false,
  onClose,
  defaultX = 100,
  defaultY = 100,
}: DraggableMusicPlayerProps) {
  const [position, setPosition] = useState({ x: defaultX, y: defaultY })
  const [isDragging, setIsDragging] = useState(false)
  const hasInitialized = useRef(false)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  // Update position only on first mount with new defaultX/defaultY
  useEffect(() => {
    if (!isDragging && !hasInitialized.current && defaultX > 0) {
      setPosition({ x: defaultX, y: defaultY })
      hasInitialized.current = true
    }
  }, [defaultX, defaultY, isDragging])

  const handleHeaderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only start drag if clicking on the header itself, not on buttons
    const target = e.target as HTMLElement
    if (target.closest("button")) {
      return
    }

    dragOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }
    setIsDragging(true)
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffsetRef.current.x,
        y: e.clientY - dragOffsetRef.current.y,
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  return (
    <div
      ref={containerRef}
      className="fixed z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: "380px",
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
        transition: "opacity 0.2s ease",
      }}
      onMouseDown={handleHeaderMouseDown}
    >
      <div
        ref={headerRef}
        className="cursor-grab active:cursor-grabbing"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "52px", // height of the header
          zIndex: 10,
          pointerEvents: "none",
        }}
      />
      <MusicPlayer isVisible={isVisible} onClose={onClose} />
    </div>
  )
}
