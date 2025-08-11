"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Copy, Droplet, Plus } from "lucide-react"
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, normalizeHex } from "@/lib/core/color"
import type { HSL } from "@/lib/core/types"

// Import utility functions and components
import { rgbToHsv, hsvToRgb, clamp } from "@/lib/picker/utils"
import { SVPanel } from "@/components/picker/sv-panel"
import { HueSlider, ChannelSlider } from "@/components/picker/sliders"
import { ColorHarmonies } from "@/components/picker/color-harmonies"
import { ColorVariations } from "@/components/picker/color-variations"
import { ContrastTester } from "@/components/picker/contrast-tester"
import { getAllPalettes, saveAllPalettes } from "@/lib/storage/local-storage"
import { generateShades } from "@/lib/core/color"
import { useToast } from "@/hooks/use-toast"

export default function PickerPage() {
    const { toast } = useToast()

    // Base color state
    const [hex, setHex] = useState<string>("#4f46e5")
    const rgb = useMemo(() => hexToRgb(hex), [hex])
    const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb])
    const hsv = useMemo(() => rgbToHsv(rgb.r, rgb.g, rgb.b), [rgb])

    const [h, setH] = useState<number>(hsv.h)
    const [s, setS] = useState<number>(hsv.s)
    const [v, setV] = useState<number>(hsv.v)

    // Function to add current color to the first available palette
    const addColorToPalette = () => {
        try {
            const palettes = getAllPalettes()
            if (palettes.length === 0) {
                toast({
                    title: "No palettes found",
                    description: "Create a palette first in the main page.",
                    variant: "destructive"
                })
                return
            }

            const firstPalette = palettes[0]
            const newColor = {
                id: crypto.randomUUID(),
                name: `Color ${firstPalette.baseColors.length + 1}`,
                hex: hex,
                shades: generateShades(hex),
            }

            const updatedPalette = {
                ...firstPalette,
                baseColors: [...firstPalette.baseColors, newColor],
                updatedAt: Date.now()
            }

            const updatedPalettes = palettes.map(p =>
                p.id === firstPalette.id ? updatedPalette : p
            )

            saveAllPalettes(updatedPalettes)
            toast({
                title: "Color added",
                description: `Added ${hex.toUpperCase()} to "${firstPalette.name}"`,
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add color to palette.",
                variant: "destructive"
            })
        }
    }

    // Keep HSV in sync when hex changes externally
    useEffect(() => {
        const { h: hh, s: ss, v: vv } = rgbToHsv(rgb.r, rgb.g, rgb.b)
        setH(hh); setS(ss); setV(vv)
    }, [hex])

    // Inputs handlers
    const handleHexInput = (val: string) => {
        try {
            const normalized = normalizeHex(val)
            setHex(normalized)
        } catch {
            setHex(val)
        }
    }

    const copy = (text: string) => navigator.clipboard.writeText(text)

    return (
        <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden bg-smooth">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.015)_1px,transparent_0)] bg-[length:32px_32px] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/2 to-transparent pointer-events-none" />

            <div className="mx-auto max-w-[1200px] px-6 md:px-8 py-10 space-y-8">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10"><Droplet className="h-5 w-5 text-primary" /></div>
                    <div>
                        <h1 className="text-2xl font-semibold leading-tight">Color Picker</h1>
                        <p className="text-sm text-muted-foreground">Pick a color and get Hex, RGB, HSL codes, harmonies, and contrast</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[520px_1fr] gap-8">
                    {/* Picker area */}
                    <Card className="shadow-elevated border-0 bg-card/90 backdrop-blur-sm rounded-xl">
                        <CardHeader className="pb-4 border-b">
                            <CardTitle className="text-lg font-semibold">Picker</CardTitle>
                            <CardDescription>Drag in the square, adjust hue, or type a code</CardDescription>
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
                                            const { r, g, b } = hsvToRgb(h, ns, nv)
                                            setHex(rgbToHex(r, g, b))
                                        }}
                                    />
                                    <HueSlider
                                        hue={h}
                                        onChange={(nh) => {
                                            setH(nh)
                                            const { r, g, b } = hsvToRgb(nh, s, v)
                                            setHex(rgbToHex(r, g, b))
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
                                            setHex(rgbToHex(r, rgb.g, rgb.b))
                                        }} />
                                        <Input aria-label="G" value={rgb.g} onChange={(e) => {
                                            const g = clamp(parseInt(e.target.value || "0"), 0, 255)
                                            setHex(rgbToHex(rgb.r, g, rgb.b))
                                        }} />
                                        <Input aria-label="B" value={rgb.b} onChange={(e) => {
                                            const b = clamp(parseInt(e.target.value || "0"), 0, 255)
                                            setHex(rgbToHex(rgb.r, rgb.g, b))
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
                                            onChange={(r) => setHex(rgbToHex(r, rgb.g, rgb.b))}
                                            trackGradientCss={`linear-gradient(to right, #000, rgb(255,0,0))`}
                                        />
                                        <ChannelSlider
                                            label="G"
                                            min={0}
                                            max={255}
                                            value={rgb.g}
                                            onChange={(g) => setHex(rgbToHex(rgb.r, g, rgb.b))}
                                            trackGradientCss={`linear-gradient(to right, #000, rgb(0,255,0))`}
                                        />
                                        <ChannelSlider
                                            label="B"
                                            min={0}
                                            max={255}
                                            value={rgb.b}
                                            onChange={(b) => setHex(rgbToHex(rgb.r, rgb.g, b))}
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
                                            onChange={(nh) => {
                                                const { r, g, b } = hslToRgb(nh, hsl.s, hsl.l)
                                                setHex(rgbToHex(r, g, b))
                                            }}
                                            trackGradientCss="linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)"
                                        />
                                        <ChannelSlider
                                            label="S"
                                            min={0}
                                            max={100}
                                            value={Math.round(hsl.s)}
                                            onChange={(ns) => {
                                                const { r, g, b } = hslToRgb(hsl.h, ns, hsl.l)
                                                setHex(rgbToHex(r, g, b))
                                            }}
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
                                            onChange={(nl) => {
                                                const { r, g, b } = hslToRgb(hsl.h, hsl.s, nl)
                                                setHex(rgbToHex(r, g, b))
                                            }}
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

                    {/* Details area */}
                    <div className="space-y-6">
                        <ColorHarmonies baseHex={hex} />
                        <ColorVariations baseHex={hex} />
                        <ContrastTester baseHex={hex} />

                        {/* Add Color to Palette Button */}
                        <div className="group/add-button h-10 hover:h-14 transition-all duration-300 overflow-hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-full h-full opacity-0 group-hover/add-button:opacity-100 transition-all duration-300 text-muted-foreground hover:text-foreground border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40"
                                onClick={addColorToPalette}
                            >
                                <Plus className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}


