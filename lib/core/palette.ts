"use client"

import type { Palette, BaseColor, Shade } from "./types"
import { SHADE_KEYS } from "./types"
import { generateShades, generateRandomColor } from "./color"

export function createEmptyPalette(name: string = "New Palette"): Palette {
    const now = Date.now()
    const baseColor = createBaseColor("Primary", "#14b8a6")

    return {
        id: crypto.randomUUID(),
        name,
        description: "",
        baseColors: [baseColor],
        createdAt: now,
        updatedAt: now,
    }
}

export function createPaletteWithRandomColor(name: string = "New Palette"): Palette {
    const now = Date.now()
    const randomColor = generateRandomColor()
    const baseColor = createBaseColor("Primary", randomColor)

    return {
        id: crypto.randomUUID(),
        name,
        description: "",
        baseColors: [baseColor],
        createdAt: now,
        updatedAt: now,
    }
}

export function defaultStarterPalettes(): Palette[] {
    const now = Date.now()

    return [
        {
            id: crypto.randomUUID(),
            name: "Brand & Marketing",
            description: "Combined brand and marketing palette",
            baseColors: [
                createBaseColor("Brand", "#7c3aed"),
                createBaseColor("Marketing", "#ef4444"),
            ],
            createdAt: now,
            updatedAt: now,
        },
    ]
}

export function duplicatePalette(palette: Palette, newName?: string): Palette {
    const now = Date.now()

    return {
        ...palette,
        id: crypto.randomUUID(),
        name: newName || `${palette.name} Copy`,
        baseColors: palette.baseColors.map(color => ({
            ...color,
            id: crypto.randomUUID()
        })),
        createdAt: now,
        updatedAt: now,
    }
}

export function addBaseColorToPalette(palette: Palette): Palette {
    const randomColor = generateRandomColor()
    const newColor = createBaseColor(`Color ${palette.baseColors.length + 1}`, randomColor)

    return {
        ...palette,
        baseColors: [...palette.baseColors, newColor],
        updatedAt: Date.now(),
    }
}

export function removeBaseColorFromPalette(palette: Palette, colorId: string): Palette {
    return {
        ...palette,
        baseColors: palette.baseColors.filter(c => c.id !== colorId),
        updatedAt: Date.now(),
    }
}

export function updateBaseColorInPalette(
    palette: Palette,
    colorId: string,
    updates: Partial<BaseColor>
): Palette {
    return {
        ...palette,
        baseColors: palette.baseColors.map(color => {
            if (color.id === colorId) {
                const updated = { ...color, ...updates }
                // Regenerate shades if baseHex changed
                if (updates.baseHex && updates.baseHex !== color.baseHex) {
                    updated.shades = createShadesFromHex(updates.baseHex)
                }
                return updated
            }
            return color
        }),
        updatedAt: Date.now(),
    }
}

export function updatePaletteMeta(
    palette: Palette,
    updates: { name?: string; description?: string }
): Palette {
    return {
        ...palette,
        ...updates,
        updatedAt: Date.now(),
    }
}

// Helper function to create a BaseColor with the new structure
export function createBaseColor(name: string, baseHex: string): BaseColor {
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

// Helper function to create shades array from hex
export function createShadesFromHex(baseHex: string): Shade[] {
    const oldShades = generateShades(baseHex)
    return SHADE_KEYS.map(key => ({
        shade: parseInt(key),
        hex: oldShades[key]
    }))
} 