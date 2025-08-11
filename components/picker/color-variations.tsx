"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { generateTints, generateShadesOnly, generateTones, swatchStyle } from "@/lib/picker/utils"

type ColorVariationsProps = {
    baseHex: string
}

export function ColorVariations({ baseHex }: ColorVariationsProps) {
    const tints = generateTints(baseHex)
    const shades = generateShadesOnly(baseHex)
    const tones = generateTones(baseHex)

    return (
        <Card className="shadow-elevated border-0 bg-card/90 backdrop-blur-sm rounded-xl">
            <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg font-semibold">Variations</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className="space-y-2">
                    <div className="text-sm font-medium">Tints</div>
                    <div className="flex gap-1">
                        {tints.map((hex, i) => (
                            <div
                                key={i}
                                className="h-8 flex-1 rounded border border-input shadow-subtle cursor-pointer transition-all duration-200 hover:scale-105"
                                style={swatchStyle(hex)}
                                title={hex.toUpperCase()}
                            />
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="text-sm font-medium">Shades</div>
                    <div className="flex gap-1">
                        {shades.map((hex, i) => (
                            <div
                                key={i}
                                className="h-8 flex-1 rounded border border-input shadow-subtle cursor-pointer transition-all duration-200 hover:scale-105"
                                style={swatchStyle(hex)}
                                title={hex.toUpperCase()}
                            />
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="text-sm font-medium">Tones</div>
                    <div className="flex gap-1">
                        {tones.map((hex, i) => (
                            <div
                                key={i}
                                className="h-8 flex-1 rounded border border-input shadow-subtle cursor-pointer transition-all duration-200 hover:scale-105"
                                style={swatchStyle(hex)}
                                title={hex.toUpperCase()}
                            />
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
