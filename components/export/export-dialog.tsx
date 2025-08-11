"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Download, FileJson } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { type Palette } from "@/lib/core/types"
import { mergePalettesToTailwindSnippet, paletteToTailwindSnippet } from "@/lib/import-export/tailwind"
import { paletteToCssVarsSnippet, updateCssWithPalette } from "@/lib/import-export/css"
import { palettesToJson } from "@/lib/import-export/json"

type Props = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  palettes?: Palette[]
  defaultSelectedId?: string
}

export default function ExportDialog({
  open = false,
  onOpenChange = () => { },
  palettes = [],
  defaultSelectedId = "",
}: Props) {
  const { toast } = useToast()
  const [mode, setMode] = useState<"one" | "all">("one")
  const [selectedId, setSelectedId] = useState<string>(defaultSelectedId || palettes[0]?.id || "")

  const selected = useMemo(() => palettes.find((p) => p.id === selectedId) || null, [palettes, selectedId])

  const tailwindText = useMemo(() => {
    return mode === "all" ? mergePalettesToTailwindSnippet(palettes) : selected ? paletteToTailwindSnippet(selected) : ""
  }, [mode, palettes, selected])

  const cssVarsText = useMemo(() => {
    return mode === "all"
      ? palettes.map((p) => paletteToCssVarsSnippet(p)).join("\n\n")
      : selected
        ? paletteToCssVarsSnippet(selected)
        : ""
  }, [mode, palettes, selected])

  const updatedCssText = useMemo(() => {
    if (mode === "all") {
      // For multiple palettes, find the first one with CSS source or return empty
      const paletteWithCss = palettes.find(p => p.cssSource)
      if (!paletteWithCss?.cssSource) return ""

      // Update CSS with all palettes - this is a simplified approach
      // In practice, you might want to handle multiple palettes differently
      let updatedCss = paletteWithCss.cssSource.content
      for (const palette of palettes) {
        updatedCss = updateCssWithPalette(updatedCss, palette)
      }
      return updatedCss
    }

    if (!selected?.cssSource) return ""
    return updateCssWithPalette(selected.cssSource.content, selected)
  }, [mode, palettes, selected])

  const hasUpdatedCss = useMemo(() => {
    return mode === "all"
      ? palettes.some(p => p.cssSource)
      : selected?.cssSource
  }, [mode, palettes, selected])

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied", description: "Content copied to clipboard." })
  }

  function handleDownloadJSON() {
    const target = mode === "all" ? palettes : selected ? [selected] : []
    const blob = new Blob([palettesToJson(target)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = mode === "all" ? "palettes.json" : `${selected?.name || "palette"}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleDownloadCSS() {
    const blob = new Blob([updatedCssText], { type: "text/css" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = mode === "all" ? "updated-styles.css" : `${selected?.name || "palette"}.css`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Export palettes</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <Label className="text-sm">Scope</Label>
            <div className="flex gap-2">
              <Button variant={mode === "one" ? "default" : "outline"} onClick={() => setMode("one")}>Single</Button>
              <Button variant={mode === "all" ? "default" : "outline"} onClick={() => setMode("all")}>All</Button>
            </div>

            {mode === "one" && (
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Select palette" />
                </SelectTrigger>
                <SelectContent>
                  {palettes.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <Tabs defaultValue="tailwind" className="w-full">
            <TabsList>
              <TabsTrigger value="tailwind">Tailwind</TabsTrigger>
              <TabsTrigger value="css">CSS Variables</TabsTrigger>
              {hasUpdatedCss && <TabsTrigger value="updated-css">Updated CSS</TabsTrigger>}
              <TabsTrigger value="json">JSON</TabsTrigger>
            </TabsList>

            <TabsContent value="tailwind" className="space-y-2">
              <Textarea value={tailwindText} readOnly rows={12} />
              <div className="flex gap-2">
                <Button onClick={() => handleCopy(tailwindText)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="css" className="space-y-2">
              <Textarea value={cssVarsText} readOnly rows={12} />
              <div className="flex gap-2">
                <Button onClick={() => handleCopy(cssVarsText)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </TabsContent>

            {hasUpdatedCss && (
              <TabsContent value="updated-css" className="space-y-2">
                <Textarea value={updatedCssText} readOnly rows={12} />
                <div className="flex gap-2">
                  <Button onClick={() => handleCopy(updatedCssText)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={handleDownloadCSS}>
                    <Download className="h-4 w-4 mr-2" />
                    Download CSS
                  </Button>
                </div>
              </TabsContent>
            )}

            <TabsContent value="json" className="space-y-2">
              <Textarea value={palettesToJson(mode === "all" ? palettes : selected ? [selected] : [])} readOnly rows={12} />
              <div className="flex gap-2">
                <Button onClick={handleDownloadJSON}>
                  <FileJson className="h-4 w-4 mr-2" />
                  Download JSON
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
