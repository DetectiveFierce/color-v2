"use client"

import { type Palette, type BaseColor, type Shade, SHADE_KEYS } from "../core/types"
import { generateShades } from "../core/color"

const OLD_STORAGE_KEY = "v0_palette_manager_v1"
const NEW_STORAGE_KEY = "color-palettes-v2"

// Migration function to create the new example palette
function createExamplePalette(): Palette {
    const now = Date.now()
    
    const createBaseColor = (name: string, baseHex: string): BaseColor => {
        const oldShades = generateShades(baseHex)
        const shades: Shade[] = SHADE_KEYS.map(key => ({
            shade: parseInt(key),
            hex: oldShades[key]
        }))
        
        return {
            id: crypto.randomUUID(),
            name,
            baseHex,
            shades
        }
    }
    
    return {
        id: crypto.randomUUID(),
        name: "Neon Nightlife",
        description: "A vibrant palette inspired by cyberpunk aesthetics and electric energy. Perfect for bold, futuristic designs.",
        createdAt: now,
        updatedAt: now,
        baseColors: [
            createBaseColor("Electric Pink", "#ff0080"),
            createBaseColor("Cyber Blue", "#00ffff"),
            createBaseColor("Laser Green", "#00ff41"),
            createBaseColor("Neon Purple", "#8a2be2"),
            createBaseColor("Electric Orange", "#ff6b35")
        ]
    }
}

// Migration function to handle the transition
function migrateStorage(): void {
    if (typeof window === "undefined") return
    
    try {
        // Check for old data
        const oldData = localStorage.getItem(OLD_STORAGE_KEY)
        
        // Delete old data if it exists
        if (oldData) {
            localStorage.removeItem(OLD_STORAGE_KEY)
            console.log("Migrated from old storage format")
        }
        
        // Check if new data already exists
        const existingNewData = localStorage.getItem(NEW_STORAGE_KEY)
        if (existingNewData) {
            return // Already migrated
        }
        
        // Create and save new example palette
        const examplePalette = createExamplePalette()
        localStorage.setItem(NEW_STORAGE_KEY, JSON.stringify([examplePalette]))
        console.log("Created new example palette")
        
    } catch (error) {
        console.error("Migration failed:", error)
    }
}

export function getAllPalettes(): Palette[] {
    if (typeof window === "undefined") return []
    
    // Run migration on first access
    migrateStorage()
    
    try {
        const raw = localStorage.getItem(NEW_STORAGE_KEY)
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
        localStorage.setItem(NEW_STORAGE_KEY, JSON.stringify(palettes))
    } catch {
        // ignore
    }
} 