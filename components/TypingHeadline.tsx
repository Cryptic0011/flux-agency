'use client'

import { useEffect, useState, useRef } from 'react'

// Business types that will cycle through
const BUSINESS_TYPES = [
    'contractors',
    'restaurants',
    'barber shops',
    'clothing brands',
    'dental offices',
    'law firms',
    'gyms',
]

// Main phrases
const PHRASES = [
    { text: 'websites that convert', type: 'standard' },
    { text: 'business automation', type: 'standard' },
    { text: 'websites for', type: 'business-cycle' },
    { text: 'SEO-optimized sites', type: 'standard' },
]

export default function TypingHeadline() {
    const [phraseIndex, setPhraseIndex] = useState(0)
    const [displayText, setDisplayText] = useState('')
    const [businessIndex, setBusinessIndex] = useState(0)
    const [phase, setPhase] = useState<'typing' | 'cycling' | 'deleting'>('typing')
    const cycleCountRef = useRef(0)

    const currentPhrase = PHRASES[phraseIndex]

    useEffect(() => {
        let animationId: number
        let startTime: number | null = null

        // Use requestAnimationFrame for more reliable timing on mobile Safari
        // setTimeout gets heavily throttled during elastic overscroll at top of page
        const scheduleUpdate = (delay: number, callback: () => void) => {
            startTime = null
            const tick = (timestamp: number) => {
                if (startTime === null) startTime = timestamp
                const elapsed = timestamp - startTime
                if (elapsed >= delay) {
                    callback()
                } else {
                    animationId = requestAnimationFrame(tick)
                }
            }
            animationId = requestAnimationFrame(tick)
        }

        if (phase === 'typing') {
            const targetText = currentPhrase.type === 'business-cycle'
                ? currentPhrase.text + ' ' + BUSINESS_TYPES[0]
                : currentPhrase.text

            if (displayText.length < targetText.length) {
                scheduleUpdate(50, () => {
                    setDisplayText(targetText.substring(0, displayText.length + 1))
                })
            } else {
                // Finished typing
                if (currentPhrase.type === 'business-cycle') {
                    // Start cycling immediately, no delay
                    setPhase('cycling')
                    cycleCountRef.current = 0
                } else {
                    scheduleUpdate(1500, () => {
                        setPhase('deleting')
                    })
                }
            }
        } else if (phase === 'cycling') {
            if (cycleCountRef.current < BUSINESS_TYPES.length - 1) {
                scheduleUpdate(350, () => {
                    cycleCountRef.current += 1
                    setBusinessIndex(cycleCountRef.current)
                })
            } else {
                // Done cycling, wait then delete
                scheduleUpdate(1200, () => {
                    setPhase('deleting')
                })
            }
        } else if (phase === 'deleting') {
            const targetText = currentPhrase.type === 'business-cycle'
                ? currentPhrase.text + ' ' + BUSINESS_TYPES[businessIndex]
                : currentPhrase.text

            if (displayText.length > 0) {
                scheduleUpdate(20, () => {
                    setDisplayText(targetText.substring(0, displayText.length - 1))
                })
            } else {
                // Finished deleting, move to next phrase
                const nextIndex = (phraseIndex + 1) % PHRASES.length
                setPhraseIndex(nextIndex)
                setBusinessIndex(0)
                cycleCountRef.current = 0
                setPhase('typing')
            }
        }

        return () => cancelAnimationFrame(animationId)
    }, [phase, displayText, phraseIndex, currentPhrase, businessIndex])

    // Render the typing text
    const renderText = () => {
        if (currentPhrase.type === 'business-cycle') {
            const baseText = currentPhrase.text // "websites for"
            const prefixWithSpace = baseText + ' '

            if (phase === 'cycling') {
                return (
                    <>
                        <span className="gradient-text">{baseText}</span>
                        <span className="text-white">{'\u00A0' + BUSINESS_TYPES[businessIndex]}</span>
                    </>
                )
            }

            // During typing or deleting of business-cycle phrase
            const typed = displayText

            // Still typing the base text (before the space)
            if (typed.length <= baseText.length) {
                return <span className="gradient-text">{typed}</span>
            }

            // Typing the space or business type
            const businessPart = typed.substring(prefixWithSpace.length)
            return (
                <>
                    <span className="gradient-text">{baseText}</span>
                    <span className="text-white">{'\u00A0' + businessPart}</span>
                </>
            )
        }
        return <span className="gradient-text">{displayText}</span>
    }

    return (
        <span className="block h-[1.2em] flex items-center justify-center">
            {renderText()}
            <span className="animate-blink text-neon-purple">|</span>
        </span>
    )
}
