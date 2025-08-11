"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Plus } from 'lucide-react'
import { type BaseColor, type ShadeKey } from "@/lib/core/types"
import { SHADE_KEYS } from "@/lib/core/types"
import { generateShades } from "@/lib/core/color"
import { formatColor } from "@/lib/core/color-formats"
import type { ColorFormat } from "@/components/shared/format-selector"
import { useToast } from "@/hooks/use-toast"
import { ColorPicker } from "@/components/ui/color-picker"

type Props = {
    palette: any
    colorFormat: ColorFormat
    onUpdatePalette: (palette: any) => void
}

export default function ShadesView({ palette, colorFormat, onUpdatePalette }: Props) {
    const { toast } = useToast()

    function updateBaseColorName(id: string, name: string) {
        const updatedBaseColors = palette.baseColors.map((bc: BaseColor) =>
            bc.id === id ? { ...bc, name } : bc
        )
        onUpdatePalette({ ...palette, baseColors: updatedBaseColors })
    }

    function updateBaseColorHex(id: string, hex: string) {
        const safe = hex.startsWith('#') ? hex : `#${hex}`
        // Generate new shades for the updated base color
        const newShades = SHADE_KEYS.map(key => ({
            shade: parseInt(key),
            hex: generateShades(safe)[key]
        }))
        const updatedBaseColors = palette.baseColors.map((bc: BaseColor) =>
            bc.id === id ? { ...bc, baseHex: safe, shades: newShades } : bc
        )
        onUpdatePalette({ ...palette, baseColors: updatedBaseColors })
    }

    function removeBaseColor(id: string) {
        if (palette.baseColors.length <= 1) {
            toast({ title: "Cannot remove", description: "At least one base color is required.", variant: "destructive" })
            return
        }
        const updatedBaseColors = palette.baseColors.filter((bc: BaseColor) => bc.id !== id)
        onUpdatePalette({ ...palette, baseColors: updatedBaseColors })
    }

    function addBaseColor() {
        const randomColor = "#4f46e5"
        const newColor: BaseColor = {
            id: crypto.randomUUID(),
            name: `Color ${palette.baseColors.length + 1}`,
            baseHex: randomColor,
            shades: SHADE_KEYS.map(key => ({
                shade: parseInt(key),
                hex: generateShades(randomColor)[key]
            }))
        }
        onUpdatePalette({ ...palette, baseColors: [...palette.baseColors, newColor] })
    }

    const handleShadeClick = (hex: string) => {
        const formattedColor = formatColor(hex, colorFormat)
        navigator.clipboard.writeText(formattedColor)
        toast({
            title: `${formattedColor} copied to clipboard!`,
            duration: 2000,
        })
    }

    return (
        <div className="space-y-8">
            <div className="space-y-8">
                {palette.baseColors.map((baseColor: BaseColor) => (
                    <BaseColorRow
                        key={baseColor.id}
                        baseColor={baseColor}
                        totalColors={palette.baseColors.length}
                        colorFormat={colorFormat}
                        onUpdateName={(name) => updateBaseColorName(baseColor.id, name)}
                        onUpdateHex={(hex) => updateBaseColorHex(baseColor.id, hex)}
                        onRemove={() => removeBaseColor(baseColor.id)}
                        onShadeClick={handleShadeClick}
                    />
                ))}
                <div className="group/add-button h-10 hover:h-14 transition-all duration-300 overflow-hidden">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-full h-full opacity-0 group-hover/add-button:opacity-100 transition-all duration-300 text-muted-foreground hover:text-foreground"
                        onClick={addBaseColor}
                    >
                        <Plus className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

function BaseColorRow({
    baseColor,
    totalColors,
    colorFormat,
    onUpdateName,
    onUpdateHex,
    onRemove,
    onShadeClick,
}: {
    baseColor: BaseColor
    totalColors: number
    colorFormat: ColorFormat
    onUpdateName: (name: string) => void
    onUpdateHex: (hex: string) => void
    onRemove: () => void
    onShadeClick: (hex: string) => void
}) {
    return (
        <div className="border-0 rounded-xl bg-card/90 backdrop-blur-sm relative overflow-hidden shadow-elevated transition-smooth hover:shadow-elevated" style={{ height: "240px" }}>
            <div className="flex items-center h-full">
                {/* Base Color Section */}
                <div className="flex-shrink-0 space-y-4 p-6 shadow-elevated absolute left-0 top-0 bottom-0 bg-base-panel backdrop-blur-sm w-56" style={{ borderTopLeftRadius: '0.75rem', borderBottomLeftRadius: '0.75rem' }}>
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Base Color</Label>
                        {totalColors > 1 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onRemove}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Input
                            value={baseColor.name}
                            onChange={(e) => onUpdateName(e.target.value)}
                            placeholder="Color name"
                            className="w-full"
                        />

                        <div className="flex gap-3">
                            <div className="relative flex-shrink-0">
                                <ColorPicker
                                    color={baseColor.baseHex}
                                    onColorChange={onUpdateHex}
                                    size="md"
                                    showHexInput={false}
                                />
                            </div>
                            <Input
                                value={baseColor.baseHex}
                                onChange={(e) => onUpdateHex(e.target.value)}
                                placeholder="#000000"
                                className="flex-1 min-w-0"
                            />
                        </div>
                    </div>
                </div>

                {/* Shades Section */}
                <div className="flex-1 min-w-0 ml-56 h-full">
                    <div className="flex h-full overflow-hidden group/shades [&>*]:border-r [&>*]:border-white/5 last:[&>*]:border-r-0">
                        {baseColor.shades.map((shadeObj) => {
                            const hex = shadeObj.hex
                            const shadeIndex = SHADE_KEYS.indexOf(shadeObj.shade.toString() as ShadeKey)
                            const isLight = shadeIndex <= 4 // 50, 100, 200, 300, 400 are light
                            const textShadeIndex = isLight ? Math.min(shadeIndex + 3, SHADE_KEYS.length - 1) : Math.max(shadeIndex - 3, 0)
                            const textColor = baseColor.shades[textShadeIndex]?.hex || hex

                            return (
                                <div
                                    key={shadeObj.shade}
                                    className="flex-1 flex flex-col justify-between hover:flex-[2] transition-shade cursor-pointer group/shade relative"
                                    title={`${baseColor.name} ${shadeObj.shade}`}
                                    onClick={() => onShadeClick(hex)}
                                >
                                    <div
                                        className="absolute inset-0 transition-shade-hover"
                                        style={{ background: hex }}
                                    />
                                    <div className="relative flex flex-col justify-between h-full p-1.5 z-10">
                                        <span
                                            className="text-md font-mono font-bold"
                                            style={{ color: textColor }}
                                        >
                                            {shadeObj.shade}
                                        </span>
                                        <span
                                            className="text-xs font-mono font-medium"
                                            style={{ color: textColor }}
                                        >
                                            {hex.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
