"use client"

import { useEffect, useRef } from "react"

export function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Mouse position tracking
    let mouseX = canvas.width / 2
    let mouseY = canvas.height / 2
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    window.addEventListener("mousemove", handleMouseMove)

    // Create particles
    const particleCount = 80
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      baseRadius: number
      opacity: number
      targetOpacity: number
    }> = []

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        baseRadius: Math.random() * 4 + 5,
        radius: Math.random() * 4 + 5,
        opacity: Math.random() * 0.5 + 0.3,
        targetOpacity: Math.random() * 0.5 + 0.3,
      })
    }

    // Function to draw pixelated star
    const drawStar = (x: number, y: number, size: number, opacity: number) => {
      ctx.save()
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
      
      const pixelSize = size / 5
      
      // Create a simple pixelated 5-pointed star pattern
      // Using a grid-based approach
      const starPattern = [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0],
      ]
      
      // Draw center and main points
      ctx.fillRect(x - pixelSize / 2, y - pixelSize / 2, pixelSize, pixelSize)
      
      // Top point
      ctx.fillRect(x - pixelSize / 2, y - size, pixelSize, pixelSize)
      
      // Bottom point
      ctx.fillRect(x - pixelSize / 2, y + size, pixelSize, pixelSize)
      
      // Left point
      ctx.fillRect(x - size, y - pixelSize / 2, pixelSize, pixelSize)
      
      // Right point
      ctx.fillRect(x + size, y - pixelSize / 2, pixelSize, pixelSize)
      
      // Diagonal points for 5-pointed star
      const diagonalOffset = size * 0.6
      
      // Top-right
      ctx.fillRect(x + diagonalOffset - pixelSize / 2, y - diagonalOffset - pixelSize / 2, pixelSize, pixelSize)
      
      // Top-left
      ctx.fillRect(x - diagonalOffset - pixelSize / 2, y - diagonalOffset - pixelSize / 2, pixelSize, pixelSize)
      
      // Bottom-right
      ctx.fillRect(x + diagonalOffset - pixelSize / 2, y + diagonalOffset - pixelSize / 2, pixelSize, pixelSize)
      
      // Bottom-left
      ctx.fillRect(x - diagonalOffset - pixelSize / 2, y + diagonalOffset - pixelSize / 2, pixelSize, pixelSize)
      
      ctx.restore()
    }

    let animationId: number
    const mouseInfluenceDistance = 150

    const animate = () => {
      // Clear canvas completely (no fade effect)
      ctx.fillStyle = "#0a0a0a"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particles.forEach((particle) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Check distance to mouse
        const dx = particle.x - mouseX
        const dy = particle.y - mouseY
        const distanceToMouse = Math.sqrt(dx * dx + dy * dy)

        // Grow particle when mouse is near
        if (distanceToMouse < mouseInfluenceDistance) {
          const influence = 1 - distanceToMouse / mouseInfluenceDistance
          particle.radius = particle.baseRadius + influence * 4
          particle.targetOpacity = Math.min(1, particle.targetOpacity + influence * 0.2)
        } else {
          particle.radius += (particle.baseRadius - particle.radius) * 0.1
        }

        // Update opacity for twinkling effect
        particle.opacity += (particle.targetOpacity - particle.opacity) * 0.02
        if (Math.random() > 0.98) {
          particle.targetOpacity = Math.random() * 0.6 + 0.4
        }

        // Draw star
        drawStar(particle.x, particle.y, particle.radius, particle.opacity)
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-0">
      {/* Static background color */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      {/* Canvas for particle network */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
