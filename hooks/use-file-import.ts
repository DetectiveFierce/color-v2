import { useCallback } from "react"
import { useToast } from "./use-toast"
import { parsePalettesJson } from "@/lib/import-export/json"
import { createPaletteFromCss } from "@/lib/import-export/css"
import { type Palette } from "@/lib/core/types"

export function useFileImport(
    onImportPalettes: (palettes: Palette[]) => void,
    onImportSinglePalette: (palette: Palette) => void
) {
    const { toast } = useToast()

    const handleImportFile = useCallback(async (file: File | null) => {
        if (!file) return

        try {
            const text = await file.text()

            // Check if it's a CSS file
            if (file.name.endsWith('.css') || file.type === 'text/css') {
                const importedPalette = createPaletteFromCss(
                    text,
                    file.name.replace(/\.css$/, '').charAt(0).toUpperCase() +
                    file.name.replace(/\.css$/, '').slice(1).replace(/-/g, ' '),
                    file.name // Pass filename for source tracking
                )

                onImportSinglePalette(importedPalette)
                return
            }

            // Handle JSON import
            const imported = parsePalettesJson(text)
            onImportPalettes(imported)
        } catch (error) {
            toast({
                title: "Import failed",
                description: `Failed to import file: ${error instanceof Error ? error.message : 'Unknown error'}`,
                variant: "destructive"
            })
        }
    }, [onImportPalettes, onImportSinglePalette, toast])

    return { handleImportFile }
}
