import { useCallback } from "react"
import { useToast } from "./use-toast"
import { getAllPalettes, saveAllPalettes } from "@/lib/storage/local-storage"
import { generateShades } from "@/lib/core/color"
import { SHADE_KEYS } from "@/lib/core/types"

export function usePaletteColorAdder() {
    const { toast } = useToast()

    const addColorToPalette = useCallback((hex: string) => {
        try {
            const palettes = getAllPalettes()
            if (palettes.length === 0) {
                toast({
                    title: "No palettes found",
                    description: "Create a palette first in the main page.",
                    variant: "destructive"
                })
                return
            }

            const firstPalette = palettes[0]
            const oldShades = generateShades(hex)
            const shades = SHADE_KEYS.map(key => ({
                shade: parseInt(key),
                hex: oldShades[key]
            }))

            const newColor = {
                id: crypto.randomUUID(),
                name: `Color ${firstPalette.baseColors.length + 1}`,
                baseHex: hex,
                shades,
            }

            const updatedPalette = {
                ...firstPalette,
                baseColors: [...firstPalette.baseColors, newColor],
                updatedAt: Date.now()
            }

            const updatedPalettes = palettes.map(p =>
                p.id === firstPalette.id ? updatedPalette : p
            )

            saveAllPalettes(updatedPalettes)
            toast({
                title: "Color added",
                description: `Added ${hex.toUpperCase()} to "${firstPalette.name}"`,
            })
        } catch {
            toast({
                title: "Error",
                description: "Failed to add color to palette.",
                variant: "destructive"
            })
        }
    }, [toast])

    return { addColorToPalette }
}
