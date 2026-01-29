'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'

interface UseScrollRevealOptions {
  threshold?: number
  rootMargin?: string
}

export function useScrollReveal<T extends HTMLElement>(
  options: UseScrollRevealOptions = {}
) {
  const { threshold = 0.1, rootMargin = '0px 0px -50px 0px' } = options
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Check if reduced motion is preferred
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(element) // Only trigger once
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return { ref, isVisible }
}

interface ScrollRevealItemProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function ScrollRevealItem({
  children,
  className = '',
  delay = 0
}: ScrollRevealItemProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px',
  })

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
