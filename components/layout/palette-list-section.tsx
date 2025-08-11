"use client"

import { Palette as PaletteIcon } from 'lucide-react'
import PaletteList from "@/components/palette/palette-list"
import { type Palette } from "@/lib/core/types"

interface PaletteListSectionProps {
    palettes: Palette[]
    selectedId: string
    onSelectPalette: (id: string) => void
    onDeletePalette: (id: string) => void
    onDuplicatePalette: (id: string) => Palette | undefined
    onRenamePalette: (id: string, name: string) => void
    onAddRandomPalette: () => Palette | undefined
    onReorderPalettes: (fromIndex: number, toIndex: number) => void
}

export default function PaletteListSection({
    palettes,
    selectedId,
    onSelectPalette,
    onDeletePalette,
    onDuplicatePalette,
    onRenamePalette,
    onAddRandomPalette,
    onReorderPalettes,
}: PaletteListSectionProps) {
    return (
        <div className="mx-auto max-w-[1400px] px-6 md:px-8 py-4">
            <div className="flex items-center gap-4 mb-2">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                    <PaletteIcon className="h-5 w-5 text-primary" />
                    Palettes
                </h2>
                <div className="text-sm text-muted-foreground">
                    {palettes.length} palette{palettes.length !== 1 ? 's' : ''}
                </div>
            </div>
            <div className="overflow-x-auto pb-2">
                <div className="flex gap-3 min-w-max">
                    <PaletteList
                        palettes={palettes}
                        selectedId={selectedId}
                        onSelect={onSelectPalette}
                        onDelete={onDeletePalette}
                        onDuplicate={onDuplicatePalette}
                        onRename={onRenamePalette}
                        onAddRandom={onAddRandomPalette}
                        onReorder={onReorderPalettes}
                    />
                </div>
            </div>
        </div>
    )
}
