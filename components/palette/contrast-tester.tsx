"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ColorSelectMenu } from "@/components/ui/color-select-menu"
import { contrastRatio } from "@/lib/picker/utils"
import { type Palette, type BaseColor } from "@/lib/core/types"

type ContrastTesterProps = {
    palette: Palette
}

export function ContrastTester({ palette }: ContrastTesterProps) {
    const [foregroundColor, setForegroundColor] = useState<string>(palette.baseColors[0]?.baseHex || "#000000")
    const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff")

    const ratio = useMemo(() => contrastRatio(foregroundColor, backgroundColor), [foregroundColor, backgroundColor])
    const ratioText = ratio.toFixed(2)
    const aaNormal = ratio >= 4.5
    const aaLarge = ratio >= 3
    const aaaNormal = ratio >= 7

    // Create a combined array of all colors from the palette for selection
    const allColors: BaseColor[] = [
        ...palette.baseColors,
        // Add some common background colors
        { id: "white", name: "White", baseHex: "#ffffff", shades: [] },
        { id: "black", name: "Black", baseHex: "#000000", shades: [] },
        { id: "gray-50", name: "Gray 50", baseHex: "#f9fafb", shades: [] },
        { id: "gray-100", name: "Gray 100", baseHex: "#f3f4f6", shades: [] },
        { id: "gray-200", name: "Gray 200", baseHex: "#e5e7eb", shades: [] },
        { id: "gray-300", name: "Gray 300", baseHex: "#d1d5db", shades: [] },
        { id: "gray-400", name: "Gray 400", baseHex: "#9ca3af", shades: [] },
        { id: "gray-500", name: "Gray 500", baseHex: "#6b7280", shades: [] },
        { id: "gray-600", name: "Gray 600", baseHex: "#4b5563", shades: [] },
        { id: "gray-700", name: "Gray 700", baseHex: "#374151", shades: [] },
        { id: "gray-800", name: "Gray 800", baseHex: "#1f2937", shades: [] },
        { id: "gray-900", name: "Gray 900", baseHex: "#111827", shades: [] },
    ]

    return (
        <Card className="shadow-elevated border-0 bg-card/90 backdrop-blur-sm rounded-xl">
            <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg font-semibold">Contrast Tester</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="text-sm font-medium">Foreground</div>
                        <ColorSelectMenu
                            value={foregroundColor}
                            onValueChange={setForegroundColor}
                            colors={allColors}
                            placeholder="Select foreground color"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="text-sm font-medium">Background</div>
                        <ColorSelectMenu
                            value={backgroundColor}
                            onValueChange={setBackgroundColor}
                            colors={allColors}
                            placeholder="Select background color"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Contrast Ratio</span>
                        <Badge variant="outline" className="font-mono">{ratioText}:1</Badge>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${aaNormal ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-sm">AA Normal (4.5:1)</span>
                            <Badge variant={aaNormal ? "default" : "secondary"} className="ml-auto">
                                {aaNormal ? "Pass" : "Fail"}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${aaLarge ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-sm">AA Large (3:1)</span>
                            <Badge variant={aaLarge ? "default" : "secondary"} className="ml-auto">
                                {aaLarge ? "Pass" : "Fail"}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${aaaNormal ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-sm">AAA Normal (7:1)</span>
                            <Badge variant={aaaNormal ? "default" : "secondary"} className="ml-auto">
                                {aaaNormal ? "Pass" : "Fail"}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div
                    className="p-4 rounded-lg border-2 border-input"
                    style={{ backgroundColor: backgroundColor }}
                >
                    <div
                        className="text-lg font-semibold"
                        style={{ color: foregroundColor }}
                    >
                        Sample Text
                    </div>
                    <div
                        className="text-sm mt-2"
                        style={{ color: foregroundColor }}
                    >
                        This is how your text will look with the selected colors.
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
