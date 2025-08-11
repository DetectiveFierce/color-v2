"use client"

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, normalizeHex } from "@/lib/core/color"
import type { Palette, BaseColor } from "@/lib/core/types"
import { useToast } from "@/hooks/use-toast"
import { formatColor } from "@/lib/core/color-formats"
import type { ColorFormat } from "@/components/shared/format-selector"

// Import utility functions and components
import { rgbToHsv, hsvToRgb, clamp, generateHarmonies, generateTints, generateShadesOnly, generateTones } from "@/lib/picker/utils"
import { SVPanel } from "@/components/picker/sv-panel"
import { HueSlider, ChannelSlider } from "@/components/picker/sliders"
import { ColorList } from "@/components/picker/color-list"

// Simple function to get contrast text color for swatches
function getContrastTextColor(hex: string): string {
    const { r, g, b } = hexToRgb(hex)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 128 ? '#000000' : '#ffffff'
}

type EmbeddedPickerProps = {
    palette: Palette
    colorFormat?: ColorFormat
    selectedColorId?: string
    onColorSelect?: (hex: string) => void
    onColorIdSelect?: (colorId: string) => void
    onAddColor?: (color: BaseColor) => void
    onDeleteColor?: (colorSource: string) => void
}

export function EmbeddedPicker({ palette, colorFormat = "hex", selectedColorId, onColorSelect, onColorIdSelect, onAddColor, onDeleteColor }: EmbeddedPickerProps) {
    const { toast } = useToast()

    // Get the selected color's hex value - this is the source of truth
    const selectedColor = palette.baseColors.find(c => c.id === selectedColorId)
    const selectedHex = selectedColor?.baseHex || "#4f46e5"

    // Use the selected color's hex as the source of truth, no internal state
    const hex = selectedHex

    // Memoize expensive color conversions
    const rgb = useMemo(() => hexToRgb(hex), [hex])
    const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb])
    const hsv = useMemo(() => rgbToHsv(rgb.r, rgb.g, rgb.b), [rgb])

    const [h, setH] = useState<number>(hsv.h)
    const [s, setS] = useState<number>(hsv.s)
    const [v, setV] = useState<number>(hsv.v)

    const animationFrameRef = useRef<number | undefined>(undefined)
    const lastUpdateRef = useRef<number>(0)

    // Keep HSV in sync when hex changes externally
    useEffect(() => {
        const { h: hh, s: ss, v: vv } = rgbToHsv(rgb.r, rgb.g, rgb.b)
        setH(hh); setS(ss); setV(vv)
    }, [hex, rgb.b, rgb.g, rgb.r])

    // Throttled color update function using requestAnimationFrame
    const throttledUpdate = useCallback((updateFn: () => void) => {
        const now = performance.now()
        const throttleMs = 16 // ~60fps

        if (now - lastUpdateRef.current >= throttleMs) {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }

            animationFrameRef.current = requestAnimationFrame(() => {
                updateFn()
                lastUpdateRef.current = now
            })
        }
    }, [])

    // Optimized color update handlers with throttling
    const updateColorFromHSV = useCallback((newH: number, newS: number, newV: number) => {
        throttledUpdate(() => {
            const { r, g, b } = hsvToRgb(newH, newS, newV)
            const newHex = rgbToHex(r, g, b)
            onColorSelect?.(newHex)
        })
    }, [throttledUpdate, onColorSelect])

    const updateColorFromHSL = useCallback((newH: number, newS: number, newL: number) => {
        throttledUpdate(() => {
            const { r, g, b } = hslToRgb(newH, newS, newL)
            const newHex = rgbToHex(r, g, b)
            onColorSelect?.(newHex)
        })
    }, [throttledUpdate, onColorSelect])

    const updateColorFromRGB = useCallback((newR: number, newG: number, newB: number) => {
        throttledUpdate(() => {
            const newHex = rgbToHex(newR, newG, newB)
            onColorSelect?.(newHex)
        })
    }, [throttledUpdate, onColorSelect])

    // Cleanup animation frame on unmount
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [])

    // Inputs handlers
    const handleHexInput = (val: string) => {
        try {
            const normalized = normalizeHex(val)
            onColorSelect?.(normalized)
        } catch {
            // If normalization fails, still try to update with the raw value
            onColorSelect?.(val)
        }
    }

    const copy = (text: string) => navigator.clipboard.writeText(text)

    const handleColorClick = (colorHex: string) => {
        const formattedColor = formatColor(colorHex, colorFormat)
        navigator.clipboard.writeText(formattedColor)
        toast({
            title: `${formattedColor} copied to clipboard!`,
            duration: 2000,
        })
    }

    // Memoize expensive color analysis calculations
    const harmonies = useMemo(() => generateHarmonies(hex), [hex])
    const tints = useMemo(() => generateTints(hex), [hex])
    const shades = useMemo(() => generateShadesOnly(hex), [hex])
    const tones = useMemo(() => generateTones(hex), [hex])

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
            {/* Left side - Color list component */}
            <ColorList
                palette={palette}
                selectedColorId={selectedColorId}
                onColorSelect={(colorId) => {
                    // When a color is selected from the list, update the selected color ID
                    onColorIdSelect?.(colorId)
                }}
                onAddColor={onAddColor}
                onDeleteColor={onDeleteColor}
            />

            {/* Right side - Picker interface */}
            <div className="space-y-6">
                {/* Main picker area */}
                <Card className="shadow-elevated border-0 bg-card/90 backdrop-blur-sm rounded-xl">
                    <CardHeader className="pb-4 border-b">
                        <CardTitle className="text-lg font-semibold">Color Picker</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-4">
                            <div className="space-y-3">
                                <SVPanel
                                    hue={h}
                                    value={v}
                                    saturation={s}
                                    onChange={(ns, nv) => {
                                        setS(ns)
                                        setV(nv)
                                        updateColorFromHSV(h, ns, nv)
                                    }}
                                />
                                <HueSlider
                                    hue={h}
                                    onChange={(nh) => {
                                        setH(nh)
                                        updateColorFromHSV(nh, s, v)
                                    }}
                                />
                            </div>
                            <div className="space-y-3">
                                <div className="h-24 rounded-md border shadow-subtle flex items-center justify-center text-sm" style={{ background: hex, color: hex === '#ffffff' ? '#000000' : '#ffffff' }}>
                                    <span className="font-medium">{hex.toUpperCase()}</span>
                                </div>
                                <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                                    <Input aria-label="Hex" value={hex} onChange={(e) => handleHexInput(e.target.value)} />
                                    <Button variant="outline" size="sm" onClick={() => copy(hex)}><Copy className="mr-1 h-4 w-4" />Copy</Button>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <Input aria-label="R" value={rgb.r} onChange={(e) => {
                                        const r = clamp(parseInt(e.target.value || "0"), 0, 255)
                                        updateColorFromRGB(r, rgb.g, rgb.b)
                                    }} />
                                    <Input aria-label="G" value={rgb.g} onChange={(e) => {
                                        const g = clamp(parseInt(e.target.value || "0"), 0, 255)
                                        updateColorFromRGB(rgb.r, g, rgb.b)
                                    }} />
                                    <Input aria-label="B" value={rgb.b} onChange={(e) => {
                                        const b = clamp(parseInt(e.target.value || "0"), 0, 255)
                                        updateColorFromRGB(rgb.r, rgb.g, b)
                                    }} />
                                </div>
                            </div>
                        </div>

                        {/* Sliders for RGB and HSL */}
                        <div className="mt-4 pt-4 border-t space-y-6">
                            <div className="space-y-2">
                                <div className="text-sm font-medium">RGB</div>
                                <div className="space-y-3">
                                    <ChannelSlider
                                        label="R"
                                        min={0}
                                        max={255}
                                        value={rgb.r}
                                        onChange={(r) => updateColorFromRGB(r, rgb.g, rgb.b)}
                                        trackGradientCss={`linear-gradient(to right, #000, rgb(255,0,0))`}
                                    />
                                    <ChannelSlider
                                        label="G"
                                        min={0}
                                        max={255}
                                        value={rgb.g}
                                        onChange={(g) => updateColorFromRGB(rgb.r, g, rgb.b)}
                                        trackGradientCss={`linear-gradient(to right, #000, rgb(0,255,0))`}
                                    />
                                    <ChannelSlider
                                        label="B"
                                        min={0}
                                        max={255}
                                        value={rgb.b}
                                        onChange={(b) => updateColorFromRGB(rgb.r, rgb.g, b)}
                                        trackGradientCss={`linear-gradient(to right, #000, rgb(0,0,255))`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm font-medium">HSL</div>
                                <div className="space-y-3">
                                    <ChannelSlider
                                        label="H"
                                        min={0}
                                        max={360}
                                        value={Math.round(hsl.h)}
                                        onChange={(nh) => updateColorFromHSL(nh, hsl.s, hsl.l)}
                                        trackGradientCss="linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)"
                                    />
                                    <ChannelSlider
                                        label="S"
                                        min={0}
                                        max={100}
                                        value={Math.round(hsl.s)}
                                        onChange={(ns) => updateColorFromHSL(hsl.h, ns, hsl.l)}
                                        trackGradientCss={`linear-gradient(to right, ${(() => {
                                            const { r, g, b } = hslToRgb(hsl.h, 0, hsl.l)
                                            const left = rgbToHex(r, g, b)
                                            const { r: r2, g: g2, b: b2 } = hslToRgb(hsl.h, 100, hsl.l)
                                            const right = rgbToHex(r2, g2, b2)
                                            return `${left}, ${right}`
                                        })()})`}
                                    />
                                    <ChannelSlider
                                        label="L"
                                        min={0}
                                        max={100}
                                        value={Math.round(hsl.l)}
                                        onChange={(nl) => updateColorFromHSL(hsl.h, hsl.s, nl)}
                                        trackGradientCss={`linear-gradient(to right, #000, ${(() => {
                                            const { r, g, b } = hslToRgb(hsl.h, hsl.s, 50)
                                            return rgbToHex(r, g, b)
                                        })()}, #fff)`}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Color analysis */}
                <Card className="shadow-elevated border-0 bg-card/90 backdrop-blur-sm rounded-xl">
                    <CardHeader className="pb-4 border-b">
                        <CardTitle className="text-lg font-semibold">Color Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-6">
                        <div className="space-y-4">
                            <div className="text-sm font-medium">Harmonies</div>
                            <div className="space-y-4">
                                {Object.entries(harmonies).map(([name, colors]) => (
                                    <div key={name} className="space-y-2">
                                        <div className="text-sm font-medium capitalize">{name}</div>
                                        <div className="border-0 rounded-xl bg-card/90 backdrop-blur-sm relative overflow-hidden shadow-elevated transition-smooth hover:shadow-elevated" style={{ height: "80px" }}>
                                            <div className="flex h-full overflow-hidden group/shades [&>*]:border-r [&>*]:border-white/5 last:[&>*]:border-r-0">
                                                {(colors as string[]).map((colorHex: string, i: number) => {
                                                    const textColor = getContrastTextColor(colorHex)

                                                    return (
                                                        <div
                                                            key={i}
                                                            className="flex-1 flex flex-col justify-between hover:flex-[2] transition-shade cursor-pointer group/shade relative"
                                                            title={colorHex.toUpperCase()}
                                                            onClick={() => handleColorClick(colorHex)}
                                                        >
                                                            <div
                                                                className="absolute inset-0 transition-shade-hover"
                                                                style={{ background: colorHex }}
                                                            />
                                                            <div className="relative flex flex-col justify-between h-full p-1.5 z-10">
                                                                <span
                                                                    className="text-md font-mono font-bold"
                                                                    style={{ color: textColor }}
                                                                >
                                                                    {name.charAt(0).toUpperCase() + name.slice(1)}
                                                                </span>
                                                                <span
                                                                    className="text-xs font-mono font-medium"
                                                                    style={{ color: textColor }}
                                                                >
                                                                    {colorHex.toUpperCase()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="text-sm font-medium">Variations</div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="text-sm font-medium">Tints</div>
                                    <div className="border-0 rounded-xl bg-card/90 backdrop-blur-sm relative overflow-hidden shadow-elevated transition-smooth hover:shadow-elevated" style={{ height: "80px" }}>
                                        <div className="flex h-full overflow-hidden group/shades [&>*]:border-r [&>*]:border-white/5 last:[&>*]:border-r-0">
                                            {tints.map((colorHex: string, i: number) => {
                                                const textColor = getContrastTextColor(colorHex)

                                                return (
                                                    <div
                                                        key={i}
                                                        className="flex-1 flex flex-col justify-between hover:flex-[2] transition-shade cursor-pointer group/shade relative"
                                                        title={colorHex.toUpperCase()}
                                                        onClick={() => handleColorClick(colorHex)}
                                                    >
                                                        <div
                                                            className="absolute inset-0 transition-shade-hover"
                                                            style={{ background: colorHex }}
                                                        />
                                                        <div className="relative flex flex-col justify-between h-full p-1.5 z-10">
                                                            <span
                                                                className="text-md font-mono font-bold"
                                                                style={{ color: textColor }}
                                                            >
                                                                Tint {i + 1}
                                                            </span>
                                                            <span
                                                                className="text-xs font-mono font-medium"
                                                                style={{ color: textColor }}
                                                            >
                                                                {colorHex.toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm font-medium">Shades</div>
                                    <div className="border-0 rounded-xl bg-card/90 backdrop-blur-sm relative overflow-hidden shadow-elevated transition-smooth hover:shadow-elevated" style={{ height: "80px" }}>
                                        <div className="flex h-full overflow-hidden group/shades [&>*]:border-r [&>*]:border-white/5 last:[&>*]:border-r-0">
                                            {shades.map((colorHex: string, i: number) => {
                                                const textColor = getContrastTextColor(colorHex)

                                                return (
                                                    <div
                                                        key={i}
                                                        className="flex-1 flex flex-col justify-between hover:flex-[2] transition-shade cursor-pointer group/shade relative"
                                                        title={colorHex.toUpperCase()}
                                                        onClick={() => handleColorClick(colorHex)}
                                                    >
                                                        <div
                                                            className="absolute inset-0 transition-shade-hover"
                                                            style={{ background: colorHex }}
                                                        />
                                                        <div className="relative flex flex-col justify-between h-full p-1.5 z-10">
                                                            <span
                                                                className="text-md font-mono font-bold"
                                                                style={{ color: textColor }}
                                                            >
                                                                Shade {i + 1}
                                                            </span>
                                                            <span
                                                                className="text-xs font-mono font-medium"
                                                                style={{ color: textColor }}
                                                            >
                                                                {colorHex.toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm font-medium">Tones</div>
                                    <div className="border-0 rounded-xl bg-card/90 backdrop-blur-sm relative overflow-hidden shadow-elevated transition-smooth hover:shadow-elevated" style={{ height: "80px" }}>
                                        <div className="flex h-full overflow-hidden group/shades [&>*]:border-r [&>*]:border-white/5 last:[&>*]:border-r-0">
                                            {tones.map((colorHex: string, i: number) => {
                                                const textColor = getContrastTextColor(colorHex)

                                                return (
                                                    <div
                                                        key={i}
                                                        className="flex-1 flex flex-col justify-between hover:flex-[2] transition-shade cursor-pointer group/shade relative"
                                                        title={colorHex.toUpperCase()}
                                                        onClick={() => handleColorClick(colorHex)}
                                                    >
                                                        <div
                                                            className="absolute inset-0 transition-shade-hover"
                                                            style={{ background: colorHex }}
                                                        />
                                                        <div className="relative flex flex-col justify-between h-full p-1.5 z-10">
                                                            <span
                                                                className="text-md font-mono font-bold"
                                                                style={{ color: textColor }}
                                                            >
                                                                Tone {i + 1}
                                                            </span>
                                                            <span
                                                                className="text-xs font-mono font-medium"
                                                                style={{ color: textColor }}
                                                            >
                                                                {colorHex.toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
