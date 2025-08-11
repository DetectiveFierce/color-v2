"use client"

import { Plus, Upload, Palette as PaletteIcon, Share2, Layers, TrendingUp, Droplet } from 'lucide-react'
import ColorSpectrumIcon from '@/components/shared/color-spectrum-icon'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { FormatSelector, type ColorFormat } from "@/components/shared/format-selector"
import ThemeSwitcher from "@/components/shared/theme-switcher"
import PaletteList from "@/components/palette/palette-list"
import { type Palette } from "@/lib/core/types"

interface AppHeaderProps {
    query: string
    onQueryChange: (query: string) => void
    palettes: Palette[]
    selectedId: string
    onSelectPalette: (id: string) => void
    onDeletePalette: (id: string) => void
    onDuplicatePalette: (id: string) => Palette | undefined
    onRenamePalette: (id: string, name: string) => void
    onAddRandomPalette: () => Palette | undefined
    onReorderPalettes: (fromIndex: number, toIndex: number) => void
    onAddPalette: () => void
    onImportFile: (file: File | null) => void
    onExportOpen: () => void
    colorFormat: ColorFormat
    onColorFormatChange: (format: ColorFormat) => void
    mobileNavOpen: boolean
    onMobileNavChange: (open: boolean) => void
}

export default function AppHeader({
    query,
    onQueryChange,
    palettes,
    selectedId,
    onSelectPalette,
    onDeletePalette,
    onDuplicatePalette,
    onRenamePalette,
    onAddRandomPalette,
    onReorderPalettes,
    onAddPalette,
    onImportFile,
    onExportOpen,
    colorFormat,
    onColorFormatChange,
    mobileNavOpen,
    onMobileNavChange,
}: AppHeaderProps) {
    return (
        <header className="sticky top-0 z-30 bg-background/98 backdrop-blur-subtle border-b shadow-soft">
            <div className="flex items-center justify-between px-4 sm:px-6 md:px-8">
                <div className="mx-auto max-w-[1400px] w-full flex items-center justify-between gap-4 sm:gap-6">
                    {/* Left section */}
                    <div className="flex items-center gap-4 sm:gap-6">
                        <Sheet open={mobileNavOpen} onOpenChange={onMobileNavChange}>
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
                                        onChange={(e) => onQueryChange(e.target.value)}
                                        className="mb-4"
                                    />
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
                            </SheetContent>
                        </Sheet>

                        <div className="hidden md:flex items-center gap-4">
                            <div className="flex items-center gap-3 text-foreground">
                                <div className="p-2.5 rounded-xl bg-primary/10">
                                    <ColorSpectrumIcon size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-lg tracking-tight">Huegolplex</span>
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
                                onChange={(e) => onQueryChange(e.target.value)}
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
                                onFormatChange={onColorFormatChange}
                                className="shadow-subtle transition-smooth hover:shadow-soft"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onExportOpen}
                                title="Open export options"
                                className="shadow-subtle transition-smooth hover:shadow-soft h-9"
                            >
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
                                    onImportFile(e.target.files?.[0] || null)
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
                        <Button onClick={onAddPalette} className="shadow-subtle transition-smooth hover:shadow-soft bg-primary hover:bg-primary/90 h-9">
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
    )
}
