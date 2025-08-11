"use client"

import { useMemo, useCallback } from "react"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { rgbToHex, rgbToHsl, hslToRgb } from "@/lib/core/color"
import { wrapHue } from "@/lib/picker/utils"

// Hue slider
export function HueSlider({ hue, onChange }: { hue: number; onChange: (h: number) => void }) {
    const trackStyle = useMemo(() => ({
        background: "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)"
    }), [])

    const handleChange = useCallback(([v]: number[]) => {
        onChange(v)
    }, [onChange])

    return (
        <Slider
            min={0}
            max={360}
            step={1}
            value={[wrapHue(hue)]}
            onValueChange={handleChange}
            trackStyle={trackStyle}
            thumbClassName="bg-secondary border-border shadow-subtle"
        />
    )
}

export function ChannelSlider({
    label,
    min,
    max,
    value,
    onChange,
    trackGradientCss,
}: {
    label: string
    min: number
    max: number
    value: number
    onChange: (next: number) => void
    trackGradientCss?: string
}) {
    const trackStyle = useMemo(() =>
        trackGradientCss ? { background: trackGradientCss, border: 'none' } : { border: 'none' }
        , [trackGradientCss])

    const handleChange = useCallback(([v]: number[]) => {
        onChange(v)
    }, [onChange])

    return (
        <div className="grid grid-cols-[38px_1fr_auto] items-center gap-2">
            <label className="text-xs text-muted-foreground select-none">{label}</label>
            <Slider
                min={min}
                max={max}
                step={1}
                value={[value]}
                onValueChange={handleChange}
                trackStyle={trackStyle}
                rangeClassName="bg-transparent"
                thumbClassName="bg-secondary border-border shadow-subtle"
            />
            <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-mono tabular-nums">
                {value}
            </Badge>
        </div>
    )
}
