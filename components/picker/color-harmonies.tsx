"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { generateHarmonies, swatchStyle } from "@/lib/picker/utils"

type ColorHarmoniesProps = {
    baseHex: string
}

export function ColorHarmonies({ baseHex }: ColorHarmoniesProps) {
    const harmonies = generateHarmonies(baseHex)

    return (
        <Card className="shadow-elevated border-0 bg-card/90 backdrop-blur-sm rounded-xl">
            <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg font-semibold">Harmonies</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                {Object.entries(harmonies).map(([name, colors]) => (
                    <div key={name} className="space-y-2">
                        <div className="text-sm font-medium capitalize">{name}</div>
                        <div className="flex gap-2">
                            {colors.map((hex, i) => (
                                <div
                                    key={i}
                                    className="h-16 w-20 rounded-lg border-2 border-input shadow-subtle cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-soft"
                                    style={swatchStyle(hex)}
                                    title={hex.toUpperCase()}
                                >
                                    <div className="h-full w-full flex items-center justify-center p-1">
                                        <span className="text-xs font-mono font-bold leading-tight">
                                            {hex.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
