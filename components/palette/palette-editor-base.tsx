"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"

import { Download, Copy, Plus, X, Pencil, RotateCcw, RotateCw, TrendingUp, Droplet, Layers } from 'lucide-react'
import { type Palette, type BaseColor, type ShadeKey } from "@/lib/core/types"
import { SHADE_KEYS } from "@/lib/core/types"
import { generateShades } from "@/lib/core/color"
import { formatColor } from "@/lib/core/color-formats"
import type { ColorFormat } from "@/components/shared/format-selector"
import { ColorPicker } from "@/components/ui/color-picker"

type Props = {
    palette: Palette
    colorFormat?: ColorFormat
    onChange?: (palette: Palette) => void
    onExportTailwind?: () => void
    onExportCss?: () => void
    onExportJson?: () => void
    onExportUpdatedCss?: () => void
    children?: React.ReactNode
}

export default function PaletteEditorBase({
    palette,
    colorFormat = "hex",
    onChange = () => { },
    onExportTailwind = () => { },
    onExportCss = () => { },
    onExportJson = () => { },
    onExportUpdatedCss = () => { },
    children,
}: Props) {
    const { toast } = useToast()
    const pathname = usePathname()
    const [draft, setDraft] = useState<Palette>(palette)
    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [history, setHistory] = useState<Palette[]>([palette])
    const [historyIndex, setHistoryIndex] = useState(0)

    // Update selected color when palette changes
    useEffect(() => {
        if (palette.baseColors.length > 0) {
            // Only set to first color if no color is currently selected or if the selected color no longer exists
            if (!draft.baseColors.find(bc => bc.id === draft.baseColors[0]?.id)) {
                setDraft(palette)
            }
        }
    }, [palette.id, palette.baseColors])

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
        // Generate new shades for the updated base color
        const newShades = SHADE_KEYS.map(key => ({
            shade: parseInt(key),
            hex: generateShades(safe)[key]
        }))
        updateBaseColor(id, { baseHex: safe, shades: newShades })
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

            <div className="w-full">
                <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground mb-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className={`flex items-center gap-2 h-7 px-3 ${pathname === "/" ? "bg-background text-foreground shadow-sm" : ""}`}
                    >
                        <Link href="/">
                            <TrendingUp className="h-4 w-4" />
                            Dashboard
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className={`flex items-center gap-2 h-7 px-3 ${pathname === "/picker" ? "bg-background text-foreground shadow-sm" : ""}`}
                    >
                        <Link href="/picker">
                            <Droplet className="h-4 w-4" />
                            Picker
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className={`flex items-center gap-2 h-7 px-3 ${pathname === "/shades" ? "bg-background text-foreground shadow-sm" : ""}`}
                    >
                        <Link href="/shades">
                            <Layers className="h-4 w-4" />
                            Shades
                        </Link>
                    </Button>
                </div>

                {children}
            </div>
        </div>
    )
}
