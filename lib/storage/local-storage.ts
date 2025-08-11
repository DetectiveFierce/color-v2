"use client"

import { type Palette } from "../core/types"

const STORAGE_KEY = "v0_palette_manager_v1"

export function getAllPalettes(): Palette[] {
    if (typeof window === "undefined") return []
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        return parsed as Palette[]
    } catch {
        return []
    }
}

export function saveAllPalettes(palettes: Palette[]) {
    if (typeof window === "undefined") return
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(palettes))
    } catch {
        // ignore
    }
} 