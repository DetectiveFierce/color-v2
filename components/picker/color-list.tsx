"use client"

import React, { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Copy, Droplet, MoreHorizontal, Pencil, X, Plus } from "lucide-react"
import { hexToRgb, rgbToHsl, hslToRgb, rgbToHex } from "@/lib/core/color"
import type { Palette, BaseColor } from "@/lib/core/types"
import { SHADE_KEYS } from "@/lib/core/types"
import { useToast } from "@/hooks/use-toast"

// Function to get lighter/darker shade of the same color for text
function getContrastTextColor(hex: string): string {
    const { r, g, b } = hexToRgb(hex)
    const { h, s, l } = rgbToHsl(r, g, b)

    // Check if this is a neutral color (very low saturation)
    const isNeutral = s < 10

    if (isNeutral) {
        // For neutral colors, use pure black or white
        return l > 50 ? '#000000' : '#ffffff'
    }

    // For bright/neon colors (high saturation), use darker text for better readability
    // High saturation colors need darker text regardless of lightness
    let textLightness: number

    if (s > 80) {
        // For very saturated colors (like neon), always use darker text
        textLightness = Math.max(15, l - 50)
    } else if (l > 50) {
        // Light background - use darker shade of the same color
        textLightness = Math.max(20, l - 45)
    } else {
        // Dark background - use lighter shade of the same color
        textLightness = Math.min(80, l + 45)
    }

    // Ensure we don't lose too much saturation for better color visibility
    const textSaturation = Math.max(s * 0.8, 20)

    const { r: tr, g: tg, b: tb } = hslToRgb(h, textSaturation, textLightness)
    return rgbToHex(tr, tg, tb)
}

type ColorListProps = {
    palette: Palette
    selectedColorId?: string
    onColorSelect: (colorId: string) => void
    onAddColor?: (color: BaseColor) => void
    onDeleteColor?: (colorSource: string) => void
}

