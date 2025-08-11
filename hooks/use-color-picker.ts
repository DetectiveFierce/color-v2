import { useState, useEffect, useMemo } from "react"
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, normalizeHex } from "@/lib/core/color"
import { rgbToHsv, clamp } from "@/lib/picker/utils"

export function useColorPicker(initialHex: string = "#4f46e5") {
    const [hex, setHex] = useState<string>(initialHex)

    const rgb = useMemo(() => hexToRgb(hex), [hex])
    const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb])
    const hsv = useMemo(() => rgbToHsv(rgb.r, rgb.g, rgb.b), [rgb])

    const [h, setH] = useState<number>(hsv.h)
    const [s, setS] = useState<number>(hsv.s)
    const [v, setV] = useState<number>(hsv.v)

    // Keep HSV in sync when hex changes externally
    useEffect(() => {
        const { h: hh, s: ss, v: vv } = rgbToHsv(rgb.r, rgb.g, rgb.b)
        setH(hh)
        setS(ss)
        setV(vv)
    }, [hex])

    const handleHexInput = (val: string) => {
        try {
            const normalized = normalizeHex(val)
            setHex(normalized)
        } catch {
            setHex(val)
        }
    }

    const updateFromHsv = (newH: number, newS: number, newV: number) => {
        setH(newH)
        setS(newS)
        setV(newV)
        const { r, g, b } = hslToRgb(newH, newS, newV)
        setHex(rgbToHex(r, g, b))
    }

    const updateFromHue = (newH: number) => {
        updateFromHsv(newH, s, v)
    }

    const updateFromSv = (newS: number, newV: number) => {
        updateFromHsv(h, newS, newV)
    }

    const updateFromRgb = (r: number, g: number, b: number) => {
        setHex(rgbToHex(r, g, b))
    }

    const updateFromHsl = (h: number, s: number, l: number) => {
        const { r, g, b } = hslToRgb(h, s, l)
        setHex(rgbToHex(r, g, b))
    }

    const updateRgbChannel = (channel: 'r' | 'g' | 'b', value: number) => {
        const clampedValue = clamp(value, 0, 255)
        const newRgb = { ...rgb, [channel]: clampedValue }
        setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
    }

    const updateHslChannel = (channel: 'h' | 's' | 'l', value: number) => {
        const newHsl = { ...hsl, [channel]: value }
        const { r, g, b } = hslToRgb(newHsl.h, newHsl.s, newHsl.l)
        setHex(rgbToHex(r, g, b))
    }

    return {
        hex,
        rgb,
        hsl,
        hsv,
        h,
        s,
        v,
        setHex,
        handleHexInput,
        updateFromHsv,
        updateFromHue,
        updateFromSv,
        updateFromRgb,
        updateFromHsl,
        updateRgbChannel,
        updateHslChannel,
    }
}
