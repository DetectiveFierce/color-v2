"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderContextType = {
    theme: Theme
    setTheme: (theme: Theme) => void
    isDark: boolean
}

const ThemeProviderContext = createContext<ThemeProviderContextType | undefined>(undefined)

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "theme",
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(defaultTheme)
    const [mounted, setMounted] = useState(false)

    // Get system preference
    const getSystemTheme = (): "dark" | "light" => {
        if (typeof window !== "undefined") {
            return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        }
        return "light"
    }

    // Calculate actual theme (resolving "system")
    const resolvedTheme = theme === "system" ? getSystemTheme() : theme
    const isDark = resolvedTheme === "dark"

    useEffect(() => {
        setMounted(true)
        // Load theme from localStorage
        try {
            const storedTheme = localStorage.getItem(storageKey) as Theme
            if (storedTheme && ["dark", "light", "system"].includes(storedTheme)) {
                setTheme(storedTheme)
            }
        } catch {
            // Ignore localStorage errors
        }
    }, [storageKey])

    useEffect(() => {
        if (!mounted) return

        // Save theme to localStorage
        try {
            localStorage.setItem(storageKey, theme)
        } catch {
            // Ignore localStorage errors
        }

        // Apply theme to document
        const root = document.documentElement
        root.classList.remove("light", "dark")
        root.classList.add(resolvedTheme)
    }, [theme, resolvedTheme, mounted, storageKey])

    useEffect(() => {
        if (!mounted) return

        // Listen for system theme changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
        const handleSystemChange = () => {
            setTheme(getSystemTheme())
        }

        mediaQuery.addEventListener("change", handleSystemChange)
        return () => mediaQuery.removeEventListener("change", handleSystemChange)
    }, [theme, mounted])

    if (!mounted) {
        // Prevent hydration mismatch
        return null
    }

    return (
        <ThemeProviderContext.Provider value={{ theme, setTheme, isDark }}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider")
    }
    return context
} 