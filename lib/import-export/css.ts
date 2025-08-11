"use client"

import type { Palette, BaseColor, ShadeKey, CssSource } from "../core/types"
import { SHADE_KEYS } from "../core/types"
import { parseColorValue, assignShadeByLightness, generateShades, ensureHashHex } from "../core/color"

function slugify(input: string): string {
    return input.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

export function paletteToCssVarsSnippet(p: Palette): string {
    const key = slugify(p.name)
    const vars = p.baseColors.flatMap((baseColor) => {
        const colorKey = slugify(baseColor.name)
        return SHADE_KEYS.map((k) => `  --${key}-${colorKey}-${k}: ${baseColor.shades[k]};`)
    }).join("\n")

    return `:root {
${vars}
}

/* usage */
.selector {
  /* background-color: var(--${key}-primary-500); */
}`
}

interface ColorMatch {
    name: string
    value: string
    type: 'css-var' | 'sass-var' | 'property' | 'class-based'
    context?: string
    selector?: string
}

export function parseCssForColors(cssContent: string): { [key: string]: { [shade: string]: string } } {
    const colors: { [key: string]: { [shade: string]: string } } = {}
    const colorMatches: ColorMatch[] = []

    // Clean and normalize CSS content
    const cleanCss = normalizeCssContent(cssContent)

    // Parse different types of color definitions
    parseAllColorTypes(cleanCss, colorMatches)

    // Organize colors into groups with shades
    organizeColorMatches(colorMatches, colors)

    return colors
}

function normalizeCssContent(cssContent: string): string {
    return cssContent
        // Remove comments more thoroughly
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '')
        // Handle CSS at-rules that might contain colors
        .replace(/@media[^{]*\{/g, (match) => match + '\n')
        .replace(/@keyframes[^{]*\{/g, (match) => match + '\n')
        // Normalize whitespace but preserve structure
        .replace(/\s*\{\s*/g, ' { ')
        .replace(/\s*\}\s*/g, ' } ')
        .replace(/\s*;\s*/g, '; ')
        .replace(/\s*:\s*/g, ': ')
        .replace(/\s+/g, ' ')
        .trim()
}

function parseAllColorTypes(cssContent: string, colorMatches: ColorMatch[]) {
    // Parse CSS custom properties with better context awareness
    parseCssVariables(cssContent, colorMatches)

    // Parse Sass/SCSS variables
    parseSassVariables(cssContent, colorMatches)

    // Parse CSS properties in rules
    parseRuleColors(cssContent, colorMatches)

    // Parse utility class patterns (Tailwind, Bootstrap, etc.)
    parseUtilityClassColors(cssContent, colorMatches)

    // Parse CSS-in-JS patterns
    parseCssInJsColors(cssContent, colorMatches)
}

function parseCssVariables(cssContent: string, colorMatches: ColorMatch[]) {
    // Enhanced regex for CSS custom properties with better capture
    const variableRegex = /--([a-zA-Z][\w-]*?)\s*:\s*([^;{}]+)(?=\s*[;}])/g

    let match
    while ((match = variableRegex.exec(cssContent)) !== null) {
        const [, varName, varValue] = match
        const colorValue = parseColorValue(varValue.trim())

        if (colorValue) {
            colorMatches.push({
                name: varName,
                value: colorValue,
                type: 'css-var',
                context: 'root'
            })
        }
    }

    // Also parse CSS variables within specific selectors
    const selectorVariableRegex = /([^{}]+)\s*\{\s*([^{}]*?)--([a-zA-Z][\w-]*?)\s*:\s*([^;{}]+)(?=\s*[;}])/g

    let selectorMatch
    while ((selectorMatch = selectorVariableRegex.exec(cssContent)) !== null) {
        const [, selector, , varName, varValue] = selectorMatch
        const colorValue = parseColorValue(varValue.trim())

        if (colorValue) {
            colorMatches.push({
                name: varName,
                value: colorValue,
                type: 'css-var',
                context: selector.trim(),
                selector: selector.trim()
            })
        }
    }
}

function parseSassVariables(cssContent: string, colorMatches: ColorMatch[]) {
    // Parse Sass/SCSS variables with support for nested values
    const sassVarRegex = /\$([a-zA-Z][\w-]*?)\s*:\s*([^;{}]+?)(?=\s*[!;])/g

    let match
    while ((match = sassVarRegex.exec(cssContent)) !== null) {
        const [, varName, varValue] = match

        // Handle Sass variable references
        let resolvedValue = varValue.trim()
        if (resolvedValue.startsWith('$')) {
            // This references another variable - we'll resolve it later
            continue
        }

        const colorValue = parseColorValue(resolvedValue)
        if (colorValue) {
            colorMatches.push({
                name: varName,
                value: colorValue,
                type: 'sass-var'
            })
        }
    }

    // Parse Sass maps for colors
    const sassMapRegex = /\$([a-zA-Z][\w-]*?)\s*:\s*\(\s*([\s\S]*?)\s*\)\s*;/g

    let mapMatch
    while ((mapMatch = sassMapRegex.exec(cssContent)) !== null) {
        const [, mapName, mapContent] = mapMatch

        // Parse key-value pairs in the map
        const keyValueRegex = /(['"]?)([^'":,\s]+)\1\s*:\s*([^,)]+)/g
        let kvMatch

        while ((kvMatch = keyValueRegex.exec(mapContent)) !== null) {
            const [, , key, value] = kvMatch
            const colorValue = parseColorValue(value.trim())

            if (colorValue) {
                colorMatches.push({
                    name: `${mapName}-${key}`,
                    value: colorValue,
                    type: 'sass-var',
                    context: 'map'
                })
            }
        }
    }
}

function parseRuleColors(cssContent: string, colorMatches: ColorMatch[]) {
    // More comprehensive rule parsing with better selector handling
    const ruleRegex = /([^{}]+?)\s*\{\s*([^{}]*?)\}/g
    const colorProps = [
        'color', 'background-color', 'background', 'border-color',
        'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
        'outline-color', 'text-decoration-color', 'column-rule-color',
        'fill', 'stroke', 'stop-color', 'flood-color', 'lighting-color'
    ]

    let ruleMatch
    while ((ruleMatch = ruleRegex.exec(cssContent)) !== null) {
        const [, selector, declarations] = ruleMatch
        const cleanSelector = selector.trim()

        // Skip keyframe rules and other special cases
        if (cleanSelector.includes('%') || cleanSelector.includes('from') || cleanSelector.includes('to')) {
            continue
        }

        for (const prop of colorProps) {
            const propRegex = new RegExp(`${prop.replace('-', '\\-')}\\s*:\\s*([^;{}]+?)(?=\\s*[;}])`, 'gi')
            let propMatch

            while ((propMatch = propRegex.exec(declarations)) !== null) {
                const rawValue = propMatch[1].trim()

                // Skip CSS variables and functions for now (handle separately)
                if (rawValue.startsWith('var(') || rawValue.startsWith('calc(')) {
                    continue
                }

                const colorValue = parseColorValue(rawValue)
                if (colorValue) {
                    const colorName = extractColorNameFromRule(cleanSelector, prop, rawValue)
                    if (colorName) {
                        colorMatches.push({
                            name: colorName,
                            value: colorValue,
                            type: 'property',
                            selector: cleanSelector,
                            context: prop
                        })
                    }
                }
            }
        }
    }
}

function parseUtilityClassColors(cssContent: string, colorMatches: ColorMatch[]) {
    // Parse utility classes like Tailwind
    const utilityPatterns = [
        // Tailwind-style utilities
        /\.(?:bg|text|border|ring|outline|decoration|divide|placeholder|caret|accent|fill|stroke)-([a-z]+)(-\d+)?\s*\{\s*[^}]*?(?:background-color|color|border-color|outline-color|text-decoration-color|fill|stroke)\s*:\s*([^;{}]+)/g,

        // Bootstrap-style utilities
        /\.(?:bg|text|border)-([a-z]+)\s*\{\s*[^}]*?(?:background-color|color|border-color)\s*:\s*([^;{}]+)/g
    ]

    for (const pattern of utilityPatterns) {
        let match
        while ((match = pattern.exec(cssContent)) !== null) {
            const colorValue = parseColorValue(match[match.length - 1].trim())
            if (colorValue) {
                const colorName = match[1]
                const shade = match[2] ? match[2].slice(1) : null // Remove the dash

                colorMatches.push({
                    name: shade ? `${colorName}-${shade}` : colorName,
                    value: colorValue,
                    type: 'class-based',
                    context: 'utility'
                })
            }
        }
    }
}

function parseCssInJsColors(cssContent: string, colorMatches: ColorMatch[]) {
    // Parse CSS-in-JS style objects (basic support)
    const cssInJsRegex = /(['"]?)([a-zA-Z][a-zA-Z0-9]*)\1\s*:\s*['"]([^'"]+)['"]/g

    let match
    while ((match = cssInJsRegex.exec(cssContent)) !== null) {
        const [, , propName, value] = match

        // Check if it's likely a color property
        if (propName.toLowerCase().includes('color') || propName.toLowerCase().includes('background')) {
            const colorValue = parseColorValue(value)
            if (colorValue) {
                colorMatches.push({
                    name: propName,
                    value: colorValue,
                    type: 'property',
                    context: 'css-in-js'
                })
            }
        }
    }
}

function extractColorNameFromRule(selector: string, property: string, colorValue: string): string | null {
    // Clean and analyze the selector to extract meaningful color names
    const cleanSelector = selector
        .replace(/[.#:]/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/hover|focus|active|visited|disabled|before|after|first|last|nth/gi, '')
        .trim()

    // Skip overly generic selectors
    if (['body', 'html', '*', 'div', 'span', 'p', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(cleanSelector.toLowerCase())) {
        return null
    }

    // Extract meaningful class/id names
    const parts = cleanSelector.split(/\s+/).filter(part => part.length > 2)

    for (const part of parts) {
        if (/^[a-zA-Z]/.test(part)) {
            // Convert camelCase to kebab-case
            const name = part
                .replace(/([a-z])([A-Z])/g, '$1-$2')
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, '')

            if (name.length > 1) {
                // Add property context if it helps distinguish
                const propertyPrefix = property.includes('background') ? 'bg' :
                    property.includes('border') ? 'border' :
                        property.includes('text') || property === 'color' ? 'text' : ''

                return propertyPrefix ? `${propertyPrefix}-${name}` : name
            }
        }
    }

    return null
}

function organizeColorMatches(colorMatches: ColorMatch[], colors: { [key: string]: { [shade: string]: string } }) {
    const colorGroups = new Map<string, Map<string, string>>()
    const processedColors = new Set<string>()

    // First pass: group colors by base name and explicit shades
    for (const match of colorMatches) {
        const { colorName, shade } = extractColorAndShade(match.name)

        if (!colorGroups.has(colorName)) {
            colorGroups.set(colorName, new Map())
        }

        const group = colorGroups.get(colorName)!
        const finalShade = shade && SHADE_KEYS.includes(shade as ShadeKey) ? shade : assignShadeByLightness(match.value)

        // Avoid duplicates - prefer more specific matches
        const key = `${colorName}-${finalShade}`
        if (!processedColors.has(key) || match.type === 'css-var' || match.type === 'sass-var') {
            group.set(finalShade, match.value)
            processedColors.add(key)
        }
    }

    // Second pass: resolve similar colors and fill gaps
    for (const [colorName, shadeMap] of colorGroups.entries()) {
        if (shadeMap.size === 0) continue

        // Find the best base color for generating missing shades
        const baseShade = shadeMap.get('500') ||
            shadeMap.get('600') ||
            shadeMap.get('400') ||
            Array.from(shadeMap.values())[0]

        if (baseShade) {
            // Generate complete shade set
            const generatedShades = generateShades(baseShade)

            // Merge with existing shades (prefer existing)
            const finalShades: { [key: string]: string } = {}

            for (const shadeKey of SHADE_KEYS) {
                finalShades[shadeKey] = shadeMap.get(shadeKey) || generatedShades[shadeKey]
            }

            colors[colorName] = finalShades
        }
    }
}

function extractColorAndShade(varName: string): { colorName: string; shade: string | null } {
    // More sophisticated color and shade extraction
    const cleanName = varName
        .replace(/^(color|clr|bg|background|border|text|fill|stroke|primary|secondary|accent|surface|on)-?/i, '')
        .replace(/^(tw|tailwind|bs|bootstrap|mui|material)-?/i, '')
        .replace(/-?(color|clr)$/i, '')

    // Enhanced shade pattern matching
    const shadePatterns = [
        // Standard numeric shades: 50, 100, 200, etc.
        /^(.+?)-?([0-9]{2,3})$/,
        // Word-based shades
        /^(.+?)-(light|dark|lighter|darker|lightest|darkest|pale|deep|bright|muted)$/i,
        // A-prefixed shades (A100, A200, etc.)
        /^(.+?)-?A?([0-9]{3})$/,
    ]

    for (const pattern of shadePatterns) {
        const match = cleanName.match(pattern)
        if (match) {
            const [, baseName, shade] = match
            const normalizedShade = normalizeShade(shade)

            return {
                colorName: (baseName || 'color').replace(/-+/g, '-').replace(/^-|-$/g, ''),
                shade: normalizedShade
            }
        }
    }

    // Check for implicit shade indicators
    const implicitShades: { [key: string]: string } = {
        'lightest': '50', 'lighter': '200', 'light': '300',
        'dark': '700', 'darker': '800', 'darkest': '900',
        'primary': '500', 'secondary': '600', 'accent': '500',
        'main': '500', 'base': '500', 'default': '500'
    }

    const lowerName = cleanName.toLowerCase()
    for (const [pattern, shade] of Object.entries(implicitShades)) {
        if (lowerName.includes(pattern)) {
            const baseName = cleanName.replace(new RegExp(pattern, 'i'), '').replace(/-+/g, '-').replace(/^-|-$/g, '')
            return {
                colorName: baseName || pattern,
                shade: shade
            }
        }
    }

    return {
        colorName: cleanName.replace(/-+/g, '-').replace(/^-|-$/g, '') || 'color',
        shade: null
    }
}

function normalizeShade(shade: string): string {
    const shadeMap: { [key: string]: string } = {
        // Word-based shades to numbers
        'lightest': '50',
        'lighter': '200',
        'light': '300',
        'dark': '700',
        'darker': '800',
        'darkest': '900',
        'pale': '100',
        'deep': '800',
        'bright': '400',
        'muted': '600',
        // Material Design A-shades
        'A100': '100',
        'A200': '200',
        'A400': '400',
        'A700': '700'
    }

    const normalized = shadeMap[shade] || shade
    return SHADE_KEYS.includes(normalized as ShadeKey) ? normalized : '500'
}

export function createPaletteFromCss(cssContent: string, name: string, filename?: string): Palette {
    const colorMatches: ColorMatch[] = []
    const colors: { [key: string]: { [shade: string]: string } } = {}

    parseCssVariables(cssContent, colorMatches)
    parseUtilityClassColors(cssContent, colorMatches)
    parseCssInJsColors(cssContent, colorMatches)
    parseSassVariables(cssContent, colorMatches)

    // Organize colors
    organizeColorMatches(colorMatches, colors)

    // Convert to palette format
    const baseColors: BaseColor[] = Object.entries(colors).map(([colorName, shades]) => {
        const baseColor = {
            id: crypto.randomUUID(),
            name: colorName,
            hex: shades["500"] || Object.values(shades)[0] || "#000000",
            shades: {} as Record<ShadeKey, string>,
        }

        // If we have shades, use them; otherwise generate them
        if (Object.keys(shades).length > 1) {
            // Map existing shades
            for (const key of SHADE_KEYS) {
                baseColor.shades[key] = shades[key] || shades["500"] || Object.values(shades)[0]
            }
        } else {
            baseColor.shades = generateShades(baseColor.hex)
        }

        return baseColor
    })

    // Create the palette
    const palette: Palette = {
        id: crypto.randomUUID(),
        name,
        description: `Imported from ${filename || 'CSS'}`,
        baseColors,
        updatedAt: Date.now(),
        cssSource: filename ? {
            content: cssContent,
            filename: filename,
            lastUpdated: Date.now()
        } : undefined
    }

    return palette
}

// New function to check if CSS content has changed and update the palette if needed
export function updatePaletteFromCssIfNeeded(palette: Palette): Palette | null {
    // If no CSS source, nothing to update
    if (!palette.cssSource) return null

    // Create a new palette from the CSS
    const newPalette = createPaletteFromCss(
        palette.cssSource.content,
        palette.name,
        palette.cssSource.filename
    )

    // Compare base colors for changes
    const hasChanges = compareBaseColors(palette.baseColors, newPalette.baseColors)

    if (!hasChanges) return null

    // Return updated palette with preserved metadata
    return {
        ...palette,
        baseColors: newPalette.baseColors,
        updatedAt: Date.now(),
        cssSource: {
            ...palette.cssSource,
            lastUpdated: Date.now()
        }
    }
}

// Helper function to compare base colors
function compareBaseColors(oldColors: BaseColor[], newColors: BaseColor[]): boolean {
    if (oldColors.length !== newColors.length) return true

    return oldColors.some((oldColor, index) => {
        const newColor = newColors[index]
        // Compare hex values and shades
        if (oldColor.hex !== newColor.hex) return true

        return SHADE_KEYS.some(key => oldColor.shades[key] !== newColor.shades[key])
    })
}

export function updateCssWithPalette(css: string, palette: Palette): string {
    if (!palette.cssSource?.content) return css

    for (const baseColor of palette.baseColors) {
        for (const shade of SHADE_KEYS) {
            const newHex = baseColor.shades[shade]
            const originalHex = findOriginalColorForShade(palette.cssSource.content, baseColor.name, shade)

            if (originalHex) {
                const pattern = new RegExp(
                    `((?:color|background-color|background|border-color|fill|stroke)\\s*:\\s*)${escapeRegex(originalHex)}(?=\\s*[;}])`,
                    'gi'
                )
                css = css.replace(pattern, `$1${newHex}`)
            }
        }
    }

    return css
}

function findOriginalColorForShade(cssContent: string, colorName: string, shade: string): string | null {
    const colors = parseCssForColors(cssContent)
    const normalizedName = slugify(colorName)

    for (const [name, shades] of Object.entries(colors)) {
        if (slugify(name) === normalizedName && shades[shade]) {
            return shades[shade]
        }
    }

    return null
}

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}