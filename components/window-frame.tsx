"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { X, Minus } from "lucide-react"

interface WindowFrameProps {
  title: string
  children: React.ReactNode
  onClose: () => void
  defaultX?: number
  defaultY?: number
  width?: number
}

export function WindowFrame({
  title,
  children,
  onClose,
  defaultX = 100,
  defaultY = 100,
  width = 400,
}: WindowFrameProps) {
  const [position, setPosition] = useState({ x: defaultX, y: defaultY })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isMinimized, setIsMinimized] = useState(false)
  const windowRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only drag from the title bar, not from buttons
    const target = e.target as HTMLElement
    if (target.closest("button")) {
      return
    }

    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
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
  }, [isDragging, dragOffset])

  return (
    <motion.div
      ref={windowRef}
      className="fixed z-50 bg-gradient-to-b from-[#0a7ea4] to-[#0a0a0a] border border-white/20 shadow-2xl"
      style={{
        width: width,
        left: position.x,
        top: position.y,
        cursor: isDragging ? "grabbing" : "default",
      }}
      initial={{ opacity: 0, scale: 0.8, y: -50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -50 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Title Bar */}
      <div
        className="flex items-center justify-between px-2 py-1.5 bg-gradient-to-r from-[#0a7ea4] to-[#0a5a78] border-b border-white/20 select-none cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-3 h-3 bg-blue-400 rounded-full" />
          <span className="text-white text-xs font-semibold truncate">{title}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-6 h-6 flex items-center justify-center hover:bg-white/20 transition-colors"
            title="Minimize"
          >
            <Minus className="w-3 h-3 text-white" />
          </button>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center hover:bg-red-500/80 transition-colors"
            title="Close"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="window-content overflow-hidden">
          {children}
        </div>
      )}
    </motion.div>
  )
}
