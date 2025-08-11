"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Copy, ChevronDown } from "lucide-react"

export type ColorFormat = "hex" | "rgb" | "hsl" | "tailwind" | "css"

interface FormatSelectorProps {
  onFormatChange: (format: ColorFormat) => void
  currentFormat: ColorFormat
  className?: string
}

const formatOptions: { value: ColorFormat; label: string; description: string }[] = [
  { value: "hex", label: "HEX", description: "#ff0000" },
  { value: "rgb", label: "RGB", description: "rgb(255, 0, 0)" },
  { value: "hsl", label: "HSL", description: "hsl(0, 100%, 50%)" },
  { value: "tailwind", label: "Tailwind", description: "text-red-500" },
  { value: "css", label: "CSS", description: "color: #ff0000" },
]

export function FormatSelector({ onFormatChange, currentFormat, className }: FormatSelectorProps) {
  const currentOption = formatOptions.find(option => option.value === currentFormat)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={`shadow-subtle transition-smooth hover:shadow-soft h-9 ${className}`}>
          <Copy className="h-4 w-4 mr-2" />
          {currentOption?.label}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {formatOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onFormatChange(option.value)}
            className={currentFormat === option.value ? "bg-accent" : ""}
          >
            <div className="flex flex-col">
              <span className="font-medium">{option.label}</span>
              <span className="text-xs text-muted-foreground">{option.description}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
