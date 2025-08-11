"use client"

import React, { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { type BaseColor } from '@/lib/core/types'

interface ColorSelectMenuProps {
    value: string
    onValueChange: (value: string) => void
    colors: BaseColor[]
    placeholder?: string
    className?: string
    disabled?: boolean
}

export function ColorSelectMenu({
    value,
    onValueChange,
    colors,
    placeholder = "Select a color...",
    className,
    disabled = false
}: ColorSelectMenuProps) {
    const [isOpen, setIsOpen] = useState(false)

    const selectedColor = colors.find(color => color.baseHex === value)

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isOpen}
                    className={cn(
                        "w-full justify-between",
                        !selectedColor && "text-muted-foreground",
                        className
                    )}
                    disabled={disabled}
                >
                    <div className="flex items-center gap-2">
                        {selectedColor && (
                            <div
                                className="w-4 h-4 rounded border border-border"
                                style={{ backgroundColor: selectedColor.baseHex }}
                            />
                        )}
                        <span className="truncate">
                            {selectedColor ? selectedColor.name : placeholder}
                        </span>
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <div className="max-h-60 overflow-auto">
                    {colors.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                            No colors available
                        </div>
                    ) : (
                        <div className="py-1">
                            {colors.map((color) => (
                                <button
                                    key={color.id}
                                    className={cn(
                                        "relative flex w-full cursor-pointer select-none items-center px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                        value === color.baseHex && "bg-accent text-accent-foreground"
                                    )}
                                    onClick={() => {
                                        onValueChange(color.baseHex)
                                        setIsOpen(false)
                                    }}
                                >
                                    <div className="flex items-center gap-2 flex-1">
                                        <div
                                            className="w-4 h-4 rounded border border-border"
                                            style={{ backgroundColor: color.baseHex }}
                                        />
                                        <span className="truncate">{color.name}</span>
                                    </div>
                                    {value === color.baseHex && (
                                        <Check className="ml-2 h-4 w-4 shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
