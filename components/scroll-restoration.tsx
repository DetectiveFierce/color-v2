"use client"

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// Store scroll positions in memory and localStorage
const scrollPositions = new Map<string, { x: number; y: number }>()

// Load saved positions from localStorage on initialization
if (typeof window !== 'undefined') {
    try {
        const saved = localStorage.getItem('scroll-positions')
        if (saved) {
            const parsed = JSON.parse(saved)
            Object.entries(parsed).forEach(([path, position]) => {
                scrollPositions.set(path, position as { x: number; y: number })
            })
        }
    } catch (error) {
        console.warn('Failed to load scroll positions from localStorage:', error)
    }
}

// Save positions to localStorage
const saveToStorage = () => {
    if (typeof window !== 'undefined') {
        try {
            const positions = Object.fromEntries(scrollPositions.entries())
            localStorage.setItem('scroll-positions', JSON.stringify(positions))
        } catch (error) {
            console.warn('Failed to save scroll positions to localStorage:', error)
        }
    }
}

export function ScrollRestoration() {
    const pathname = usePathname()
    const isInitialMount = useRef(true)
    const hasRestored = useRef(false)

    useEffect(() => {
        // Save current scroll position
        const saveScrollPosition = () => {
            if (typeof window !== 'undefined') {
                scrollPositions.set(pathname, {
                    x: window.scrollX,
                    y: window.scrollY
                })
                saveToStorage()
            }
        }

        // Restore scroll position after navigation
        const restoreScrollPosition = () => {
            if (typeof window !== 'undefined') {
                const savedPosition = scrollPositions.get(pathname)
                if (savedPosition && !hasRestored.current) {
                    // Use multiple attempts to ensure restoration works
                    const attemptRestore = (attempts = 0) => {
                        if (attempts > 10) return // Max 10 attempts

                        setTimeout(() => {
                            window.scrollTo({
                                left: savedPosition.x,
                                top: savedPosition.y,
                                behavior: 'instant'
                            })

                            // Check if scroll position was actually restored
                            if (Math.abs(window.scrollY - savedPosition.y) > 10) {
                                attemptRestore(attempts + 1)
                            } else {
                                hasRestored.current = true
                            }
                        }, 50 * (attempts + 1)) // Increasing delay
                    }

                    attemptRestore()
                }
            }
        }

        // Save scroll position on scroll events (throttled)
        let ticking = false
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    saveScrollPosition()
                    ticking = false
                })
                ticking = true
            }
        }

        // Save scroll position when page becomes hidden
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                saveScrollPosition()
            }
        }

        // Save scroll position before unload
        const handleBeforeUnload = () => {
            saveScrollPosition()
        }

        // Handle route changes
        const handleRouteChange = () => {
            saveScrollPosition()
        }

        // Set up event listeners
        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', handleScroll, { passive: true })
            document.addEventListener('visibilitychange', handleVisibilityChange)
            window.addEventListener('beforeunload', handleBeforeUnload)

            // Listen for popstate events (back/forward navigation)
            window.addEventListener('popstate', handleRouteChange)
        }

        // Reset restoration flag for new page
        hasRestored.current = false

        // Only restore scroll position if this is not the initial mount
        if (!isInitialMount.current) {
            restoreScrollPosition()
        } else {
            isInitialMount.current = false
        }

        // Cleanup
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('scroll', handleScroll)
                document.removeEventListener('visibilitychange', handleVisibilityChange)
                window.removeEventListener('beforeunload', handleBeforeUnload)
                window.removeEventListener('popstate', handleRouteChange)
                saveScrollPosition()
            }
        }
    }, [pathname])

    return null
}
