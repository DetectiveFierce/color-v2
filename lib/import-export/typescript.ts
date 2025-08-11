"use client"

import type { Palette } from "../core/types"
import { SHADE_KEYS } from "../core/types"

function slugify(input: string): string {
    return input.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

function toTypeScriptIdentifier(input: string): string {
    // Convert to PascalCase and ensure it starts with a letter or underscore
    const parts = input.trim().replace(/[^a-zA-Z0-9]+/g, " ").split(/\s+/).filter(Boolean)
    let ident = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join("")
    if (!ident) ident = "Palette"
    if (!/^[A-Za-z_]/.test(ident)) ident = "_" + ident
    return ident
}

export function paletteToTypeScriptTheme(palette: Palette): string {
    const varName = toTypeScriptIdentifier(palette.name || "Palette")

    const colorBlocks = palette.baseColors.map((baseColor) => {
        const colorKey = slugify(baseColor.name || "color")
        const pairs = SHADE_KEYS.map((k) => `      "${k}": "${baseColor.shades[k]}"`).join(",\n")
        return `    "${colorKey}": {\n${pairs}\n    }`
    }).join(",\n")

    return `// Generated TypeScript theme for ${palette.name}\nexport const ${varName} = {\n  colors: {\n${colorBlocks}\n  }\n} as const\n\nexport type ${varName}Theme = typeof ${varName}`
} 