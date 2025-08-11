"use client"

import type { Palette } from "../core/types"
import { SHADE_KEYS } from "../core/types"
import { ensureHashHex } from "../core/color"

export function palettesToJson(palettes: Palette[]): string {
    return JSON.stringify(
        palettes.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description || "",
            baseColors: p.baseColors,
            updatedAt: p.updatedAt,
            cssSource: p.cssSource,
        })),
        null,
        2
    )
}

export function parsePalettesJson(json: string): Palette[] {
    const arr = JSON.parse(json)
    if (!Array.isArray(arr)) throw new Error("Invalid palettes")
    return arr.map((p: unknown) => {
        const palette = p as Record<string, unknown>

        // Handle both old string format and new object format for cssSource
        let cssSource: any = undefined
        if (palette.cssSource) {
            if (typeof palette.cssSource === 'string') {
                // Old format - convert to new format
                cssSource = {
                    content: palette.cssSource,
                    filename: 'imported.css',
                    lastUpdated: Date.now()
                }
            } else {
                // New format - validate and use as is
                const cssSourceObj = palette.cssSource as Record<string, unknown>
                if (cssSourceObj.content && cssSourceObj.filename) {
                    cssSource = {
                        content: String(cssSourceObj.content),
                        filename: String(cssSourceObj.filename),
                        lastUpdated: Number(cssSourceObj.lastUpdated || Date.now())
                    }
                }
            }
        }

        return {
            id: (palette.id as string) || crypto.randomUUID(),
            name: String(palette.name || "Imported"),
            description: String(palette.description || ""),
            baseColors: Array.isArray(palette.baseColors) ? (palette.baseColors as unknown[]).map((bc: unknown) => {
                const baseColor = bc as Record<string, unknown>
                return {
                    id: (baseColor.id as string) || crypto.randomUUID(),
                    name: String(baseColor.name || "Color"),
                    hex: ensureHashHex((baseColor.hex as string) || "#888888"),
                    shades: Object.fromEntries(SHADE_KEYS.map((k) => [k, ensureHashHex((baseColor.shades as Record<string, string>)?.[k] || "#888888")])),
                }
            }) : [{
                id: crypto.randomUUID(),
                name: "Primary",
                hex: ensureHashHex((palette.colors as Record<string, string>)?.["500"] || "#888888"),
                shades: Object.fromEntries(SHADE_KEYS.map((k) => [k, ensureHashHex((palette.colors as Record<string, string>)?.[k] || "#888888")])),
            }],
            updatedAt: Number(palette.updatedAt || Date.now()),
            cssSource: cssSource,
        }
    }) as Palette[]
} 