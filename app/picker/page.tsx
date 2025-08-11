"use client"

import { Droplet } from "lucide-react"
import { useColorPicker, usePaletteColorAdder } from "@/hooks"
import AppBackground from "@/components/layout/app-background"
import ColorPickerArea from "@/components/picker/color-picker-area"
import ColorDetailsArea from "@/components/picker/color-details-area"

export default function PickerPage() {
    const {
        hex,
        rgb,
        hsl,
        h,
        s,
        v,
        handleHexInput,
        updateFromHue,
        updateFromSv,
        updateRgbChannel,
        updateHslChannel,
    } = useColorPicker("#4f46e5")

    const { addColorToPalette } = usePaletteColorAdder()

    return (
        <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden bg-smooth">
            <AppBackground />

            <div className="mx-auto max-w-[1200px] px-6 md:px-8 py-10 space-y-8">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10"><Droplet className="h-5 w-5 text-primary" /></div>
                    <div>
                        <h1 className="text-2xl font-semibold leading-tight">Color Picker</h1>
                        <p className="text-sm text-muted-foreground">Pick a color and get Hex, RGB, HSL codes, harmonies, and contrast</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[520px_1fr] gap-8">
                    <ColorPickerArea
                        hex={hex}
                        rgb={rgb}
                        hsl={hsl}
                        h={h}
                        s={s}
                        v={v}
                        onHexChange={() => { }}
                        onHexInput={handleHexInput}
                        onHueChange={updateFromHue}
                        onSvChange={updateFromSv}
                        onRgbChannelChange={updateRgbChannel}
                        onHslChannelChange={updateHslChannel}
                    />

                    <ColorDetailsArea
                        baseHex={hex}
                        onAddToPalette={() => addColorToPalette(hex)}
                    />
                </div>
            </div>
        </main>
    )
}


