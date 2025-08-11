"use client"

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { type Palette, type BaseColor } from "@/lib/core/types"
import { SHADE_KEYS } from "@/lib/core/types"
import { generateShades } from "@/lib/core/color"
import type { ColorFormat } from "@/components/shared/format-selector"
import { EmbeddedPicker } from "@/components/picker/embedded-picker"
import { useToast } from "@/hooks/use-toast"

type Props = {
    palette: Palette
    colorFormat: ColorFormat
    onUpdatePalette: (palette: Palette) => void
}

export default function PickerView({ palette, colorFormat, onUpdatePalette }: Props) {
    const { toast } = useToast()
    const [selectedColorId, setSelectedColorId] = useState<string>(palette.baseColors[0]?.id || "")

    // Update selected color when palette structure changes (colors added/removed)
    useEffect(() => {
        if (palette.baseColors.length > 0) {
            // Only set to first color if no color is currently selected or if the selected color no longer exists
            if (!selectedColorId || !palette.baseColors.find(bc => bc.id === selectedColorId)) {
                setSelectedColorId(palette.baseColors[0].id)
            }
        }
    }, [palette.id, palette.baseColors.length])

    function updateBaseColor(id: string, updates: Partial<BaseColor>) {
        const updatedBaseColors = palette.baseColors.map(bc =>
            bc.id === id ? { ...bc, ...updates } : bc
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
        updateBaseColor(id, { baseHex: safe, shades: newShades })
    }

    function updateSelectedColorHex(hex: string) {
        if (selectedColorId) {
            updateBaseColorHex(selectedColorId, hex)
        }
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
        // Select the newly added color
        setSelectedColorId(newColor.id)
    }

    function deleteBaseColor(baseColorId: string) {
        const updatedBaseColors = palette.baseColors.filter(bc => bc.id !== baseColorId)
        if (updatedBaseColors.length === 0) {
            toast({ title: "Cannot delete", description: "At least one base color is required.", variant: "destructive" })
            return
        }
        onUpdatePalette({ ...palette, baseColors: updatedBaseColors })
        // If the deleted color was selected, select the first remaining color
        if (selectedColorId === baseColorId) {
            setSelectedColorId(updatedBaseColors[0]?.id || "")
        }
    }

    return (
        <div className="space-y-8">
            <EmbeddedPicker
                palette={palette}
                colorFormat={colorFormat}
                selectedColorId={selectedColorId}
                onColorSelect={(hex) => {
                    // This callback is called when the picker changes the color value
                    // We need to update the selected color's hex value
                    updateSelectedColorHex(hex)
                }}
                onColorIdSelect={(colorId) => {
                    // This callback is called when a color is selected from the list
                    // We need to update the selected color ID
                    setSelectedColorId(colorId)
                }}
                onAddColor={(newColor) => {
                    onUpdatePalette({ ...palette, baseColors: [...palette.baseColors, newColor] })
                    // Select the newly added color
                    setSelectedColorId(newColor.id)
                }}
                onDeleteColor={(baseColorId) => {
                    deleteBaseColor(baseColorId)
                }}
            />
        </div>
    )
}
