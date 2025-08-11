"use client"

import { useMemo, useState } from "react"
import { usePaletteManager, useFileImport, useToast } from "@/hooks"
import { paletteToTailwindSnippet } from "@/lib/import-export/tailwind"
import { paletteToCssVarsSnippet, updateCssWithPalette } from "@/lib/import-export/css"
import { palettesToJson } from "@/lib/import-export/json"
import ExportDialog from "@/components/export/export-dialog"
import AppHeader from "@/components/layout/app-header"
import AppBackground from "@/components/layout/app-background"
import PaletteListSection from "@/components/layout/palette-list-section"
import PaletteEditorSection from "@/components/layout/palette-editor-section"
import type { ColorFormat } from "@/components/shared/format-selector"

export default function ShadesPage() {
  const { toast } = useToast()
  const [exportOpen, setExportOpen] = useState<boolean>(false)
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false)
  const [colorFormat, setColorFormat] = useState<ColorFormat>("hex")

  const {
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
  } = usePaletteManager()

  const { handleImportFile } = useFileImport(importPalettes, addImportedPalette)

  const selected = useMemo(() => palettes.find((p) => p.id === selectedId) || null, [palettes, selectedId])

  const filteredPalettes = useMemo(() => {
    if (!query) return palettes
    const q = query.toLowerCase()
    return palettes.filter((p) => p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q))
  }, [palettes, query])

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden bg-smooth">
      <AppBackground />

      <AppHeader
        query={query}
        onQueryChange={setQuery}
        palettes={filteredPalettes}
        selectedId={selectedId}
        onSelectPalette={setSelectedId}
        onDeletePalette={deletePalette}
        onDuplicatePalette={duplicatePalette}
        onRenamePalette={renamePalette}
        onAddRandomPalette={addRandomPalette}
        onReorderPalettes={reorderPalettes}
        onAddPalette={addPalette}
        onImportFile={handleImportFile}
        onExportOpen={() => setExportOpen(true)}
        colorFormat={colorFormat}
        onColorFormatChange={setColorFormat}
        mobileNavOpen={mobileNavOpen}
        onMobileNavChange={setMobileNavOpen}
      />

      <PaletteListSection
        palettes={filteredPalettes}
        selectedId={selectedId}
        onSelectPalette={setSelectedId}
        onDeletePalette={deletePalette}
        onDuplicatePalette={duplicatePalette}
        onRenamePalette={renamePalette}
        onAddRandomPalette={addRandomPalette}
        onReorderPalettes={reorderPalettes}
      />

      <PaletteEditorSection
        selectedPalette={selected}
        colorFormat={colorFormat}
        onUpdatePalette={updatePalette}
        onExportTailwind={() => {
          if (selected) {
            const snippet = paletteToTailwindSnippet(selected)
            navigator.clipboard.writeText(snippet)
            toast({ title: "Copied", description: "Tailwind snippet copied to clipboard." })
          }
        }}
        onExportCss={() => {
          if (selected) {
            const css = paletteToCssVarsSnippet(selected)
            navigator.clipboard.writeText(css)
            toast({ title: "Copied", description: "CSS variables copied to clipboard." })
          }
        }}
        onExportJson={() => {
          if (selected) {
            const blob = new Blob([palettesToJson([selected])], { type: "application/json" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${selected.name.replace(/\s+/g, "-").toLowerCase()}-palette.json`
            a.click()
            URL.revokeObjectURL(url)
          }
        }}
        onExportUpdatedCss={selected?.cssSource ? () => {
          if (selected) {
            const updatedCss = updateCssWithPalette(selected.cssSource!.content, selected)
            const blob = new Blob([updatedCss], { type: "text/css" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${selected.name.replace(/\s+/g, "-").toLowerCase()}-updated.css`
            a.click()
            URL.revokeObjectURL(url)
            toast({ title: "Downloaded", description: "Updated CSS file downloaded." })
          }
        } : undefined}
        onAddPalette={addPalette}
        viewMode="shades"
      />

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        palettes={palettes}
        defaultSelectedId={selectedId}
      />

      <footer className="py-8" />
    </main>
  )
}
