"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ColorHarmonies } from "@/components/picker/color-harmonies"
import { ColorVariations } from "@/components/picker/color-variations"

interface ColorDetailsAreaProps {
    baseHex: string
    onAddToPalette: () => void
}

export default function ColorDetailsArea({ baseHex, onAddToPalette }: ColorDetailsAreaProps) {
    return (
        <div className="space-y-6">
            <ColorHarmonies baseHex={baseHex} />
            <ColorVariations baseHex={baseHex} />

            {/* Add Color to Palette Button */}
            <div className="group/add-button h-10 hover:h-14 transition-all duration-300 overflow-hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-full h-full opacity-0 group-hover/add-button:opacity-100 transition-all duration-300 text-muted-foreground hover:text-foreground border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40"
                    onClick={onAddToPalette}
                >
                    <Plus className="h-5 w-5" />
                </Button>
            </div>
        </div>
    )
}
