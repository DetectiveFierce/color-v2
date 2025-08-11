"use client"

import { Plus, Palette as PaletteIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import PaletteEditor from "@/components/palette/palette-editor"
import { type Palette } from "@/lib/core/types"
import type { ColorFormat } from "@/components/shared/format-selector"

interface PaletteEditorSectionProps {
    selectedPalette: Palette | null
    colorFormat: ColorFormat
    onUpdatePalette: (palette: Palette) => void
    onExportTailwind: () => void
    onExportCss: () => void
    onExportJson: () => void
    onExportUpdatedCss?: () => void
    onAddPalette: () => void
}

export default function PaletteEditorSection({
    selectedPalette,
    colorFormat,
    onUpdatePalette,
    onExportTailwind,
    onExportCss,
    onExportJson,
    onExportUpdatedCss,
    onAddPalette,
}: PaletteEditorSectionProps) {
    return (
        <div className="mx-auto max-w-[1400px] px-6 md:px-8 pb-8">
            <section aria-label="Palette editor" className="min-h-[600px]">
                {selectedPalette ? (
                    <PaletteEditor
                        key={selectedPalette.id}
                        palette={selectedPalette}
                        colorFormat={colorFormat}
                        onChange={onUpdatePalette}
                        onExportTailwind={onExportTailwind}
                        onExportCss={onExportCss}
                        onExportJson={onExportJson}
                        onExportUpdatedCss={onExportUpdatedCss}
                    />
                ) : (
                    <Card className="shadow-elevated border-0 bg-card/90 backdrop-blur-sm rounded-xl h-full flex items-center justify-center">
                        <CardContent className="text-center py-16">
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                                <PaletteIcon className="h-10 w-10 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-semibold mb-3">No palette selected</CardTitle>
                            <CardDescription className="text-muted-foreground mb-8 max-w-sm mx-auto">
                                Create a palette to get started with your design system.
                            </CardDescription>
                            <Button onClick={onAddPalette} className="shadow-subtle transition-smooth hover:shadow-soft bg-primary hover:bg-primary/90">
                                <Plus className="h-4 w-4 mr-2" />
                                New Palette
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </section>
        </div>
    )
}
