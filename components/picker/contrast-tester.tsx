"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { contrastRatio, swatchStyle } from "@/lib/picker/utils"

type ContrastTesterProps = {
    baseHex: string
}

export function ContrastTester({ baseHex }: ContrastTesterProps) {
    const [bgTest, setBgTest] = useState<string>("#ffffff")

    const ratio = useMemo(() => contrastRatio(baseHex, bgTest), [baseHex, bgTest])
    const ratioText = ratio.toFixed(2)
    const aaNormal = ratio >= 4.5
    const aaLarge = ratio >= 3
    const aaaNormal = ratio >= 7

    return (
        <Card className="shadow-elevated border-0 bg-card/90 backdrop-blur-sm rounded-xl">
            <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg font-semibold">Contrast Tester</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="text-sm font-medium">Foreground</div>
                        <div className="flex gap-2">
                            <div
                                className="h-12 w-12 rounded-lg border-2 border-input shadow-subtle"
                                style={swatchStyle(baseHex)}
                            />
                            <Input
                                value={baseHex}
                                readOnly
                                className="flex-1"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-sm font-medium">Background</div>
                        <div className="flex gap-2">
                            <div
                                className="h-12 w-12 rounded-lg border-2 border-input shadow-subtle cursor-pointer"
                                style={swatchStyle(bgTest)}
                                onClick={() => {
                                    const input = document.createElement('input')
                                    input.type = 'color'
                                    input.value = bgTest
                                    input.onchange = (e) => setBgTest((e.target as HTMLInputElement).value)
                                    input.click()
                                }}
                            />
                            <Input
                                value={bgTest}
                                onChange={(e) => setBgTest(e.target.value)}
                                className="flex-1"
                            />
                        </div>
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
                    style={{ backgroundColor: bgTest }}
                >
                    <div
                        className="text-lg font-semibold"
                        style={{ color: baseHex }}
                    >
                        Sample Text
                    </div>
                    <div
                        className="text-sm mt-2"
                        style={{ color: baseHex }}
                    >
                        This is how your text will look with the selected colors.
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
