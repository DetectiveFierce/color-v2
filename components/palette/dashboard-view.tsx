"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Palette as PaletteIcon, Eye, Thermometer, BarChart3, Monitor } from 'lucide-react'
import { type Palette, type BaseColor, type ShadeKey } from "@/lib/core/types"
import { SHADE_KEYS } from "@/lib/core/types"
import { formatColor } from "@/lib/core/color-formats"
import type { ColorFormat } from "@/components/shared/format-selector"
import { useToast } from "@/hooks/use-toast"
import { MockupPreviews } from "./mockup-previews"
import { ContrastTester } from "./contrast-tester"
import { ColorPsychologyPanel } from "./color-psychology-panel"
import { AccessibilityPanel } from "./accessibility-panel"
import { TemperaturePanel } from "./temperature-panel"
import { ColorPicker } from "@/components/ui/color-picker"

type Props = {
    palette: Palette
    colorFormat: ColorFormat
    onUpdatePalette: (palette: Palette) => void
}

export default function DashboardView({ palette, colorFormat, onUpdatePalette }: Props) {
    const { toast } = useToast()

    // Derived: TypeScript theme snippet and enhanced analysis
    const tsThemeText = useMemo(() => {
        const baseColors = palette.baseColors.map(bc => ({
            name: bc.name,
            baseHex: bc.baseHex,
            shades: bc.shades.map(shade => ({
                shade: shade.shade,
                hex: shade.hex
            }))
        }))
        return `export const palette = {
  baseColors: [
    ${baseColors.map(bc => `{
      name: "${bc.name}",
      baseHex: "${bc.baseHex}",
      shades: [
        ${bc.shades.map(shade => `{
          shade: ${shade.shade},
          hex: "${shade.hex}"
        }`).join(",")}
      ]
    }`).join(",")}
  ]
}`
    }, [palette])

    const analysis = useMemo(() => {
        const totalBaseColors = palette.baseColors.length
        const totalShades = palette.baseColors.reduce((acc, bc) => acc + bc.shades.length, 0)
        const seen = new Map<string, { count: number, entries: { base: string, shade: string }[] }>()

        // Color distribution analysis
        const colorDistribution = {
            light: 0,    // 50-400
            medium: 0,   // 500-600
            dark: 0      // 700-950
        }

        // Brightness analysis
        const brightnessLevels = {
            veryLight: 0,  // 0-20% lightness
            light: 0,      // 20-40% lightness
            medium: 0,     // 40-60% lightness
            dark: 0,       // 60-80% lightness
            veryDark: 0    // 80-100% lightness
        }

        palette.baseColors.forEach(bc => {
            bc.shades.forEach(shade => {
                const hex = shade.hex
                const rec = seen.get(hex) || { count: 0, entries: [] }
                rec.count += 1
                rec.entries.push({ base: bc.name, shade: shade.shade.toString() })
                seen.set(hex, rec)

                // Analyze shade distribution
                if (shade.shade <= 400) colorDistribution.light++
                else if (shade.shade <= 600) colorDistribution.medium++
                else colorDistribution.dark++

                // Analyze brightness (simplified - could use actual HSL conversion)
                const shadeIndex = SHADE_KEYS.indexOf(shade.shade.toString() as ShadeKey)
                if (shadeIndex <= 2) brightnessLevels.veryLight++
                else if (shadeIndex <= 4) brightnessLevels.light++
                else if (shadeIndex <= 6) brightnessLevels.medium++
                else if (shadeIndex <= 8) brightnessLevels.dark++
                else brightnessLevels.veryDark++
            })
        })

        const duplicates = Array.from(seen.entries())
            .filter(([, rec]) => rec.count > 1)
            .map(([hex, rec]) => ({ hex, count: rec.count, entries: rec.entries }))
            .sort((a, b) => b.count - a.count)

        const uniqueHexes = seen.size
        const efficiency = totalShades > 0 ? Math.round((uniqueHexes / totalShades) * 100) : 0

        // Palette balance score (0-100)
        const balanceScore = Math.min(100, Math.round(
            (Math.min(colorDistribution.light, colorDistribution.medium, colorDistribution.dark) /
                Math.max(colorDistribution.light, colorDistribution.medium, colorDistribution.dark)) * 100
        ))

        return {
            totalBaseColors,
            totalShades,
            uniqueHexes,
            duplicates,
            colorDistribution,
            brightnessLevels,
            efficiency,
            balanceScore
        }
    }, [palette])

    function updateBaseColorName(id: string, name: string) {
        const updatedBaseColors = palette.baseColors.map(bc =>
            bc.id === id ? { ...bc, name } : bc
        )
        onUpdatePalette({ ...palette, baseColors: updatedBaseColors })
    }

    function updateBaseColorHex(id: string, hex: string) {
        const safe = hex.startsWith('#') ? hex : `#${hex}`
        const updatedBaseColors = palette.baseColors.map(bc =>
            bc.id === id ? { ...bc, baseHex: safe } : bc
        )
        onUpdatePalette({ ...palette, baseColors: updatedBaseColors })
    }

    return (
        <div className="space-y-8">
            {/* Enhanced Dashboard with Dynamic CSS Grid */}
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 auto-rows-auto">
                    {/* Analysis Panel */}
                    <div className="lg:col-span-6">
                        <Card className="h-full flex flex-col">
                            <CardHeader className="pb-4 border-b flex-shrink-0">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <PaletteIcon className="h-5 w-5 text-primary" />
                                    Analysis
                                </CardTitle>
                                <CardDescription>Overview of palette structure and duplicates.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="space-y-6">
                                    {/* Basic Stats */}
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <div className="text-2xl font-semibold">{analysis.totalBaseColors}</div>
                                            <div className="text-xs text-muted-foreground">Base colors</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-semibold">{analysis.totalShades}</div>
                                            <div className="text-xs text-muted-foreground">Total shades</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-semibold">{analysis.uniqueHexes}</div>
                                            <div className="text-xs text-muted-foreground">Unique hexes</div>
                                        </div>
                                    </div>

                                    {/* Efficiency & Balance Metrics */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-3 rounded-lg bg-muted/30">
                                            <div className="text-lg font-semibold">{analysis.efficiency}%</div>
                                            <div className="text-xs text-muted-foreground">Efficiency</div>
                                            <div className="text-xs text-muted-foreground">(unique/total)</div>
                                        </div>
                                        <div className="text-center p-3 rounded-lg bg-muted/30">
                                            <div className="text-lg font-semibold">{analysis.balanceScore}</div>
                                            <div className="text-xs text-muted-foreground">Balance Score</div>
                                            <div className="text-xs text-muted-foreground">(0-100)</div>
                                        </div>
                                    </div>

                                    {/* Color Distribution */}
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium">Shade Distribution</div>
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                            <div className="text-center p-2 rounded bg-blue-50 dark:bg-blue-950/20">
                                                <div className="font-semibold">{analysis.colorDistribution.light}</div>
                                                <div className="text-muted-foreground">Light</div>
                                            </div>
                                            <div className="text-center p-2 rounded bg-yellow-50 dark:bg-yellow-950/20">
                                                <div className="font-semibold">{analysis.colorDistribution.medium}</div>
                                                <div className="text-muted-foreground">Medium</div>
                                            </div>
                                            <div className="text-center p-2 rounded bg-gray-50 dark:bg-gray-950/20">
                                                <div className="font-semibold">{analysis.colorDistribution.dark}</div>
                                                <div className="text-muted-foreground">Dark</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Brightness Levels */}
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium">Brightness Levels</div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span>Very Light</span>
                                                <span className="font-mono">{analysis.brightnessLevels.veryLight}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span>Light</span>
                                                <span className="font-mono">{analysis.brightnessLevels.light}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span>Medium</span>
                                                <span className="font-mono">{analysis.brightnessLevels.medium}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span>Dark</span>
                                                <span className="font-mono">{analysis.brightnessLevels.dark}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span>Very Dark</span>
                                                <span className="font-mono">{analysis.brightnessLevels.veryDark}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Duplicates Section */}
                                    {analysis.duplicates.length > 0 ? (
                                        <div className="space-y-2">
                                            <div className="text-sm font-medium">Duplicate hex values</div>
                                            <div className="scrollable-content rounded-md border p-2 text-sm max-h-20 overflow-y-auto">
                                                {analysis.duplicates.map((d) => (
                                                    <div key={d.hex} className="py-1">
                                                        <div className="font-mono">{d.hex.toUpperCase()} <span className="text-xs text-muted-foreground">×{d.count}</span></div>
                                                        <div className="text-xs text-muted-foreground">{d.entries.map(e => `${e.base} ${e.shade}`).join(", ")}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground text-center py-2 bg-green-50 dark:bg-green-950/20 rounded">
                                            ✓ No duplicate hex values across shades
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Temperature Panel */}
                    <div className="lg:col-span-6">
                        <Card className="h-full flex flex-col">
                            <CardHeader className="pb-4 border-b flex-shrink-0">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <Thermometer className="h-5 w-5 text-primary" />
                                    Temperature & Brightness
                                </CardTitle>
                                <CardDescription>Color temperature and brightness analysis.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <TemperaturePanel palette={palette} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Psychology Panel */}
                    <div className="lg:col-span-6">
                        <Card className="h-full flex flex-col">
                            <CardHeader className="pb-4 border-b flex-shrink-0">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-primary" />
                                    Color Psychology
                                </CardTitle>
                                <CardDescription>Mood and associations analysis.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <ColorPsychologyPanel palette={palette} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Accessibility Panel */}
                    <div className="lg:col-span-6">
                        <Card className="h-full flex flex-col">
                            <CardHeader className="pb-4 border-b flex-shrink-0">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <Eye className="h-5 w-5 text-primary" />
                                    Accessibility
                                </CardTitle>
                                <CardDescription>WCAG compliance and contrast analysis.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <AccessibilityPanel palette={palette} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Edit Panel */}
                    <div className="lg:col-span-3">
                        <Card className="h-full flex flex-col">
                            <CardHeader className="pb-4 border-b flex-shrink-0">
                                <CardTitle className="text-lg font-semibold">Quick Edit</CardTitle>
                                <CardDescription>Rename colors or tweak base hex values.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="space-y-3">
                                    {palette.baseColors.map((bc) => (
                                        <div key={bc.id} className="grid grid-cols-[160px_1fr] gap-3 items-center">
                                            <input
                                                value={bc.name}
                                                onChange={(e) => updateBaseColorName(bc.id, e.target.value)}
                                                placeholder="Color name"
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            />
                                            <div className="flex gap-3 items-center">
                                                <ColorPicker
                                                    color={bc.baseHex}
                                                    onColorChange={(color) => updateBaseColorHex(bc.id, color)}
                                                    size="sm"
                                                    showHexInput={false}
                                                />
                                                <input
                                                    value={bc.baseHex}
                                                    onChange={(e) => updateBaseColorHex(bc.id, e.target.value)}
                                                    placeholder="#000000"
                                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Mockup Previews */}
                    <div className="lg:col-span-9">
                        <Card className="h-full flex flex-col">
                            <CardHeader className="pb-4 border-b flex-shrink-0">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <Monitor className="h-5 w-5 text-primary" />
                                    Live Mockup Previews
                                </CardTitle>
                                <CardDescription>See your colors in action across different contexts.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <MockupPreviews palette={palette} />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Contrast Tester */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-12">
                        <ContrastTester palette={palette} />
                    </div>
                </div>
            </div>

            {/* TypeScript Theme Section */}
            <Card className="shadow-elevated border-0 bg-card/90 backdrop-blur-sm rounded-xl">
                <CardHeader className="pb-4 border-b">
                    <CardTitle className="text-lg font-semibold">TypeScript Theme</CardTitle>
                    <CardDescription>Exportable TS object for use in apps; includes full shades.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                    <Textarea value={tsThemeText} readOnly rows={12} className="font-mono text-sm" />
                    <div className="flex gap-2">
                        <Button
                            onClick={() => {
                                navigator.clipboard.writeText(tsThemeText)
                                toast({ title: "Copied", description: "TypeScript theme copied to clipboard." })
                            }}
                            variant="outline"
                            size="sm"
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy TS
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
