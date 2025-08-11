"use client"

import { Copy } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SVPanel } from "@/components/picker/sv-panel"
import { HueSlider, ChannelSlider } from "@/components/picker/sliders"

interface ColorPickerAreaProps {
    hex: string
    rgb: { r: number; g: number; b: number }
    hsl: { h: number; s: number; l: number }
    h: number
    s: number
    v: number
    onHexInput: (val: string) => void
    onHueChange: (hue: number) => void
    onSvChange: (s: number, v: number) => void
    onRgbChannelChange: (channel: 'r' | 'g' | 'b', value: number) => void
    onHslChannelChange: (channel: 'h' | 's' | 'l', value: number) => void
}

export default function ColorPickerArea({
    hex,
    rgb,
    hsl,
    h,
    s,
    v,
    onHexInput,
    onHueChange,
    onSvChange,
    onRgbChannelChange,
    onHslChannelChange,
}: ColorPickerAreaProps) {
    const copy = (text: string) => navigator.clipboard.writeText(text)

    return (
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
                            onChange={onSvChange}
                        />
                        <HueSlider
                            hue={h}
                            onChange={onHueChange}
                        />
                    </div>
                    <div className="space-y-3">
                        <div
                            className="h-24 rounded-md border shadow-subtle flex items-center justify-center text-sm"
                            style={{ background: hex, color: hex === '#ffffff' ? '#000000' : '#ffffff' }}
                        >
                            <span className="font-medium">{hex.toUpperCase()}</span>
                        </div>
                        <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                            <Input
                                aria-label="Hex"
                                value={hex}
                                onChange={(e) => onHexInput(e.target.value)}
                            />
                            <Button variant="outline" size="sm" onClick={() => copy(hex)}>
                                <Copy className="mr-1 h-4 w-4" />Copy
                            </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <Input
                                aria-label="R"
                                value={rgb.r}
                                onChange={(e) => onRgbChannelChange('r', parseInt(e.target.value || "0"))}
                            />
                            <Input
                                aria-label="G"
                                value={rgb.g}
                                onChange={(e) => onRgbChannelChange('g', parseInt(e.target.value || "0"))}
                            />
                            <Input
                                aria-label="B"
                                value={rgb.b}
                                onChange={(e) => onRgbChannelChange('b', parseInt(e.target.value || "0"))}
                            />
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
                                onChange={(r) => onRgbChannelChange('r', r)}
                                trackGradientCss={`linear-gradient(to right, #000, rgb(255,0,0))`}
                            />
                            <ChannelSlider
                                label="G"
                                min={0}
                                max={255}
                                value={rgb.g}
                                onChange={(g) => onRgbChannelChange('g', g)}
                                trackGradientCss={`linear-gradient(to right, #000, rgb(0,255,0))`}
                            />
                            <ChannelSlider
                                label="B"
                                min={0}
                                max={255}
                                value={rgb.b}
                                onChange={(b) => onRgbChannelChange('b', b)}
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
                                onChange={(nh) => onHslChannelChange('h', nh)}
                                trackGradientCss="linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)"
                            />
                            <ChannelSlider
                                label="S"
                                min={0}
                                max={100}
                                value={Math.round(hsl.s)}
                                onChange={(ns) => onHslChannelChange('s', ns)}
                                trackGradientCss={`linear-gradient(to right, ${(() => {
                                    const { r, g, b } = hslToRgbHelper(hsl.h, 0, hsl.l)
                                    const left = rgbToHexHelper(r, g, b)
                                    const { r: r2, g: g2, b: b2 } = hslToRgbHelper(hsl.h, 100, hsl.l)
                                    const right = rgbToHexHelper(r2, g2, b2)
                                    return `${left}, ${right}`
                                })()})`}
                            />
                            <ChannelSlider
                                label="L"
                                min={0}
                                max={100}
                                value={Math.round(hsl.l)}
                                onChange={(nl) => onHslChannelChange('l', nl)}
                                trackGradientCss={`linear-gradient(to right, #000, ${(() => {
                                    const { r, g, b } = hslToRgbHelper(hsl.h, hsl.s, 50)
                                    return rgbToHexHelper(r, g, b)
                                })()}, #fff)`}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

import { hslToRgb, rgbToHex } from "@/lib/core/color"

// Helper functions for gradient calculations
function hslToRgbHelper(h: number, s: number, l: number) {
    const { r, g, b } = hslToRgb(h, s, l)
    return { r, g, b }
}

function rgbToHexHelper(r: number, g: number, b: number) {
    return rgbToHex(r, g, b)
}