export function ColorList({ palette, selectedColorId, onColorSelect, onAddColor, onDeleteColor }: ColorListProps) {
    const { toast } = useToast()
    const [editingId, setEditingId] = useState<string>("")
    const [draftName, setDraftName] = useState<string>("")

    // Generate all colors from the palette for the scrollable list - memoized for performance
    const allColors = useMemo(() => {
        const colors: Array<{ id: string; hex: string; name: string; source: string }> = []

        palette.baseColors.forEach(baseColor => {
            // Only add base colors to the list
            colors.push({
                id: baseColor.id,
                hex: baseColor.baseHex,
                name: baseColor.name,
                source: `${baseColor.name} (base)`
            })
        })

        return colors
    }, [palette])

    const findBaseColorId = (colorSource: string): string | null => {
        const match = colorSource.match(/^(.+) \(base\)$/)
        if (match) {
            const colorName = match[1]
            const baseColor = palette.baseColors.find(bc => bc.name === colorName)
            return baseColor?.id || null
        }
        return null
    }

    // Add CSS for isolated hover effects and left scrollbar
    React.useEffect(() => {
        const style = document.createElement('style')
        style.textContent = `
            .color-list-item:hover .color-bg {
                width: 100% !important;
            }
            .color-list-item.selected:hover .color-bg {
                width: calc(100% - 4px) !important;
            }
            .color-list-item:hover .theme-bg {
                opacity: 0 !important;
            }
            .color-list-item:hover .text-content {
                margin-left: 0 !important;
            }
            .color-list-item.selected .text-content {
                margin-left: 62px !important;
            }
            .color-list-item.selected:hover .text-content {
                margin-left: 0 !important;
            }
            .color-list-item .three-dots-menu {
                opacity: 0 !important;
                transition: opacity 0.2s ease;
            }
            .color-list-item:hover .three-dots-menu {
                opacity: 1 !important;
            }
            .color-list-item:hover .color-name {
                color: var(--hover-color) !important;
            }
            .color-list-item:hover .color-hex {
                color: var(--hover-color) !important;
            }
            .color-list-item:hover .three-dots-menu button {
                color: var(--hover-color) !important;
            }
            .palette-scroll-container::-webkit-scrollbar {
                width: 6px;
            }
            .palette-scroll-container::-webkit-scrollbar-track {
                background: transparent;
            }
            .palette-scroll-container::-webkit-scrollbar-thumb {
                background: hsl(var(--muted-foreground) / 0.3);
                border-radius: 3px;
            }
            .palette-scroll-container::-webkit-scrollbar-thumb:hover {
                background: hsl(var(--muted-foreground) / 0.5);
            }
            @keyframes borderAppear {
                0% {
                    opacity: 0;
                }
                100% {
                    opacity: 1;
                }
            }
        `
        document.head.appendChild(style)

        return () => {
            document.head.removeChild(style)
        }
    }, [])

    return (
        <div className="sticky top-0">
            <Card className="shadow-elevated border-0 bg-card/90 backdrop-blur-sm rounded-xl flex flex-col">
                <CardHeader className="pb-4 border-b flex-shrink-0">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Droplet className="h-5 w-5 text-primary" />
                        Palette Colors
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden">
                    <div className="palette-scroll-container overflow-y-auto max-h-[calc(100vh-200px)]">
                        <div className="grid grid-cols-1 gap-1 p-4">
                            {allColors.map((color, index) => {
                                const isSelected = selectedColorId === color.id
                                return (
                                    <div
                                        key={`${color.source}-${index}`}
                                        className={cn(
                                            "color-list-item relative h-16 rounded-lg border border-transparent hover:border-input transition-all duration-200 text-left overflow-hidden hover:bg-transparent cursor-pointer",
                                            isSelected ? "p-[2px] selected" : ""
                                        )}
                                        onClick={() => {
                                            onColorSelect(color.id)
                                        }}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault()
                                                onColorSelect(color.id)
                                            }
                                        }}
                                    >
                                        {isSelected && (
                                            <div
                                                className="absolute inset-0 rounded-lg pointer-events-none opacity-0"
                                                style={{
                                                    background: `linear-gradient(135deg, var(--background) 0%, var(--background) 60%, rgba(172, 253, 33, 0.3) 80%, rgba(172, 253, 33, 0.6) 90%, var(--globals-token-500) 95%, var(--globals-token-500) 100%)`,
                                                    animation: 'borderAppear 1.2s ease-out 0.2s forwards'
                                                }}
                                            />
                                        )}
                                        {/* Left portion - color background */}
                                        <div
                                            className={cn(
                                                "color-bg absolute left-0 top-0 bottom-0 right-0 w-16 transition-all duration-200",
                                                isSelected ? "left-[2px] top-[2px] bottom-[2px] w-[64px] rounded-l-md rounded-r-md" : ""
                                            )}
                                            style={{ background: color.hex }}
                                        />
                                        {/* Right portion - theme background */}
                                        <div className={cn(
                                            "theme-bg absolute left-16 right-0 top-0 bottom-0 bg-card transition-all duration-200",
                                            isSelected ? "left-[62px] right-[2px] top-[2px] bottom-[2px] rounded-r-md" : ""
                                        )} />
                                        <div className="relative flex items-center h-full p-3 z-10">
                                            <div className="text-content min-w-0 flex-1 ml-16 transition-all duration-200">
                                                {editingId === color.source ? (
                                                    <form
                                                        onSubmit={(e) => {
                                                            e.preventDefault()
                                                            // TODO: Implement rename functionality
                                                            setEditingId("")
                                                        }}
                                                    >
                                                        <Input
                                                            size={1}
                                                            value={draftName}
                                                            autoFocus
                                                            onChange={(e) => setDraftName(e.target.value)}
                                                            onBlur={() => {
                                                                // TODO: Implement rename functionality
                                                                setEditingId("")
                                                            }}
                                                            className="h-7 text-sm"
                                                        />
                                                    </form>
                                                ) : (
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="flex flex-col min-w-0 flex-1">
                                                            <div className="text-sm font-medium truncate text-foreground" style={{ color: 'inherit' }}>
                                                                <span
                                                                    className="color-name transition-colors duration-200"
                                                                    style={{
                                                                        color: 'inherit',
                                                                        '--hover-color': getContrastTextColor(color.hex)
                                                                    } as React.CSSProperties}
                                                                >
                                                                    {color.name}
                                                                </span>
                                                            </div>
                                                            <div
                                                                className="text-xs font-mono text-muted-foreground color-hex transition-colors duration-200"
                                                                style={{
                                                                    color: 'inherit',
                                                                    '--hover-color': getContrastTextColor(color.hex)
                                                                } as React.CSSProperties}
                                                            >
                                                                {color.hex.toUpperCase()}
                                                            </div>
                                                        </div>
                                                        <div className="flex-shrink-0 three-dots-menu" onClick={(e) => e.stopPropagation()}>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        aria-label="More"
                                                                        className="h-8 w-8 transition-colors duration-200"
                                                                        style={{
                                                                            '--hover-color': getContrastTextColor(color.hex)
                                                                        } as React.CSSProperties}
                                                                    >
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-48">
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setEditingId(color.source)
                                                                            setDraftName(color.name)
                                                                        }}
                                                                    >
                                                                        <Pencil className="h-3 w-3 mr-2" />
                                                                        Rename
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => {
                                                                        // TODO: Implement duplicate functionality
                                                                        toast({
                                                                            title: "Duplicate",
                                                                            description: "Duplicate functionality not yet implemented.",
                                                                            duration: 2000,
                                                                        })
                                                                    }}>
                                                                        <Copy className="h-3 w-3 mr-2" />
                                                                        Duplicate
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            if (onDeleteColor) {
                                                                                const baseColorId = findBaseColorId(color.source)
                                                                                if (baseColorId) {
                                                                                    onDeleteColor(baseColorId)
                                                                                    toast({
                                                                                        title: "Color deleted",
                                                                                        description: `Deleted ${color.name}`,
                                                                                    })
                                                                                } else {
                                                                                    toast({
                                                                                        title: "Error",
                                                                                        description: "Could not find color to delete.",
                                                                                        variant: "destructive"
                                                                                    })
                                                                                }
                                                                            } else {
                                                                                toast({
                                                                                    title: "Delete",
                                                                                    description: "Delete functionality not available.",
                                                                                    duration: 2000,
                                                                                })
                                                                            }
                                                                        }}
                                                                        className="text-destructive focus:text-destructive"
                                                                    >
                                                                        <X className="h-3 w-3 mr-2" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}

                            {/* Add Color Button */}
                            <div className="group/add-button h-16 hover:h-20 transition-all duration-300 overflow-hidden">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-full h-full opacity-0 group-hover/add-button:opacity-100 transition-all duration-300 text-muted-foreground hover:text-foreground border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40 rounded-lg"
                                    onClick={() => {
                                        if (onAddColor) {
                                            const selectedColor = palette.baseColors.find(c => c.id === selectedColorId)
                                            const newColor = {
                                                id: crypto.randomUUID(),
                                                name: `Color ${palette.baseColors.length + 1}`,
                                                baseHex: selectedColor?.baseHex || "#4f46e5",
                                                shades: SHADE_KEYS.map(key => ({
                                                    shade: parseInt(key),
                                                    hex: selectedColor?.baseHex || "#4f46e5"
                                                }))
                                            }
                                            onAddColor(newColor)
                                            toast({
                                                title: "Color added",
                                                description: `Added ${selectedColor?.baseHex.toUpperCase() || "#4F46E5"} to palette`,
                                            })
                                        } else {
                                            toast({
                                                title: "Add Color",
                                                description: "Add color functionality not available.",
                                                duration: 2000,
                                            })
                                        }
                                    }}
                                >
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
