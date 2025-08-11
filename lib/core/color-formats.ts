import { hexToRgb, rgbToHsl } from "./color"
import type { ColorFormat } from "@/components/shared/format-selector"

// Convert hex to different color formats
export function formatColor(hex: string, format: ColorFormat): string {
  const { r, g, b } = hexToRgb(hex)
  
  switch (format) {
    case "hex":
      return hex.toUpperCase()
    
    case "rgb":
      return `rgb(${r}, ${g}, ${b})`
    
    case "hsl":
      const { h, s, l } = rgbToHsl(r, g, b)
      return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`
    
    case "tailwind":
      // For Tailwind, we'll use a simple approach - you might want to enhance this
      // to match Tailwind's actual color palette
      return `[${hex}]`
    
    case "css":
      return `color: ${hex};`
    
    default:
      return hex.toUpperCase()
  }
}

// Get a human-readable format name
export function getFormatName(format: ColorFormat): string {
  switch (format) {
    case "hex": return "HEX"
    case "rgb": return "RGB"
    case "hsl": return "HSL"
    case "tailwind": return "Tailwind"
    case "css": return "CSS"
    default: return "HEX"
  }
}
