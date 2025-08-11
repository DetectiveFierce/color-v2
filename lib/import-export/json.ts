"use client"

import type { Palette } from "../core/types"
import { ensureHashHex } from "../core/color"

export function palettesToJson(palettes: Palette[]): string {
    return JSON.stringify(
        palettes.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description || "",
            baseColors: p.baseColors,
            createdAt: p.createdAt,
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
        let cssSource: { content: string; filename: string; lastUpdated: number } | undefined = undefined
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

                // Handle migration from old format to new format
                if (baseColor.hex && !baseColor.baseHex) {
                    // Old format - convert to new format
                    const hex = ensureHashHex((baseColor.hex as string) || "#888888")
                    const shades = (baseColor.shades as Record<string, string>) || {}

                    return {
                        id: (baseColor.id as string) || crypto.randomUUID(),
                        name: String(baseColor.name || "Color"),
                        baseHex: hex,
                        shades: Object.entries(shades).map(([key, value]) => ({
                            shade: parseInt(key),
                            hex: ensureHashHex(value || hex)
                        }))
                    }
                } else {
                    // New format - validate and use as is
                    return {
                        id: (baseColor.id as string) || crypto.randomUUID(),
                        name: String(baseColor.name || "Color"),
                        baseHex: ensureHashHex((baseColor.baseHex as string) || "#888888"),
                        shades: Array.isArray(baseColor.shades) ? (baseColor.shades as unknown[]).map((shade: unknown) => {
                            const shadeObj = shade as Record<string, unknown>
                            return {
                                shade: Number(shadeObj.shade || 500),
                                hex: ensureHashHex((shadeObj.hex as string) || "#888888")
                            }
                        }) : []
                    }
                }
            }) : [{
                id: crypto.randomUUID(),
                name: "Primary",
                baseHex: ensureHashHex((palette.colors as Record<string, string>)?.["500"] || "#888888"),
                shades: Object.entries((palette.colors as Record<string, string>) || {}).map(([key, value]) => ({
                    shade: parseInt(key),
                    hex: ensureHashHex(value || "#888888")
                }))
            }],
            createdAt: Number(palette.createdAt || palette.updatedAt || Date.now()),
            updatedAt: Number(palette.updatedAt || Date.now()),
            cssSource: cssSource,
        }
    }) as Palette[]
} 