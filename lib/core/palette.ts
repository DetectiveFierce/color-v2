"use client"

import type { Palette, BaseColor } from "./types"
import { generateShades, generateRandomColor } from "./color"

export function createEmptyPalette(name: string = "New Palette"): Palette {
    return {
        id: crypto.randomUUID(),
        name,
        description: "",
        baseColors: [
            {
                id: crypto.randomUUID(),
                name: "Primary",
                hex: "#14b8a6",
                shades: generateShades("#14b8a6"),
            }
        ],
        updatedAt: Date.now(),
    }
}

export function createPaletteWithRandomColor(name: string = "New Palette"): Palette {
    const randomColor = generateRandomColor()
    return {
        id: crypto.randomUUID(),
        name,
        description: "",
        baseColors: [
            {
                id: crypto.randomUUID(),
                name: "Primary",
                hex: randomColor,
                shades: generateShades(randomColor),
            }
        ],
        updatedAt: Date.now(),
    }
}

export function defaultStarterPalettes(): Palette[] {
    return [
        {
            id: crypto.randomUUID(),
            name: "Brand & Marketing",
            description: "Combined brand and marketing palette",
            baseColors: [
                {
                    id: crypto.randomUUID(),
                    name: "Brand",
                    hex: "#7c3aed",
                    shades: generateShades("#7c3aed"),
                },
                {
                    id: crypto.randomUUID(),
                    name: "Marketing",
                    hex: "#ef4444",
                    shades: generateShades("#ef4444"),
                }
            ],
            updatedAt: Date.now(),
        },
    ]
}

export function duplicatePalette(palette: Palette, newName?: string): Palette {
    return {
        ...palette,
        id: crypto.randomUUID(),
        name: newName || `${palette.name} Copy`,
        baseColors: palette.baseColors.map(color => ({
            ...color,
            id: crypto.randomUUID()
        })),
        updatedAt: Date.now(),
    }
}

export function addBaseColorToPalette(palette: Palette): Palette {
    const randomColor = generateRandomColor()
    const newColor: BaseColor = {
        id: crypto.randomUUID(),
        name: `Color ${palette.baseColors.length + 1}`,
        hex: randomColor,
        shades: generateShades(randomColor),
    }

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
                // Regenerate shades if hex changed
                if (updates.hex && updates.hex !== color.hex) {
                    updated.shades = generateShades(updates.hex)
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