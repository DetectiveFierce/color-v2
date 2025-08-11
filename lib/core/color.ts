"use client"

import type { RGB, HSL, ShadeKey } from "./types"
import { SHADE_KEYS } from "./types"

// Color validation and normalization
export function ensureHashHex(hex: string | undefined | null): string {
    if (!hex) return "#000000"
    let h = hex.trim()
    if (!h.startsWith("#")) h = `#${h}`
    if (h.length === 4) {
        // expand #abc
        h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`
    }
    return h.toLowerCase()
}

export function normalizeHex(hex: string | undefined | null): string {
    const h = ensureHashHex(hex)
    return h.slice(0, 7)
}

// Color conversions
export function hexToRgb(hex: string): RGB {
    const h = normalizeHex(hex).replace("#", "")
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    return { r, g, b }
}

export function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function rgbToHsl(r: number, g: number, b: number): HSL {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2
    if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0)
                break
            case g:
                h = (b - r) / d + 2
                break
            case b:
                h = (r - g) / d + 4
                break
        }
        h /= 6
    }
    return { h: h * 360, s: s * 100, l: l * 100 }
}

export function hslToRgb(h: number, s: number, l: number): RGB {
    // Convert from 0-360, 0-100, 0-100 to 0-1, 0-1, 0-1
    h = h / 360
    s = s / 100
    l = l / 100

    if (s === 0) {
        const v = l * 255
        return { r: v, g: v, b: v }
    }

    const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    const r = hue2rgb(p, q, h + 1 / 3)
    const g = hue2rgb(p, q, h)
    const b = hue2rgb(p, q, h - 1 / 3)

    return { r: r * 255, g: g * 255, b: b * 255 }
}

// Color utilities
export function getContrastText(hex: string): string {
    const { r, g, b } = hexToRgb(hex)
    // Relative luminance
    const [R, G, B] = [r, g, b].map((v) => {
        const c = v / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    const L = 0.2126 * R + 0.7152 * G + 0.0722 * B
    return L > 0.5 ? "#111111" : "#ffffff"
}

export function generateRandomColor(): string {
    const hue = Math.floor(Math.random() * 360)
    const saturation = 50 + Math.floor(Math.random() * 30) // 50-80%
    const lightness = 40 + Math.floor(Math.random() * 20) // 40-60%

    const { r, g, b } = hslToRgb(hue, saturation, lightness)
    return rgbToHex(r, g, b)
}

export function generateShades(baseHex: string): Record<ShadeKey, string> {
    const base = normalizeHex(baseHex)
    const rgb = hexToRgb(base)
    const { h, s: baseSat, l: baseLight } = rgbToHsl(rgb.r, rgb.g, rgb.b)

    // Find the closest shade position for the base color
    let baseShadeKey = "500" as ShadeKey // Default middle position
    let minDiff = 100
    const standardLightness: Record<ShadeKey, number> = {
        "50": 97,
        "100": 94,
        "200": 88,
        "300": 81,
        "400": 69,
        "500": 56,
        "600": 48,
        "700": 40,
        "800": 32,
        "900": 25,
        "950": 15,
    }

    // For very light colors (like #FFFFFF), force them to the 50 position
    if (baseLight > 95) {
        baseShadeKey = "50"
    }
    // For very dark colors, force them to the 950 position
    else if (baseLight < 10) {
        baseShadeKey = "950"
    }
    // For other colors, find the closest shade position
    else {
        for (const [shade, targetLight] of Object.entries(standardLightness)) {
            const diff = Math.abs(baseLight - targetLight)
            if (diff < minDiff) {
                minDiff = diff
                baseShadeKey = shade as ShadeKey
            }
        }
    }

    // Check if this is a neutral color (very low saturation)
    const isNeutral = baseSat < 5

    // Generate a smooth gradient centered around the base color
    const colors = {} as Record<ShadeKey, string>

    // For very light colors (like #FFFFFF), we need to create a gradient from light to dark
    if (baseLight > 90) {
        // Start from very light and go to dark
        const lightShades = [97, 94, 88, 81, 69, 56, 48, 40, 32, 25, 15]
        for (let i = 0; i < SHADE_KEYS.length; i++) {
            // For neutral colors, keep saturation very low to maintain neutrality
            const saturation = isNeutral ? Math.max(0, Math.min(2, baseSat)) : Math.max(5, baseSat + (i * 2))
            const { r, g, b } = hslToRgb(h, saturation, lightShades[i])
            colors[SHADE_KEYS[i]] = rgbToHex(r, g, b)
        }
    }
    // For very dark colors, we need to create a gradient from dark to light
    else if (baseLight < 20) {
        // Start from dark and go to light
        const darkShades = [15, 25, 32, 40, 48, 56, 69, 81, 88, 94, 97]
        for (let i = 0; i < SHADE_KEYS.length; i++) {
            // For neutral colors, keep saturation very low to maintain neutrality
            const saturation = isNeutral ? Math.max(0, Math.min(2, baseSat)) : Math.max(5, baseSat + (i * 2))
            const { r, g, b } = hslToRgb(h, saturation, darkShades[i])
            colors[SHADE_KEYS[i]] = rgbToHex(r, g, b)
        }
    }
    // For mid-tone colors, create a gradient that places the base color in its natural position
    else {
        // Calculate the position of the base color in the gradient
        const targetLight = standardLightness[baseShadeKey]
        const lightDiff = baseLight - targetLight

        // Generate shades with the base color in its natural position
        for (let i = 0; i < SHADE_KEYS.length; i++) {
            const standardLight = standardLightness[SHADE_KEYS[i]]

            // Adjust the lightness to maintain the base color's position
            let adjustedLight = standardLight + lightDiff

            // Ensure we don't exceed bounds
            adjustedLight = Math.max(2, Math.min(98, adjustedLight))

            // For neutral colors, keep saturation very low to maintain neutrality
            const satAdjust = isNeutral
                ? Math.max(0, Math.min(2, baseSat))
                : Math.max(5, Math.min(100, baseSat + (i * 1.5)))

            const { r, g, b } = hslToRgb(h, satAdjust, adjustedLight)
            colors[SHADE_KEYS[i]] = rgbToHex(r, g, b)
        }
    }

    // Ensure the exact base color is used in its target position
    colors[baseShadeKey] = base

    return colors
}

// Color parsing utilities for CSS import
export function parseColorValue(value: string): string | null {
    const cleanValue = value.trim()

    // Direct hex colors
    const hexMatch = cleanValue.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
    if (hexMatch) {
        return normalizeHex(cleanValue)
    }

    // RGB/RGBA colors
    const rgbMatch = cleanValue.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*[\d.]+)?\s*\)/)
    if (rgbMatch) {
        const [, r, g, b] = rgbMatch
        return rgbToHex(parseInt(r), parseInt(g), parseInt(b))
    }

    // HSL/HSLA colors
    const hslMatch = cleanValue.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%(?:\s*,\s*[\d.]+)?\s*\)/)
    if (hslMatch) {
        const [, h, s, l] = hslMatch
        const { r, g, b } = hslToRgb(parseInt(h), parseInt(s), parseInt(l))
        return rgbToHex(r, g, b)
    }

    // CSS color keywords
    const namedColors: { [key: string]: string } = {
        'red': '#ff0000', 'green': '#008000', 'blue': '#0000ff', 'white': '#ffffff', 'black': '#000000',
        'gray': '#808080', 'grey': '#808080', 'silver': '#c0c0c0', 'maroon': '#800000', 'navy': '#000080',
        'aqua': '#00ffff', 'teal': '#008080', 'lime': '#00ff00', 'olive': '#808000', 'yellow': '#ffff00',
        'fuchsia': '#ff00ff', 'purple': '#800080', 'orange': '#ffa500', 'pink': '#ffc0cb', 'brown': '#a52a2a',
        'cyan': '#00ffff', 'magenta': '#ff00ff', 'tan': '#d2b48c', 'beige': '#f5f5dc', 'gold': '#ffd700',
        'coral': '#ff7f50', 'salmon': '#fa8072', 'khaki': '#f0e68c', 'violet': '#ee82ee', 'indigo': '#4b0082'
    }

    const lowerValue = cleanValue.toLowerCase()
    if (namedColors[lowerValue]) {
        return namedColors[lowerValue]
    }

    // CSS variable references - we'll skip these for now
    if (cleanValue.startsWith('var(')) {
        return null
    }

    return null
}

export function assignShadeByLightness(hex: string): string {
    const { r, g, b } = hexToRgb(hex)
    const { l } = rgbToHsl(r, g, b)

    // Assign shade based on lightness
    if (l >= 95) return '50'
    if (l >= 90) return '100'
    if (l >= 80) return '200'
    if (l >= 70) return '300'
    if (l >= 60) return '400'
    if (l >= 50) return '500'
    if (l >= 40) return '600'
    if (l >= 30) return '700'
    if (l >= 20) return '800'
    if (l >= 10) return '900'
    return '950'
} 