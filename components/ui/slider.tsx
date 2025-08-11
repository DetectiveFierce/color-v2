"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

type UISliderProps = React.ComponentProps<typeof SliderPrimitive.Root> & {
    trackClassName?: string
    trackStyle?: React.CSSProperties
    rangeClassName?: string
    thumbClassName?: string
    size?: "sm" | "default"
}

function Slider({
    className,
    trackClassName,
    trackStyle,
    rangeClassName,
    thumbClassName,
    size = "default",
    ...props
}: UISliderProps) {
    return (
        <SliderPrimitive.Root
            data-slot="slider"
            data-size={size}
            className={cn("relative flex w-full touch-none select-none items-center", className)}
            {...props}
        >
            <SliderPrimitive.Track
                className={cn(
                    "relative h-4 w-full grow overflow-hidden rounded-full border border-input bg-muted shadow-subtle",
                    trackClassName
                )}
                style={trackStyle}
            >
                <SliderPrimitive.Range className={cn("absolute h-full bg-transparent", rangeClassName)} />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb
                className={cn(
                    "relative z-10 block size-5 rounded-full border-2 shadow outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 data-[state=active]:scale-95",
                    "bg-gradient-to-br from-[var(--globals-code-bg-400)] via-[var(--globals-code-bg-500)] to-[var(--globals-code-bg-600)]",
                    "border-[var(--globals-code-bg-600)]",
                    thumbClassName,
                    "data-[state=active]:!border-[var(--globals-token-500)]",
                    "data-[state=active]:!shadow-[0_0_0_2px_rgba(172,253,33,0.3)]"
                )}
            />
        </SliderPrimitive.Root>
    )
}

export { Slider }












