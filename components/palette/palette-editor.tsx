"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Copy, Plus, X, Pencil, RotateCcw, RotateCw, Droplet } from 'lucide-react'
import { type Palette, type BaseColor, SHADE_KEYS } from "@/lib/core/types"
import { ensureHashHex, generateShades, normalizeHex, generateRandomColor } from "@/lib/core/color"
import { useToast } from "@/hooks/use-toast"
import { paletteToTypeScriptTheme } from "@/lib/import-export/typescript"
import { EmbeddedPicker } from "@/components/picker/embedded-picker"
import { formatColor } from "@/lib/core/color-formats"
import type { ColorFormat } from "@/components/shared/format-selector"

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
    const randomColor = generateRandomColor()
    const newColor: BaseColor = {
      id: crypto.randomUUID(),
      name: `Color ${draft.baseColors.length + 1}`,
      hex: randomColor,
      shades: generateShades(randomColor),
    }
    commit({ ...draft, baseColors: [...draft.baseColors, newColor] })
  }

  function removeBaseColor(id: string) {
    if (draft.baseColors.length <= 1) {
      toast({ title: "Cannot remove", description: "At least one base color is required.", variant: "destructive" })
      return
    }
    const colorToDelete = draft.baseColors.find(c => c.id === id)
    if (!colorToDelete) return

    commit({ ...draft, baseColors: draft.baseColors.filter(c => c.id !== id) })

    toast({
      title: "Color removed",
      description: "The base color was removed. Click to undo.",
      onClick: () => {
        commit({
          ...draft,
          baseColors: [...draft.baseColors.filter(c => c.id !== id), colorToDelete]
        })
        toast({
          title: "Undone",
          description: "The color was restored.",
          duration: 2000
        })
      }
    })
  }

  function updateBaseColor(id: string, updates: Partial<BaseColor>) {
    const updatedColors = draft.baseColors.map(color => {
      if (color.id === id) {
        const updated = { ...color, ...updates }
        // Regenerate shades if hex changed
        if (updates.hex && updates.hex !== color.hex) {
          updated.shades = generateShades(updates.hex)
        }
        return updated
      }
      return color
    })
    commit({ ...draft, baseColors: updatedColors })
  }

  function updateBaseColorName(id: string, name: string) {
    updateBaseColor(id, { name })
  }

  function updateBaseColorHex(id: string, hex: string) {
    const safe = ensureHashHex(hex)
    updateBaseColor(id, { hex: safe })
  }

  function undo() {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      const previousState = history[newIndex]
      setDraft(previousState)
      setHistoryIndex(newIndex)
      onChange({ ...previousState, updatedAt: Date.now() })
    }
  }

  function redo() {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      const nextState = history[newIndex]
      setDraft(nextState)
      setHistoryIndex(newIndex)
      onChange({ ...nextState, updatedAt: Date.now() })
    }
  }

  // Derived: TypeScript theme snippet and basic analysis
  const tsThemeText = useMemo(() => paletteToTypeScriptTheme(draft), [draft])
  const analysis = useMemo(() => {
    const totalBaseColors = draft.baseColors.length
    const totalShades = draft.baseColors.reduce((acc, bc) => acc + Object.keys(bc.shades).length, 0)
    const seen = new Map<string, { count: number, entries: { base: string, shade: string }[] }>()
    draft.baseColors.forEach(bc => {
      SHADE_KEYS.forEach(k => {
        const hex = normalizeHex(bc.shades[k])
        const rec = seen.get(hex) || { count: 0, entries: [] }
        rec.count += 1
        rec.entries.push({ base: bc.name, shade: k })
        seen.set(hex, rec)
      })
    })
    const duplicates = Array.from(seen.entries())
      .filter(([, rec]) => rec.count > 1)
      .map(([hex, rec]) => ({ hex, count: rec.count, entries: rec.entries }))
      .sort((a, b) => b.count - a.count)
    const uniqueHexes = seen.size
    return { totalBaseColors, totalShades, uniqueHexes, duplicates }
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
  }, [historyIndex, history])

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
          <TabsTrigger value="shades">Shades</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="picker" className="flex items-center gap-2">
            <Droplet className="h-4 w-4" />
            Picker
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shades" className="space-y-8">
          <div className="space-y-8">
            {draft.baseColors.map((baseColor, index) => (
              <BaseColorRow
                key={baseColor.id}
                baseColor={baseColor}
                isFirst={index === 0}
                totalColors={draft.baseColors.length}
                colorFormat={colorFormat}
                onUpdate={(updates) => updateBaseColor(baseColor.id, updates)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-elevated border-0 bg-card/90 backdrop-blur-sm rounded-xl">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg font-semibold">Analysis</CardTitle>
                <CardDescription>Overview of palette structure and duplicates.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
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
                {analysis.duplicates.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Duplicate hex values</div>
                    <div className="max-h-40 overflow-auto rounded-md border p-2 text-sm">
                      {analysis.duplicates.map((d) => (
                        <div key={d.hex} className="py-1">
                          <div className="font-mono">{d.hex.toUpperCase()} <span className="text-xs text-muted-foreground">×{d.count}</span></div>
                          <div className="text-xs text-muted-foreground">{d.entries.map(e => `${e.base} ${e.shade}`).join(", ")}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No duplicate hex values across shades.</div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-elevated border-0 bg-card/90 backdrop-blur-sm rounded-xl">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg font-semibold">Quick Edit</CardTitle>
                <CardDescription>Rename colors or tweak base hex values.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {draft.baseColors.map((bc) => (
                  <div key={bc.id} className="grid grid-cols-[160px_1fr] gap-3 items-center">
                    <Input
                      value={bc.name}
                      onChange={(e) => updateBaseColorName(bc.id, e.target.value)}
                      placeholder="Color name"
                    />
                    <div className="flex gap-3 items-center">
                      <div
                        className="w-9 h-8 rounded-md border-2 border-input cursor-pointer"
                        style={{ background: bc.hex }}
                        onClick={(e) => {
                          // Programmatically open the hidden input in BaseColorRow is not trivial here.
                          // Provide direct text edit instead.
                        }}
                        title={bc.hex}
                      />
                      <Input
                        value={bc.hex}
                        onChange={(e) => updateBaseColorHex(bc.id, e.target.value)}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

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
            onColorSelect={(hex) => {
              // Optional: You could add logic here to update a selected color in the palette
              // Debug: Selected color
            }}
            onAddColor={(newColor) => {
              commit({ ...draft, baseColors: [...draft.baseColors, newColor] })
            }}
            onDeleteColor={(baseColorId) => {
              const updatedBaseColors = draft.baseColors.filter(bc => bc.id !== baseColorId)
              if (updatedBaseColors.length === 0) {
                toast({ title: "Cannot delete", description: "At least one base color is required.", variant: "destructive" })
                return
              }
              commit({ ...draft, baseColors: updatedBaseColors })
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BaseColorRow({
  baseColor,
  isFirst,
  totalColors,
  colorFormat,
  onUpdate,
  onUpdateName,
  onUpdateHex,
  onRemove,
}: {
  baseColor: BaseColor
  isFirst: boolean
  totalColors: number
  colorFormat: ColorFormat
  onUpdate: (updates: Partial<BaseColor>) => void
  onUpdateName: (name: string) => void
  onUpdateHex: (hex: string) => void
  onRemove: () => void
}) {
  const { toast } = useToast()
  const colorInputRef = React.useRef<HTMLInputElement>(null)

  const handleColorSquareClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (colorInputRef.current) {
      colorInputRef.current.style.position = 'fixed'
      colorInputRef.current.style.left = `${e.clientX}px`
      colorInputRef.current.style.top = `${e.clientY}px`
      colorInputRef.current.style.opacity = '0'
      colorInputRef.current.style.pointerEvents = 'none'
      colorInputRef.current.click()
    }
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
                <div
                  className="w-12 h-10 rounded-lg border-2 border-input cursor-pointer transition-all duration-200 hover:border-ring"
                  style={{ background: baseColor.hex }}
                  onClick={handleColorSquareClick}
                />
                <input
                  ref={colorInputRef}
                  type="color"
                  value={baseColor.hex}
                  onChange={(e) => onUpdateHex(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <Input
                value={baseColor.hex}
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
            {SHADE_KEYS.map((shade) => {
              const hex = baseColor.shades[shade]
              const shadeIndex = SHADE_KEYS.indexOf(shade)
              const isLight = shadeIndex <= 4 // 50, 100, 200, 300, 400 are light
              const textShadeIndex = isLight ? Math.min(shadeIndex + 3, SHADE_KEYS.length - 1) : Math.max(shadeIndex - 3, 0)
              const textColor = baseColor.shades[SHADE_KEYS[textShadeIndex]]

              return (
                <div
                  key={shade}
                  className="flex-1 flex flex-col justify-between hover:flex-[2] transition-shade cursor-pointer group/shade relative"
                  title={`${baseColor.name} ${shade}`}
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
                      {shade}
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

      {/* Hidden color input for color picker */}
      <input
        ref={colorInputRef}
        type="color"
        value={baseColor.hex}
        onChange={(e) => onUpdateHex(e.target.value)}
        className="hidden"
      />
    </div>
  )
}
