import { type Palette, type BaseColor } from "./types"
import { SHADE_KEYS } from "./types"
import { generateRandomColor, generateShades, hexToRgb, rgbToHsl, hslToRgb, rgbToHex } from "./color"

export interface PaletteGenerationOptions {
    harmonyType?: 'analogous' | 'triadic' | 'tetradic' | 'complementary' | 'monochromatic' | 'random'
    numColors?: number
    baseColor?: string
}

export function generatePaletteName(colors: string[]): string {
    if (colors.length === 0) return "New Palette"

    // Analyze the base color (first color) to determine the harmony base
    const baseColor = colors[0]
    const { r, g, b } = hexToRgb(baseColor)
    const { h, s } = rgbToHsl(r, g, b)

    // Calculate palette characteristics
    const colorAnalyses = colors.map(color => {
        const { r, g, b } = hexToRgb(color)
        const { h, s, l } = rgbToHsl(r, g, b)
        return { hue: h, saturation: s, lightness: l, hex: color }
    })

    const hueRange = Math.max(...colorAnalyses.map(c => c.hue)) - Math.min(...colorAnalyses.map(c => c.hue))

    // Get harmony type based on hue distribution
    const getHarmonyType = () => {
        if (hueRange < 30) return 'Monochromatic'
        if (hueRange < 90) return 'Analogous'
        if (hueRange > 150 && hueRange < 210) return 'Complementary'
        if (colors.length === 3 && hueRange > 100) return 'Triadic'
        if (colors.length === 4 && hueRange > 200) return 'Tetradic'
        return 'Mixed'
    }

    // Get base color name
    const getBaseColorName = (hue: number, saturation: number) => {
        // Red spectrum (0-30°)
        if (hue >= 0 && hue < 15) {
            return saturation > 70 ? 'Crimson' : 'Rust'
        } else if (hue >= 15 && hue < 30) {
            return saturation > 70 ? 'Coral' : 'Terra'
        }
        // Orange spectrum (30-45°)
        else if (hue >= 30 && hue < 45) {
            return saturation > 70 ? 'Amber' : 'Marmalade'
        }
        // Yellow-Orange spectrum (45-60°)
        else if (hue >= 45 && hue < 60) {
            return saturation > 70 ? 'Gold' : 'Honey'
        }
        // Yellow spectrum (60-75°)
        else if (hue >= 60 && hue < 75) {
            return saturation > 70 ? 'Sunshine' : 'Butter'
        }
        // Yellow-Green spectrum (75-90°)
        else if (hue >= 75 && hue < 90) {
            return saturation > 70 ? 'Lime' : 'Sage'
        }
        // Green spectrum (90-150°)
        else if (hue >= 90 && hue < 120) {
            return saturation > 70 ? 'Emerald' : 'Forest'
        } else if (hue >= 120 && hue < 150) {
            return saturation > 70 ? 'Jade' : 'Olive'
        }
        // Blue-Green spectrum (150-180°)
        else if (hue >= 150 && hue < 180) {
            return saturation > 70 ? 'Teal' : 'Seafoam'
        }
        // Blue spectrum (180-240°)
        else if (hue >= 180 && hue < 210) {
            return saturation > 70 ? 'Azure' : 'Sky'
        } else if (hue >= 210 && hue < 240) {
            return saturation > 70 ? 'Cobalt' : 'Navy'
        }
        // Purple spectrum (240-300°)
        else if (hue >= 240 && hue < 270) {
            return saturation > 70 ? 'Violet' : 'Lavender'
        } else if (hue >= 270 && hue < 300) {
            return saturation > 70 ? 'Royal' : 'Plum'
        }
        // Magenta spectrum (300-360°)
        else {
            return saturation > 70 ? 'Fuchsia' : 'Rose'
        }
    }

    const harmonyType = getHarmonyType()
    const baseColorName = getBaseColorName(h, s)

    return `${harmonyType} ${baseColorName}`
}

