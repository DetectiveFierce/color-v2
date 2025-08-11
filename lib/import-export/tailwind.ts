"use client"

import type { Palette } from "../core/types"

function slugify(input: string): string {
    return input.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

export function paletteToTailwindSnippet(p: Palette): string {
    const key = slugify(p.name)
    const colorBlocks = p.baseColors.map((baseColor) => {
        const colorKey = slugify(baseColor.name)
        const pairs = baseColor.shades.map((shade) => `      "${shade.shade}": "${shade.hex}"`).join(",\n")
        return `  "${colorKey}": {
${pairs}
}`
    }).join(",\n")

    return `// Paste into theme.extend.colors in tailwind.config.ts
// e.g. export default { theme: { extend: { colors: /* here */ } } }
"${key}": {
${colorBlocks}
}`
}

export function mergePalettesToTailwindSnippet(palettes: Palette[]): string {
    const blocks = palettes.map((p) => paletteToTailwindSnippet(p))
    return `// Paste into theme.extend.colors in tailwind.config.ts
{
${blocks
            .map((b) =>
                b
                    .split("\n")
                    .slice(2)
                    .join("\n")
            )
            .join(",\n")}
}`
} 