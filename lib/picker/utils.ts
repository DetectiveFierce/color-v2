import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, normalizeHex, getContrastText } from "@/lib/core/color"
import type { RGB } from "@/lib/core/types"

export function clamp(n: number, min: number, max: number) {
    return Math.min(max, Math.max(min, n))
}

// HSV helpers (for SV panel + Hue slider)
export type HSV = { h: number; s: number; v: number }

export function rgbToHsv(r: number, g: number, b: number): HSV {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    const d = max - min
    let h = 0
    if (d !== 0) {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break
            case g: h = (b - r) / d + 2; break
            default: h = (r - g) / d + 4
        }
        h /= 6
    }
    const s = max === 0 ? 0 : d / max
    const v = max
    return { h: h * 360, s: s * 100, v: v * 100 }
}

export function hsvToRgb(h: number, s: number, v: number): RGB {
    h = (h % 360 + 360) % 360
    s = clamp(s, 0, 100) / 100
    v = clamp(v, 0, 100) / 100
    const c = v * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = v - c
    let rp = 0, gp = 0, bp = 0
    if (0 <= h && h < 60) { rp = c; gp = x; bp = 0 }
    else if (60 <= h && h < 120) { rp = x; gp = c; bp = 0 }
    else if (120 <= h && h < 180) { rp = 0; gp = c; bp = x }
    else if (180 <= h && h < 240) { rp = 0; gp = x; bp = c }
    else if (240 <= h && h < 300) { rp = x; gp = 0; bp = c }
    else { rp = c; gp = 0; bp = x }
    return { r: Math.round((rp + m) * 255), g: Math.round((gp + m) * 255), b: Math.round((bp + m) * 255) }
}

// Harmonies via HSL hue offsets
export function wrapHue(h: number) { return (h % 360 + 360) % 360 }

export function generateHarmonies(baseHex: string) {
    const { r, g, b } = hexToRgb(baseHex)
    const { h, s, l } = rgbToHsl(r, g, b)
    const toHex = (hh: number, ss = s, ll = l) => {
        const { r: rr, g: gg, b: bb } = hslToRgb(wrapHue(hh), clamp(ss, 0, 100), clamp(ll, 0, 100))
        return rgbToHex(rr, gg, bb)
    }
    return {
        complementary: [toHex(h), toHex(h + 180)],
        analogous: [toHex(h - 30), toHex(h), toHex(h + 30)],
        triadic: [toHex(h), toHex(h + 120), toHex(h + 240)],
        tetradic: [toHex(h), toHex(h + 90), toHex(h + 180), toHex(h + 270)],
    }
}

// Simple tints/tones helpers using HSL
export function generateTints(hex: string, steps = 5): string[] {
    const { r, g, b } = hexToRgb(hex)
    const { h, s, l } = rgbToHsl(r, g, b)
    const result: string[] = []
    for (let i = 1; i <= steps; i++) {
        const ll = clamp(l + (100 - l) * (i / (steps + 1)), 0, 100)
        const { r: rr, g: gg, b: bb } = hslToRgb(h, s, ll)
        result.push(rgbToHex(rr, gg, bb))
    }
    return result
}

export function generateShadesOnly(hex: string, steps = 5): string[] {
    const { r, g, b } = hexToRgb(hex)
    const { h, s, l } = rgbToHsl(r, g, b)
    const result: string[] = []
    for (let i = 1; i <= steps; i++) {
        const ll = clamp(l - l * (i / (steps + 1)), 0, 100)
        const { r: rr, g: gg, b: bb } = hslToRgb(h, s, ll)
        result.push(rgbToHex(rr, gg, bb))
    }
    return result
}

export function generateTones(hex: string, steps = 5): string[] {
    const { r, g, b } = hexToRgb(hex)
    const { h, s, l } = rgbToHsl(r, g, b)
    const result: string[] = []
    for (let i = 1; i <= steps; i++) {
        const ss = clamp(s - s * (i / (steps + 1)), 0, 100)
        const { r: rr, g: gg, b: bb } = hslToRgb(h, ss, l)
        result.push(rgbToHex(rr, gg, bb))
    }
    return result
}

// Contrast helpers
export function relativeLuminance({ r, g, b }: RGB) {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

export function contrastRatio(hex1: string, hex2: string) {
    const l1 = relativeLuminance(hexToRgb(hex1))
    const l2 = relativeLuminance(hexToRgb(hex2))
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)
}

export function swatchStyle(hex: string) {
    return { backgroundColor: hex, color: getContrastText(hex) }
}
