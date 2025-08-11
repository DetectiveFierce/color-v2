"use client"

import { useCallback, useRef, useMemo } from "react"
import { hsvToRgb } from "@/lib/picker/utils"

// SV Panel component
export function SVPanel({
    hue,
    value,
    saturation,
    onChange
}: {
    hue: number;
    value: number;
    saturation: number;
    onChange: (s: number, v: number) => void
}) {
    const ref = useRef<HTMLDivElement | null>(null)

    // Memoize the background gradient calculation to avoid recalculating on every render
    const backgroundStyle = useMemo(() => {
        const { r, g, b } = hsvToRgb(hue, 100, 100)
        return {
            background: `linear-gradient(to top, #000, rgba(0,0,0,0)), linear-gradient(to right, #fff, rgb(${r}, ${g}, ${b}))`
        }
    }, [hue])

    // Memoize thumb position calculation
    const thumbStyle = useMemo(() => ({
        left: `${Math.min(Math.max(saturation, 0), 100)}%`,
        top: `${100 - Math.min(Math.max(value, 0), 100)}%`,
    }), [saturation, value])

    const handle = useCallback((e: PointerEvent | MouseEvent) => {
        if (!ref.current) return
        const rect = ref.current.getBoundingClientRect()
        const x = Math.min(Math.max(("clientX" in e ? e.clientX : 0) - rect.left, 0), rect.width)
        const y = Math.min(Math.max(("clientY" in e ? e.clientY : 0) - rect.top, 0), rect.height)
        const s = (x / rect.width) * 100
        const v = 100 - (y / rect.height) * 100
        onChange(s, v)
    }, [onChange])

    const onPointerDown = useCallback((e: React.PointerEvent) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId)
        handle(e.nativeEvent)
    }, [handle])

    const onPointerMove = useCallback((e: React.PointerEvent) => {
        if (e.buttons !== 1) return
        handle(e.nativeEvent)
    }, [handle])

    return (
        <div
            className="relative h-56 w-full rounded-md overflow-hidden cursor-crosshair"
            ref={ref}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            style={backgroundStyle}
        >
            <div
                className="absolute size-4 -ml-2 -mt-2 rounded-full border border-white shadow"
                style={thumbStyle}
            />
        </div>
    )
}
