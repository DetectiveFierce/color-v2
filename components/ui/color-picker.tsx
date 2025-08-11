"use client"

import React, { useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ColorPickerProps {
    color: string
    onColorChange: (color: string) => void
    className?: string
    showHexInput?: boolean
    showCopyButton?: boolean
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
}

export function ColorPicker({
    color,
    onColorChange,
    className,
    showHexInput = true,
    showCopyButton = false,
    size = 'md',
    disabled = false
}: ColorPickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [hexValue, setHexValue] = useState(color)

    // Update hex value when color prop changes
    React.useEffect(() => {
        setHexValue(color)
    }, [color])

    const handleHexChange = (value: string) => {
        setHexValue(value)
        // Only update if it's a valid hex color
        if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            onColorChange(value)
        }
    }

    const handleHexBlur = () => {
        // Ensure the hex value is valid on blur
        if (!/^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
            setHexValue(color)
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(color)
    }

    const sizeClasses = {
        sm: 'w-8 h-6',
        md: 'w-12 h-10',
        lg: 'w-16 h-12'
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "p-0 border-2 border-input hover:border-ring transition-all duration-200 cursor-pointer",
                        sizeClasses[size],
                        className
                    )}
                    disabled={disabled}
                    style={{ backgroundColor: color }}
                    onClick={() => setIsOpen(true)}
                >
                    <span className="sr-only">Open color picker</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
                <div className="space-y-3">
                    <HexColorPicker
                        color={color}
                        onChange={onColorChange}
                        className="w-full"
                    />

                    {showHexInput && (
                        <div className="flex gap-2 items-center">
                            <Input
                                value={hexValue}
                                onChange={(e) => handleHexChange(e.target.value)}
                                onBlur={handleHexBlur}
                                className="font-mono text-sm"
                                placeholder="#000000"
                            />
                            {showCopyButton && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={copyToClipboard}
                                    className="shrink-0"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
