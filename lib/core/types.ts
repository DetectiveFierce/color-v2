"use client"

export type ShadeKey = "50" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900" | "950"

export const SHADE_KEYS: ShadeKey[] = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"]

export interface BaseColor {
    id: string
    name: string
    hex: string
    shades: Record<ShadeKey, string>
}

export interface CssSource {
    content: string
    filename: string
    lastUpdated: number
}

export interface Palette {
    id: string
    name: string
    description?: string
    baseColors: BaseColor[]
    updatedAt: number
    cssSource?: CssSource
}

export type RGB = {
    r: number
    g: number
    b: number
}

export type HSL = {
    h: number
    s: number
    l: number
} 