export function generateHarmoniousColors(
    baseColor: string,
    harmonyType: 'analogous' | 'triadic' | 'tetradic' | 'complementary' | 'monochromatic',
    numColors: number
): string[] {
    const { r, g, b } = hexToRgb(baseColor)
    const { h, s, l } = rgbToHsl(r, g, b)
    const colors: string[] = []

    switch (harmonyType) {
        case 'analogous':
            // Generate 3-5 analogous colors
            const analogousCount = Math.min(numColors, 5)
            for (let i = 0; i < analogousCount; i++) {
                const hueOffset = (i - Math.floor(analogousCount / 2)) * 30
                const newHue = (h + hueOffset + 360) % 360
                const saturation = Math.max(20, Math.min(90, s + (Math.random() - 0.5) * 20))
                const lightness = Math.max(25, Math.min(75, l + (Math.random() - 0.5) * 20))
                const { r: rr, g: gg, b: bb } = hslToRgb(newHue, saturation, lightness)
                colors.push(rgbToHex(rr, gg, bb))
            }
            break

        case 'triadic':
            // Generate 3 triadic colors, then add variations
            colors.push(baseColor)
            for (let i = 1; i < 3; i++) {
                const newHue = (h + i * 120) % 360
                const { r: rr, g: gg, b: bb } = hslToRgb(newHue, s, l)
                colors.push(rgbToHex(rr, gg, bb))
            }
            // Add variations if we need more colors
            while (colors.length < numColors) {
                const randomColor = colors[Math.floor(Math.random() * colors.length)]
                const { r: rr, g: gg, b: bb } = hexToRgb(randomColor)
                const { h: hh, s: ss, l: ll } = rgbToHsl(rr, gg, bb)
                const variationHue = (hh + (Math.random() - 0.5) * 60) % 360
                const variationSat = Math.max(20, Math.min(90, ss + (Math.random() - 0.5) * 30))
                const variationLight = Math.max(25, Math.min(75, ll + (Math.random() - 0.5) * 30))
                const { r: rrr, g: ggg, b: bbb } = hslToRgb(variationHue, variationSat, variationLight)
                colors.push(rgbToHex(rrr, ggg, bbb))
            }
            break

        case 'tetradic':
            // Generate 4 tetradic colors, then add variations
            colors.push(baseColor)
            for (let i = 1; i < 4; i++) {
                const newHue = (h + i * 90) % 360
                const { r: rr, g: gg, b: bb } = hslToRgb(newHue, s, l)
                colors.push(rgbToHex(rr, gg, bb))
            }
            // Add variations if we need more colors
            while (colors.length < numColors) {
                const randomColor = colors[Math.floor(Math.random() * colors.length)]
                const { r: rr, g: gg, b: bb } = hexToRgb(randomColor)
                const { h: hh, s: ss, l: ll } = rgbToHsl(rr, gg, bb)
                const variationHue = (hh + (Math.random() - 0.5) * 45) % 360
                const variationSat = Math.max(20, Math.min(90, ss + (Math.random() - 0.5) * 25))
                const variationLight = Math.max(25, Math.min(75, ll + (Math.random() - 0.5) * 25))
                const { r: rrr, g: ggg, b: bbb } = hslToRgb(variationHue, variationSat, variationLight)
                colors.push(rgbToHex(rrr, ggg, bbb))
            }
            break

        case 'complementary':
            // Generate complementary colors
            colors.push(baseColor)
            const complementaryHue = (h + 180) % 360
            const { r: rr, g: gg, b: bb } = hslToRgb(complementaryHue, s, l)
            colors.push(rgbToHex(rr, gg, bb))

            // Add split-complementary and variations
            while (colors.length < numColors) {
                const splitOffset = (Math.random() - 0.5) * 60
                const splitHue = (complementaryHue + splitOffset) % 360
                const splitSat = Math.max(20, Math.min(90, s + (Math.random() - 0.5) * 20))
                const splitLight = Math.max(25, Math.min(75, l + (Math.random() - 0.5) * 20))
                const { r: rrr, g: ggg, b: bbb } = hslToRgb(splitHue, splitSat, splitLight)
                colors.push(rgbToHex(rrr, ggg, bbb))
            }
            break

        case 'monochromatic':
            // Generate monochromatic variations
            colors.push(baseColor)
            for (let i = 1; i < numColors; i++) {
                const variationSat = Math.max(10, Math.min(100, s + (Math.random() - 0.5) * 40))
                const variationLight = Math.max(15, Math.min(85, l + (Math.random() - 0.5) * 40))
                const { r: rr, g: gg, b: bb } = hslToRgb(h, variationSat, variationLight)
                colors.push(rgbToHex(rr, gg, bb))
            }
            break
    }

    // Ensure we have exactly the right number of colors
    while (colors.length > numColors) {
        colors.pop()
    }

    return colors
}

export function generateRandomHarmoniousPalette(options: PaletteGenerationOptions = {}): {
    baseColors: BaseColor[]
    colors: string[]
    paletteName: string
} {
    const {
        harmonyType = 'random',
        numColors = Math.floor(Math.random() * 8) + 3, // 3-10 colors
        baseColor = generateRandomColor()
    } = options

    // Choose a random harmony type if specified
    const harmonyTypes = ['analogous', 'triadic', 'tetradic', 'complementary', 'monochromatic'] as const
    const selectedHarmonyType = harmonyType === 'random'
        ? harmonyTypes[Math.floor(Math.random() * harmonyTypes.length)]
        : harmonyType

    const generatedColors = generateHarmoniousColors(baseColor, selectedHarmonyType, numColors)
    const paletteName = generatePaletteName(generatedColors)

    // Create base colors with shades
    const colorNames = ['Primary', 'Secondary', 'Accent', 'Neutral', 'Support', 'Highlight', 'Muted', 'Vibrant', 'Soft', 'Bold']
    const baseColors: BaseColor[] = []

    for (let i = 0; i < generatedColors.length; i++) {
        const colorHex = generatedColors[i]
        const oldShades = generateShades(colorHex)
        const shades = SHADE_KEYS.map(key => ({
            shade: parseInt(key),
            hex: oldShades[key]
        }))

        baseColors.push({
            id: crypto.randomUUID(),
            name: colorNames[i] || `Color ${i + 1}`,
            baseHex: colorHex,
            shades,
        })
    }

    return { baseColors, colors: generatedColors, paletteName }
}

export function createHarmoniousPalette(options: PaletteGenerationOptions = {}): Palette {
    const { baseColors, paletteName } = generateRandomHarmoniousPalette(options)

    return {
        id: crypto.randomUUID(),
        name: paletteName,
        description: "",
        baseColors,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    }
}
