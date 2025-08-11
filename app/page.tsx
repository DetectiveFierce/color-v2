"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Upload, Palette as PaletteIcon, Copy, Share2, Droplet } from 'lucide-react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

import { type Palette } from "@/lib/core/types"
import { generateRandomColor, generateShades } from "@/lib/core/color"
import { createEmptyPalette, defaultStarterPalettes } from "@/lib/core/palette"
import { getAllPalettes, saveAllPalettes } from "@/lib/storage/local-storage"
import { mergePalettesToTailwindSnippet, paletteToTailwindSnippet } from "@/lib/import-export/tailwind"
import { paletteToCssVarsSnippet, createPaletteFromCss, updateCssWithPalette, updatePaletteFromCssIfNeeded } from "@/lib/import-export/css"
import { palettesToJson, parsePalettesJson } from "@/lib/import-export/json"
import PaletteEditor from "@/components/palette/palette-editor"
import ExportDialog from "@/components/export/export-dialog"
import PaletteList from "@/components/palette/palette-list"
import ThemeSwitcher from "@/components/shared/theme-switcher"

import { FormatSelector, type ColorFormat } from "@/components/shared/format-selector"

export default function Page() {
  const { toast } = useToast()
  const [palettes, setPalettes] = useState<Palette[]>([])
  const [selectedId, setSelectedId] = useState<string>("")
  const [query, setQuery] = useState<string>("")
  const [exportOpen, setExportOpen] = useState<boolean>(false)
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false)
  const [colorFormat, setColorFormat] = useState<ColorFormat>("hex")

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
        const updatedBaseColors = palette.baseColors.map(baseColor => ({
          ...baseColor,
          shades: generateShades(baseColor.hex)
        }))

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

      // Show notification that palettes were updated
      toast({
        title: "Palettes updated",
        description: "All palettes have been updated with proper shade ordering."
      })
    }
  }, [])

  // Remove the automatic persistence useEffect to prevent race conditions
  // We'll save explicitly when needed

  const selected = useMemo(() => palettes.find((p) => p.id === selectedId) || null, [palettes, selectedId])

  const filteredPalettes = useMemo(() => {
    if (!query) return palettes
    const q = query.toLowerCase()
    return palettes.filter((p) => p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q))
  }, [palettes, query])

  function handleAddPalette() {
    const p = createEmptyPalette("New Palette")
    const updatedPalettes = [p, ...palettes]
    setPalettes(updatedPalettes)
    setSelectedId(p.id)
    saveAllPalettes(updatedPalettes)
    toast({ title: "Palette created", description: "A new palette was added." })
  }

  function handleAddPaletteWithRandomColor() {
    const randomColor = generateRandomColor()
    const p: Palette = {
      id: crypto.randomUUID(),
      name: "New Palette",
      description: "",
      baseColors: [
        {
          id: crypto.randomUUID(),
          name: "Primary",
          hex: randomColor,
          shades: generateShades(randomColor),
        }
      ],
      updatedAt: Date.now(),
    }
    const updatedPalettes = [...palettes, p]
    setPalettes(updatedPalettes)
    setSelectedId(p.id)
    saveAllPalettes(updatedPalettes)
    toast({ title: "Palette created", description: "A new palette with random color was added." })
  }

  function handleDeletePalette(id: string) {
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
  }

  function handleDuplicatePalette(id: string) {
    const p = palettes.find((x) => x.id === id)
    if (!p) return
    const copy: Palette = {
      ...p,
      id: crypto.randomUUID(),
      name: `${p.name} Copy`,
      updatedAt: Date.now(),
    }
    const updatedPalettes = [copy, ...palettes]
    setPalettes(updatedPalettes)
    setSelectedId(copy.id)
    saveAllPalettes(updatedPalettes)
    toast({ title: "Duplicated", description: "The palette was duplicated." })
  }

  function handleRenamePalette(id: string, name: string) {
    const updatedPalettes = palettes.map((p) => (p.id === id ? { ...p, name, updatedAt: Date.now() } : p))
    setPalettes(updatedPalettes)
    saveAllPalettes(updatedPalettes)
  }

  function handleUpdatePalette(updated: Palette) {
    const updatedPalettes = palettes.map((p) => (p.id === updated.id ? updated : p))
    setPalettes(updatedPalettes)
    saveAllPalettes(updatedPalettes)
  }

  function handleExportAllToClipboard() {
    const snippet = mergePalettesToTailwindSnippet(palettes)
    navigator.clipboard.writeText(snippet)
    toast({ title: "Copied", description: "Tailwind colors snippet copied." })
  }

  async function handleImportJSON(file: File | null) {
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

        // Immediately save to localStorage
        saveAllPalettes(updatedPalettes)

        toast({
          title: "CSS imported",
          description: `Palette "${name}" was created from CSS with ${importedPalette.baseColors.length} colors.`
        })
        return
      }

      // Handle JSON import (existing logic)
      const imported = parsePalettesJson(text)
      // Merge by name; if same name, suffix with number
      const existingNames = new Set(palettes.map((p) => p.name))
      const withUniqueNames = imported.map((p) => {
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

      // Immediately save to localStorage
      saveAllPalettes(combined)

      toast({ title: "Imported", description: `${withUniqueNames.length} palette(s) imported.` })
    } catch (error) {
      toast({
        title: "Import failed",
        description: `Failed to import file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      })
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden bg-smooth">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.015)_1px,transparent_0)] bg-[length:32px_32px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/2 to-transparent pointer-events-none" />

      <header className="sticky top-0 z-30 bg-background/98 backdrop-blur-subtle border-b shadow-soft">
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-8">
          <div className="mx-auto max-w-[1400px] w-full flex items-center justify-between gap-4 sm:gap-6">
            {/* Left section */}
            <div className="flex items-center gap-4 sm:gap-6">
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="outline" size="icon" aria-label="Open palettes" className="h-9 w-9">
                    <PaletteIcon className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] sm:w-[400px] p-0">
                  <SheetHeader className="p-6 border-b">
                    <SheetTitle className="flex items-center justify-between text-lg font-semibold">
                      Palettes
                      <ThemeSwitcher />
                    </SheetTitle>
                  </SheetHeader>
                  <div className="p-6 w-full">
                    <Input
                      placeholder="Search palettes..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="mb-4"
                    />
                    <PaletteList
                      palettes={filteredPalettes}
                      selectedId={selectedId}
                      onSelect={setSelectedId}
                      onDelete={handleDeletePalette}
                      onDuplicate={handleDuplicatePalette}
                      onRename={handleRenamePalette}
                      onAddRandom={handleAddPaletteWithRandomColor}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-3 text-foreground">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <PaletteIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-lg tracking-tight">Palette Manager</span>
                    <span className="text-xs text-muted-foreground">Design system colors</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center section */}
            <div className="flex-1 max-w-xl mx-2 sm:mx-4 md:mx-6">
              <div className="relative">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search palettes..."
                  aria-label="Search palettes"
                  className="pl-10"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Right section - Action buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:flex items-center gap-2 sm:gap-3">
                <FormatSelector
                  currentFormat={colorFormat}
                  onFormatChange={setColorFormat}
                  className="shadow-subtle transition-smooth hover:shadow-soft"
                />
                <Button variant="outline" size="sm" onClick={() => setExportOpen(true)} title="Open export options" className="shadow-subtle transition-smooth hover:shadow-soft h-9">
                  <Share2 className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              <label className="inline-flex">
                <input
                  type="file"
                  accept="application/json, text/css"
                  className="hidden"
                  onChange={(e) => {
                    handleImportJSON(e.target.files?.[0] || null)
                    e.target.value = "" // Reset file input value
                  }}
                />
                <Button variant="outline" size="sm" asChild className="shadow-subtle transition-smooth hover:shadow-soft h-9">
                  <span className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </span>
                </Button>
              </label>
              <Button onClick={handleAddPalette} className="shadow-subtle transition-smooth hover:shadow-soft bg-primary hover:bg-primary/90 h-9">
                <Plus className="h-4 w-4 mr-2" />
                New
              </Button>
            </div>
          </div>

          {/* Theme toggle - positioned at the very right edge */}
          <div className="ml-4 md:ml-8 lg:ml-12">
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Horizontal scrolling palette list */}
      <div className="mx-auto max-w-[1400px] px-6 md:px-8 py-4">
        <div className="flex items-center gap-4 mb-2">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <PaletteIcon className="h-5 w-5 text-primary" />
            Palettes
          </h2>
          <div className="text-sm text-muted-foreground">
            {filteredPalettes.length} palette{filteredPalettes.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-3 min-w-max">
            <PaletteList
              palettes={filteredPalettes}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDelete={handleDeletePalette}
              onDuplicate={handleDuplicatePalette}
              onRename={handleRenamePalette}
              onAddRandom={handleAddPalette}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 md:px-8 pb-8">
        <section aria-label="Palette editor" className="min-h-[600px]">
          {selected ? (
            <PaletteEditor
              key={selected.id}
              palette={selected}
              colorFormat={colorFormat}
              onChange={handleUpdatePalette}
              onExportTailwind={() => {
                const snippet = paletteToTailwindSnippet(selected)
                navigator.clipboard.writeText(snippet)
                toast({ title: "Copied", description: "Tailwind snippet copied to clipboard." })
              }}
              onExportCss={() => {
                const css = paletteToCssVarsSnippet(selected)
                navigator.clipboard.writeText(css)
                toast({ title: "Copied", description: "CSS variables copied to clipboard." })
              }}
              onExportJson={() => {
                const blob = new Blob([palettesToJson([selected])], { type: "application/json" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `${selected.name.replace(/\s+/g, "-").toLowerCase()}-palette.json`
                a.click()
                URL.revokeObjectURL(url)
              }}
              onExportUpdatedCss={selected.cssSource ? () => {
                const updatedCss = updateCssWithPalette(selected.cssSource!.content, selected)
                const blob = new Blob([updatedCss], { type: "text/css" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `${selected.name.replace(/\s+/g, "-").toLowerCase()}-updated.css`
                a.click()
                URL.revokeObjectURL(url)
                toast({ title: "Downloaded", description: "Updated CSS file downloaded." })
              } : undefined}
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
                <Button onClick={handleAddPalette} className="shadow-subtle transition-smooth hover:shadow-soft bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  New Palette
                </Button>
              </CardContent>
            </Card>
          )}
        </section>
      </div>

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
