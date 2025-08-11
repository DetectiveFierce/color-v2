import { useState, useEffect, useCallback } from "react"
import { useToast } from "./use-toast"
import { type Palette } from "@/lib/core/types"
import { getAllPalettes, saveAllPalettes } from "@/lib/storage/local-storage"
import { defaultStarterPalettes } from "@/lib/core/palette"
import { createEmptyPalette } from "@/lib/core/palette"
import { createHarmoniousPalette } from "@/lib/core/palette-generator"
import { generateShades } from "@/lib/core/color"
import { SHADE_KEYS } from "@/lib/core/types"
import { updatePaletteFromCssIfNeeded } from "@/lib/import-export/css"

export function usePaletteManager() {
    const { toast } = useToast()
    const [palettes, setPalettes] = useState<Palette[]>([])
    const [selectedId, setSelectedId] = useState<string>("")
    const [query, setQuery] = useState<string>("")

    // Load from localStorage on mount
    useEffect(() => {
        const loaded = getAllPalettes()

        if (loaded.length === 0) {
            const starters = defaultStarterPalettes()
            setPalettes(starters)
            setSelectedId(starters[0]?.id || "")
            saveAllPalettes(starters)
        } else {
            // Force regenerate shades for proper ordering and check for CSS updates
            const updatedPalettes = loaded.map(palette => {
                // Regenerate shades for proper gradient ordering
                const updatedBaseColors = palette.baseColors.map(baseColor => {
                    const oldShades = generateShades(baseColor.baseHex)
                    const shades = SHADE_KEYS.map(key => ({
                        shade: parseInt(key),
                        hex: oldShades[key]
                    }))

                    return {
                        ...baseColor,
                        shades
                    }
                })

                const paletteWithUpdatedShades = {
                    ...palette,
                    baseColors: updatedBaseColors,
                    updatedAt: Date.now()
                }

                // Check for CSS updates, but always use the updated shades
                const cssUpdated = updatePaletteFromCssIfNeeded(paletteWithUpdatedShades)
                if (cssUpdated) {
                    // If CSS update happened, merge the updated shades with CSS changes
                    return {
                        ...cssUpdated,
                        baseColors: updatedBaseColors // Always use our regenerated shades
                    }
                }

                return paletteWithUpdatedShades
            })

            setPalettes(updatedPalettes)
            setSelectedId(updatedPalettes[0]?.id || "")

            // Always save the updated palettes to ensure proper shade ordering
            saveAllPalettes(updatedPalettes)
        }
    }, [toast])

    const addPalette = useCallback((): Palette => {
        const p = createEmptyPalette("New Palette")
        const updatedPalettes = [...palettes, p]
        setPalettes(updatedPalettes)
        setSelectedId(p.id)
        saveAllPalettes(updatedPalettes)
        toast({ title: "Palette created", description: "A new palette was added." })
        return p
    }, [palettes, toast])

    const addRandomPalette = useCallback((): Palette | undefined => {
        const p = createHarmoniousPalette()
        const updatedPalettes = [...palettes, p]
        setPalettes(updatedPalettes)
        setSelectedId(p.id)
        saveAllPalettes(updatedPalettes)
        toast({
            title: "Palette created",
            description: `A new palette with ${p.baseColors.length} harmonious colors was added.`
        })
        return p
    }, [palettes, toast])

    const deletePalette = useCallback((id: string) => {
        const paletteToDelete = palettes.find((p) => p.id === id)
        if (!paletteToDelete) return

        const updatedPalettes = palettes.filter((p) => p.id !== id)
        setPalettes(updatedPalettes)
        saveAllPalettes(updatedPalettes)

        if (selectedId === id) {
            setSelectedId(() => {
                const next = updatedPalettes.find((p) => p.id !== id)
                return next?.id || ""
            })
        }

        toast({
            title: "Deleted",
            description: "The palette was removed. Click to undo.",
            onClick: () => {
                const restoredPalettes = [...updatedPalettes, paletteToDelete]
                setPalettes(restoredPalettes)
                saveAllPalettes(restoredPalettes)
                toast({
                    title: "Undone",
                    description: "The palette was restored.",
                    duration: 2000
                })
            }
        })
    }, [palettes, selectedId, toast])

    const duplicatePalette = useCallback((id: string): Palette | undefined => {
        const p = palettes.find((x) => x.id === id)
        if (!p) return undefined
        const copy: Palette = {
            ...p,
            id: crypto.randomUUID(),
            name: `${p.name} Copy`,
            updatedAt: Date.now(),
        }

        // Insert the copy right after the source palette
        const sourceIndex = palettes.findIndex(palette => palette.id === id)
        const updatedPalettes = [...palettes]
        updatedPalettes.splice(sourceIndex + 1, 0, copy)

        setPalettes(updatedPalettes)
        setSelectedId(copy.id)
        saveAllPalettes(updatedPalettes)
        toast({ title: "Duplicated", description: "The palette was duplicated." })
        return copy
    }, [palettes, toast])

    const renamePalette = useCallback((id: string, name: string) => {
        const updatedPalettes = palettes.map((p) => (p.id === id ? { ...p, name, updatedAt: Date.now() } : p))
        setPalettes(updatedPalettes)
        saveAllPalettes(updatedPalettes)
    }, [palettes])

    const updatePalette = useCallback((updated: Palette) => {
        const updatedPalettes = palettes.map((p) => (p.id === updated.id ? updated : p))
        setPalettes(updatedPalettes)
        saveAllPalettes(updatedPalettes)
    }, [palettes])

    const reorderPalettes = useCallback((fromIndex: number, toIndex: number) => {
        const updatedPalettes = [...palettes]
        const [movedPalette] = updatedPalettes.splice(fromIndex, 1)
        updatedPalettes.splice(toIndex, 0, movedPalette)
        setPalettes(updatedPalettes)
        saveAllPalettes(updatedPalettes)
    }, [palettes])

    const importPalettes = useCallback((importedPalettes: Palette[]) => {
        // Merge by name; if same name, suffix with number
        const existingNames = new Set(palettes.map((p) => p.name))
        const withUniqueNames = importedPalettes.map((p) => {
            let name = p.name
            let i = 2
            while (existingNames.has(name)) {
                name = `${p.name} (${i})`
                i++
            }
            existingNames.add(name)
            return { ...p, name }
        })
        const combined = [...withUniqueNames, ...palettes]
        setPalettes(combined)
        setSelectedId(withUniqueNames[0]?.id || selectedId)
        saveAllPalettes(combined)
        toast({ title: "Imported", description: `${withUniqueNames.length} palette(s) imported.` })
    }, [palettes, selectedId, toast])

    const addImportedPalette = useCallback((importedPalette: Palette) => {
        // Ensure unique name
        const existingNames = new Set(palettes.map((p) => p.name))
        let name = importedPalette.name
        let i = 2
        while (existingNames.has(name)) {
            name = `${importedPalette.name} (${i})`
            i++
        }

        const paletteWithUniqueName = { ...importedPalette, name }
        const updatedPalettes = [paletteWithUniqueName, ...palettes]
        setPalettes(updatedPalettes)
        setSelectedId(paletteWithUniqueName.id)
        saveAllPalettes(updatedPalettes)

        toast({
            title: "CSS imported",
            description: `Palette "${name}" was created from CSS with ${importedPalette.baseColors.length} colors.`
        })
    }, [palettes, toast])

    return {
        palettes,
        selectedId,
        query,
        setSelectedId,
        setQuery,
        addPalette,
        addRandomPalette,
        deletePalette,
        duplicatePalette,
        renamePalette,
        updatePalette,
        reorderPalettes,
        importPalettes,
        addImportedPalette,
    }
}
