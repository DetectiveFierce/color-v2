"use client"

export type ShadeKey = "50" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900" | "950"

export const SHADE_KEYS: ShadeKey[] = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"]

export type Shade = {
    shade: number; // 50, 100, ... 950
    hex: string;   // e.g., "#ff5733"
};

export interface BaseColor {
    id: string;          // unique UUID
    name: string;        // e.g., "Primary", "Accent"
    baseHex: string;     // original chosen color
    shades: Shade[];     // generated spectrum of shades
}

export interface CssSource {
    content: string
    filename: string
    lastUpdated: number
}

export interface Palette {
    id: string;          // unique UUID or slug
    name: string;        // "Summer Vibes"
    description?: string;
    createdAt: number;   // timestamp
    updatedAt: number;   // timestamp
    baseColors: BaseColor[];
    cssSource?: CssSource;
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