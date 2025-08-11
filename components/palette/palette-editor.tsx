"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Copy, Plus, X, Pencil, RotateCcw, RotateCw, Droplet, Layers, TrendingUp, Palette as PaletteIcon, Eye, Thermometer, BarChart3, Monitor } from 'lucide-react'
import { type Palette, type BaseColor, type ShadeKey } from "@/lib/core/types"
import { SHADE_KEYS } from "@/lib/core/types"
import { generateShades } from "@/lib/core/color"
import { formatColor } from "@/lib/core/color-formats"
import type { ColorFormat } from "@/components/shared/format-selector"
import { EmbeddedPicker } from "@/components/picker/embedded-picker"
import { MockupPreviews } from "./mockup-previews"
import { ContrastTester } from "./contrast-tester"
import { ColorPsychologyPanel } from "./color-psychology-panel"
import { AccessibilityPanel } from "./accessibility-panel"
import { TemperaturePanel } from "./temperature-panel"
import { ColorPicker } from "@/components/ui/color-picker"

type Props = {
  palette: Palette
  colorFormat?: ColorFormat
  onChange?: (palette: Palette) => void
  onExportTailwind?: () => void
  onExportCss?: () => void
  onExportJson?: () => void
  onExportUpdatedCss?: () => void
}

export default function PaletteEditor({
  palette,
  colorFormat = "hex",
  onChange = () => { },
  onExportTailwind = () => { },
  onExportCss = () => { },
  onExportJson = () => { },
  onExportUpdatedCss = () => { },
}: Props) {
  const { toast } = useToast()
  const [draft, setDraft] = useState<Palette>(palette)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [history, setHistory] = useState<Palette[]>([palette])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [selectedColorId, setSelectedColorId] = useState<string>(palette.baseColors[0]?.id || "")

  // Update selected color when palette structure changes (colors added/removed)
  useEffect(() => {
    if (palette.baseColors.length > 0) {
      // Only set to first color if no color is currently selected or if the selected color no longer exists
      if (!selectedColorId || !palette.baseColors.find(bc => bc.id === selectedColorId)) {
        setSelectedColorId(palette.baseColors[0].id)
      }
    }
  }, [palette.id, palette.baseColors, selectedColorId])

  function commit(next: Palette) {
    setDraft(next)
    onChange({ ...next, updatedAt: Date.now() })

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(next)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  function updateMeta(field: "name" | "description", value: string) {
    commit({ ...draft, [field]: value })
  }

  function addBaseColor() {
    const randomColor = "#4f46e5"
    const newColor: BaseColor = {
      id: crypto.randomUUID(),
      name: `Color ${draft.baseColors.length + 1}`,
      baseHex: randomColor,
      shades: SHADE_KEYS.map(key => ({
        shade: parseInt(key),
        hex: generateShades(randomColor)[key]
      }))
    }
    commit({ ...draft, baseColors: [...draft.baseColors, newColor] })
  }

  function removeBaseColor(id: string) {
    if (draft.baseColors.length <= 1) {
      toast({ title: "Cannot remove", description: "At least one base color is required.", variant: "destructive" })
      return
    }
    commit({ ...draft, baseColors: draft.baseColors.filter(bc => bc.id !== id) })
  }

  function updateBaseColor(id: string, updates: Partial<BaseColor>) {
    const updatedBaseColors = draft.baseColors.map(bc =>
      bc.id === id ? { ...bc, ...updates } : bc
    )
    commit({ ...draft, baseColors: updatedBaseColors })
  }

  function updateBaseColorName(id: string, name: string) {
    updateBaseColor(id, { name })
  }

  function updateBaseColorHex(id: string, hex: string) {
    const safe = hex.startsWith('#') ? hex : `#${hex}`
    updateBaseColor(id, { baseHex: safe })
  }

  function updateSelectedColorHex(hex: string) {
    if (selectedColorId) {
      updateBaseColorHex(selectedColorId, hex)
    }
  }

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      const previousState = history[newIndex]
      setDraft(previousState)
      setHistoryIndex(newIndex)
      onChange({ ...previousState, updatedAt: Date.now() })
    }
  }, [historyIndex, history, onChange])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      const nextState = history[newIndex]
      setDraft(nextState)
      setHistoryIndex(newIndex)
      onChange({ ...nextState, updatedAt: Date.now() })
    }
  }, [historyIndex, history, onChange])

  // Derived: TypeScript theme snippet and enhanced analysis
  const tsThemeText = useMemo(() => {
    const baseColors = draft.baseColors.map(bc => ({
      name: bc.name,
      baseHex: bc.baseHex,
      shades: bc.shades.map(shade => ({
        shade: shade.shade,
        hex: shade.hex
      }))
    }))
    return `export const palette = {
  baseColors: [
    ${baseColors.map(bc => `{
      name: "${bc.name}",
      baseHex: "${bc.baseHex}",
      shades: [
        ${bc.shades.map(shade => `{
          shade: ${shade.shade},
          hex: "${shade.hex}"
        }`).join(",")}
      ]
    }`).join(",")}
  ]
}`
  }, [draft])

  const analysis = useMemo(() => {
    const totalBaseColors = draft.baseColors.length
    const totalShades = draft.baseColors.reduce((acc, bc) => acc + bc.shades.length, 0)
    const seen = new Map<string, { count: number, entries: { base: string, shade: string }[] }>()

    // Color distribution analysis
    const colorDistribution = {
      light: 0,    // 50-400
      medium: 0,   // 500-600
      dark: 0      // 700-950
    }

    // Brightness analysis
    const brightnessLevels = {
      veryLight: 0,  // 0-20% lightness
      light: 0,      // 20-40% lightness
      medium: 0,     // 40-60% lightness
      dark: 0,       // 60-80% lightness
      veryDark: 0    // 80-100% lightness
    }

    draft.baseColors.forEach(bc => {
      bc.shades.forEach(shade => {
        const hex = shade.hex
        const rec = seen.get(hex) || { count: 0, entries: [] }
        rec.count += 1
        rec.entries.push({ base: bc.name, shade: shade.shade.toString() })
        seen.set(hex, rec)

        // Analyze shade distribution
        if (shade.shade <= 400) colorDistribution.light++
        else if (shade.shade <= 600) colorDistribution.medium++
        else colorDistribution.dark++

        // Analyze brightness (simplified - could use actual HSL conversion)
        const shadeIndex = SHADE_KEYS.indexOf(shade.shade.toString() as ShadeKey)
        if (shadeIndex <= 2) brightnessLevels.veryLight++
        else if (shadeIndex <= 4) brightnessLevels.light++
        else if (shadeIndex <= 6) brightnessLevels.medium++
        else if (shadeIndex <= 8) brightnessLevels.dark++
        else brightnessLevels.veryDark++
      })
    })

    const duplicates = Array.from(seen.entries())
      .filter(([, rec]) => rec.count > 1)
      .map(([hex, rec]) => ({ hex, count: rec.count, entries: rec.entries }))
      .sort((a, b) => b.count - a.count)

    const uniqueHexes = seen.size
    const efficiency = totalShades > 0 ? Math.round((uniqueHexes / totalShades) * 100) : 0

    // Palette balance score (0-100)
    const balanceScore = Math.min(100, Math.round(
      (Math.min(colorDistribution.light, colorDistribution.medium, colorDistribution.dark) /
        Math.max(colorDistribution.light, colorDistribution.medium, colorDistribution.dark)) * 100
    ))

    return {
      totalBaseColors,
      totalShades,
      uniqueHexes,
      duplicates,
      colorDistribution,
      brightnessLevels,
      efficiency,
      balanceScore
    }
  }, [draft])

  // Update draft when palette prop changes (external updates)
  useEffect(() => {
    setDraft(palette)
  }, [palette])

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault()
        undo()
      } else if ((event.metaKey || event.ctrlKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
        event.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [historyIndex, history, undo, redo])

  return (
    <div className="space-y-8 group">
      <Card className="shadow-elevated border-0 bg-card/90 backdrop-blur-sm rounded-xl">
        <CardHeader className="pb-6 border-b">
          <div className="relative">
            <CardTitle
              className="inline-flex items-center gap-2 cursor-pointer group/title"
              onClick={() => setIsEditingTitle(true)}
            >
              {isEditingTitle ? (
                <Input
                  value={draft.name}
                  onChange={(e) => updateMeta("name", e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsEditingTitle(false)
                    }
                  }}
                  placeholder="e.g. Brand & Marketing"
                  className="border-0 p-0 text-2xl font-semibold bg-transparent focus:ring-0 focus:ring-offset-0 focus:border-0 focus:outline-none resize-none shadow-none focus:shadow-none hover:border-0 focus:hover:border-0 h-auto min-h-0 w-auto"
                  style={{
                    fontSize: '24px',
                    fontFamily: 'inherit',
                    fontWeight: '600',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    height: 'auto',
                    minHeight: '0',
                    width: 'auto',
                    padding: '0',
                    margin: '0'
                  }}
                  autoFocus
                />
              ) : (
                <>
                  <span className="text-2xl font-semibold">
                    {draft.name || "e.g. Brand & Marketing"}
                  </span>
                  <Pencil className="h-4 w-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover/title:opacity-100 transition-opacity duration-200" />
                </>
              )}
            </CardTitle>
          </div>
          <CardDescription className="text-muted-foreground mt-2">Edit your palette with multiple base colors and auto-generated shades.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="desc" className="text-sm font-medium">Description</Label>
            <Textarea
              id="desc"
              rows={1}
              value={draft.description || ""}
              onChange={(e) => updateMeta("description", e.target.value)}
              placeholder="Optional description for your palette"
              className="resize-none"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-medium text-sm">Export Options</Label>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={historyIndex <= 0}
                  onClick={historyIndex > 0 ? undo : undefined}
                  className={`h-8 w-8 p-0 transition-smooth ${historyIndex <= 0 ? 'opacity-40' : 'hover:bg-muted/50'}`}
                  title="Undo (Ctrl+Z)"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={historyIndex >= history.length - 1}
                  onClick={historyIndex < history.length - 1 ? redo : undefined}
                  className={`h-8 w-8 p-0 transition-smooth ${historyIndex >= history.length - 1 ? 'opacity-40' : 'hover:bg-muted/50'}`}
                  title="Redo (Ctrl+Y)"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={onExportTailwind} className="shadow-subtle transition-smooth hover:shadow-soft h-9">
                <Copy className="h-4 w-4 mr-2" />
                Copy Tailwind
              </Button>
              <Button variant="outline" size="sm" onClick={onExportCss} className="shadow-subtle transition-smooth hover:shadow-soft h-9">
                <Copy className="h-4 w-4 mr-2" />
                Copy CSS
              </Button>
              <Button variant="outline" size="sm" onClick={onExportJson} className="shadow-subtle transition-smooth hover:shadow-soft h-9">
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
              {draft.cssSource && (
                <Button variant="outline" size="sm" onClick={onExportUpdatedCss} className="shadow-subtle transition-smooth hover:shadow-soft h-9">
                  <Download className="h-4 w-4 mr-2" />
                  Download Updated CSS
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Tabs defaultValue="shades" className="w-full">
        <TabsList>
          <TabsTrigger value="shades" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Shades
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="picker" className="flex items-center gap-2">
            <Droplet className="h-4 w-4" />
            Picker
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shades" className="space-y-8">
          <div className="space-y-8">
            {draft.baseColors.map((baseColor) => (
              <BaseColorRow
                key={baseColor.id}
                baseColor={baseColor}
                totalColors={draft.baseColors.length}
                colorFormat={colorFormat}
                onUpdateName={(name) => updateBaseColorName(baseColor.id, name)}
                onUpdateHex={(hex) => updateBaseColorHex(baseColor.id, hex)}
                onRemove={() => removeBaseColor(baseColor.id)}
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
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-8">
          {/* Enhanced Dashboard with Dynamic CSS Grid */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 auto-rows-auto">
              {/* Analysis Panel */}
              <div className="lg:col-span-6">
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-4 border-b flex-shrink-0">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <PaletteIcon className="h-5 w-5 text-primary" />
                      Analysis
                    </CardTitle>
                    <CardDescription>Overview of palette structure and duplicates.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-6">
                      {/* Basic Stats */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-semibold">{analysis.totalBaseColors}</div>
                          <div className="text-xs text-muted-foreground">Base colors</div>
                        </div>
                        <div>
                          <div className="text-2xl font-semibold">{analysis.totalShades}</div>
                          <div className="text-xs text-muted-foreground">Total shades</div>
                        </div>
                        <div>
                          <div className="text-2xl font-semibold">{analysis.uniqueHexes}</div>
                          <div className="text-xs text-muted-foreground">Unique hexes</div>
                        </div>
                      </div>

                      {/* Efficiency & Balance Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 rounded-lg bg-muted/30">
                          <div className="text-lg font-semibold">{analysis.efficiency}%</div>
                          <div className="text-xs text-muted-foreground">Efficiency</div>
                          <div className="text-xs text-muted-foreground">(unique/total)</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/30">
                          <div className="text-lg font-semibold">{analysis.balanceScore}</div>
                          <div className="text-xs text-muted-foreground">Balance Score</div>
                          <div className="text-xs text-muted-foreground">(0-100)</div>
                        </div>
                      </div>

                      {/* Color Distribution */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Shade Distribution</div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center p-2 rounded bg-blue-50 dark:bg-blue-950/20">
                            <div className="font-semibold">{analysis.colorDistribution.light}</div>
                            <div className="text-muted-foreground">Light</div>
                          </div>
                          <div className="text-center p-2 rounded bg-yellow-50 dark:bg-yellow-950/20">
                            <div className="font-semibold">{analysis.colorDistribution.medium}</div>
                            <div className="text-muted-foreground">Medium</div>
                          </div>
                          <div className="text-center p-2 rounded bg-gray-50 dark:bg-gray-950/20">
                            <div className="font-semibold">{analysis.colorDistribution.dark}</div>
                            <div className="text-muted-foreground">Dark</div>
                          </div>
                        </div>
                      </div>

                      {/* Brightness Levels */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Brightness Levels</div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Very Light</span>
                            <span className="font-mono">{analysis.brightnessLevels.veryLight}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Light</span>
                            <span className="font-mono">{analysis.brightnessLevels.light}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Medium</span>
                            <span className="font-mono">{analysis.brightnessLevels.medium}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Dark</span>
                            <span className="font-mono">{analysis.brightnessLevels.dark}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Very Dark</span>
                            <span className="font-mono">{analysis.brightnessLevels.veryDark}</span>
                          </div>
                        </div>
                      </div>

                      {/* Duplicates Section */}
                      {analysis.duplicates.length > 0 ? (
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Duplicate hex values</div>
                          <div className="scrollable-content rounded-md border p-2 text-sm max-h-20 overflow-y-auto">
                            {analysis.duplicates.map((d) => (
                              <div key={d.hex} className="py-1">
                                <div className="font-mono">{d.hex.toUpperCase()} <span className="text-xs text-muted-foreground">×{d.count}</span></div>
                                <div className="text-xs text-muted-foreground">{d.entries.map(e => `${e.base} ${e.shade}`).join(", ")}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground text-center py-2 bg-green-50 dark:bg-green-950/20 rounded">
                          ✓ No duplicate hex values across shades
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Temperature Panel */}
              <div className="lg:col-span-6">
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-4 border-b flex-shrink-0">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Thermometer className="h-5 w-5 text-primary" />
                      Temperature & Brightness
                    </CardTitle>
                    <CardDescription>Color temperature and brightness analysis.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <TemperaturePanel palette={draft} />
                  </CardContent>
                </Card>
              </div>

              {/* Psychology Panel */}
              <div className="lg:col-span-6">
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-4 border-b flex-shrink-0">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Color Psychology
                    </CardTitle>
                    <CardDescription>Mood and associations analysis.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ColorPsychologyPanel palette={draft} />
                  </CardContent>
                </Card>
              </div>

              {/* Accessibility Panel */}
              <div className="lg:col-span-6">
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-4 border-b flex-shrink-0">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Eye className="h-5 w-5 text-primary" />
                      Accessibility
                    </CardTitle>
                    <CardDescription>WCAG compliance and contrast analysis.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <AccessibilityPanel palette={draft} />
                  </CardContent>
                </Card>
              </div>

              {/* Quick Edit Panel */}
              <div className="lg:col-span-3">
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-4 border-b flex-shrink-0">
                    <CardTitle className="text-lg font-semibold">Quick Edit</CardTitle>
                    <CardDescription>Rename colors or tweak base hex values.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-3">
                      {draft.baseColors.map((bc) => (
                        <div key={bc.id} className="grid grid-cols-[160px_1fr] gap-3 items-center">
                          <Input
                            value={bc.name}
                            onChange={(e) => updateBaseColorName(bc.id, e.target.value)}
                            placeholder="Color name"
                          />
                          <div className="flex gap-3 items-center">
                            <ColorPicker
                              color={bc.baseHex}
                              onColorChange={(color) => updateBaseColorHex(bc.id, color)}
                              size="sm"
                              showHexInput={false}
                            />
                            <Input
                              value={bc.baseHex}
                              onChange={(e) => updateBaseColorHex(bc.id, e.target.value)}
                              placeholder="#000000"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Mockup Previews */}
              <div className="lg:col-span-9">
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-4 border-b flex-shrink-0">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Monitor className="h-5 w-5 text-primary" />
                      Live Mockup Previews
                    </CardTitle>
                    <CardDescription>See your colors in action across different contexts.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <MockupPreviews palette={draft} />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contrast Tester */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-12">
                <ContrastTester palette={draft} />
              </div>
            </div>
          </div>

          {/* TypeScript Theme Section (existing) */}
          <Card className="shadow-elevated border-0 bg-card/90 backdrop-blur-sm rounded-xl">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-lg font-semibold">TypeScript Theme</CardTitle>
              <CardDescription>Exportable TS object for use in apps; includes full shades.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <Textarea value={tsThemeText} readOnly rows={12} className="font-mono text-sm" />
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(tsThemeText)
                    toast({ title: "Copied", description: "TypeScript theme copied to clipboard." })
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy TS
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="picker" className="space-y-8">
          <EmbeddedPicker
            palette={draft}
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
              commit({ ...draft, baseColors: [...draft.baseColors, newColor] })
              // Select the newly added color
              setSelectedColorId(newColor.id)
            }}
            onDeleteColor={(baseColorId) => {
              const updatedBaseColors = draft.baseColors.filter(bc => bc.id !== baseColorId)
              if (updatedBaseColors.length === 0) {
                toast({ title: "Cannot delete", description: "At least one base color is required.", variant: "destructive" })
                return
              }
              commit({ ...draft, baseColors: updatedBaseColors })
              // If the deleted color was selected, select the first remaining color
              if (selectedColorId === baseColorId) {
                setSelectedColorId(updatedBaseColors[0]?.id || "")
              }
            }}
          />
        </TabsContent>
      </Tabs>
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
}: {
  baseColor: BaseColor
  totalColors: number
  colorFormat: ColorFormat
  onUpdateName: (name: string) => void
  onUpdateHex: (hex: string) => void
  onRemove: () => void
}) {
  const { toast } = useToast()

  const handleShadeClick = (hex: string) => {
    const formattedColor = formatColor(hex, colorFormat)
    navigator.clipboard.writeText(formattedColor)
    toast({
      title: `${formattedColor} copied to clipboard!`,
      duration: 2000,
    })
  }

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
                  onClick={() => handleShadeClick(hex)}
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
