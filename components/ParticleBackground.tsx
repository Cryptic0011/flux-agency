'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speedY: number
  speedX: number
  opacity: number
  rotation: number
  rotationSpeed: number
  symbol: string
}

const CODE_SYMBOLS = ['{ }', '</>', '#', '( )', '[ ]', '&&', '=>', '**', '::', '//']

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number | null>(null)
  const lastFrameRef = useRef<number>(0)
  // Cache dimensions to avoid layout thrashing in animation loop
  const dimensionsRef = useRef({ width: 0, height: 0, dpr: 1 })

  useEffect(() => {
    // Respect user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Detect mobile for performance optimization
    const isMobile = window.innerWidth < 768
    const targetFPS = isMobile ? 30 : 60
    const frameInterval = 1000 / targetFPS

    // Debounce resize to prevent rapid-fire on mobile Safari address bar changes
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null

    const resizeCanvas = () => {
      // Use device pixel ratio for sharper rendering on high DPI screens
      // but cap at 2 for performance
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = window.innerWidth
      const height = window.innerHeight

      // Cache dimensions for use in animation loop
      dimensionsRef.current = { width, height, dpr }

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      // Reset transform before applying new scale (fixes cumulative scale bug)
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }

    const createParticle = (): Particle => ({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + 20,
      size: Math.random() * 12 + 8,
      speedY: Math.random() * 0.4 + 0.15,
      speedX: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.25 + 0.08,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.015,
      symbol: CODE_SYMBOLS[Math.floor(Math.random() * CODE_SYMBOLS.length)],
    })

    const initParticles = () => {
      // Fewer particles on mobile for better performance
      const baseCount = isMobile ? 12 : 25
      const count = Math.min(baseCount, Math.floor(window.innerWidth / 50))
      particlesRef.current = Array.from({ length: count }, () => {
        const particle = createParticle()
        particle.y = Math.random() * window.innerHeight
        return particle
      })
    }

    const drawParticle = (particle: Particle) => {
      ctx.save()
      ctx.translate(particle.x, particle.y)
      ctx.rotate(particle.rotation)
      ctx.font = `${particle.size}px monospace`
      ctx.fillStyle = `rgba(168, 85, 247, ${particle.opacity})`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(particle.symbol, 0, 0)
      ctx.restore()
    }

    const animate = (timestamp: number) => {
      // Throttle frame rate for performance
      const elapsed = timestamp - lastFrameRef.current

      if (elapsed >= frameInterval) {
        lastFrameRef.current = timestamp - (elapsed % frameInterval)

        // Use cached dimensions to avoid layout thrashing
        const { width, height } = dimensionsRef.current
        ctx.clearRect(0, 0, width, height)

        particlesRef.current.forEach((particle, index) => {
          particle.y -= particle.speedY
          particle.x += particle.speedX
          particle.rotation += particle.rotationSpeed

          if (particle.y < -30) {
            particlesRef.current[index] = createParticle()
          }

          drawParticle(particle)
        })
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    // Pause animation when tab is not visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
          animationRef.current = null
        }
      } else {
        if (!animationRef.current) {
          lastFrameRef.current = performance.now()
          animationRef.current = requestAnimationFrame(animate)
        }
      }
    }

    resizeCanvas()
    initParticles()
    animationRef.current = requestAnimationFrame(animate)

    const handleResize = () => {
      // Debounce resize to prevent rapid-fire events on mobile Safari
      // when address bar animates in/out at top of page
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      resizeTimeout = setTimeout(() => {
        resizeCanvas()
        initParticles()
      }, 100)
    }

    window.addEventListener('resize', handleResize)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.5 }}
      aria-hidden="true"
    />
  )
}
