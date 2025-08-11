"use client"

import { useEffect, useState } from 'react'

interface ColorSpectrumIconProps {
    className?: string
    size?: number
}

export default function ColorSpectrumIcon({ className = "", size = 20 }: ColorSpectrumIconProps) {
    const [hue1, setHue1] = useState(0)
    const [hue2, setHue2] = useState(120)
    const [hue3, setHue3] = useState(240)

    useEffect(() => {
        const interval1 = setInterval(() => {
            setHue1(prev => (prev + 1) % 360)
        }, 50) // Fastest speed

        const interval2 = setInterval(() => {
            setHue2(prev => (prev + 0.7) % 360)
        }, 50) // Medium speed

        const interval3 = setInterval(() => {
            setHue3(prev => (prev + 0.4) % 360)
        }, 50) // Slowest speed

        return () => {
            clearInterval(interval1)
            clearInterval(interval2)
            clearInterval(interval3)
        }
    }, [])

    const getColor = (hue: number) => {
        return `hsl(${hue}, 70%, 60%)`
    }

    const circleSize = size * 0.9

    // Calculate positions for equilateral triangle with equal overlap
    // Distance between circle centers for more substantial equal overlap
    const centerDistance = circleSize * 0.6 // Increased overlap (40% of circle diameter)
    const triangleHeight = centerDistance * Math.sin(Math.PI / 3) // sin(60°)

    // Center the triangle in the container, shifted slightly upwards
    const centerX = size / 2
    const centerY = size / 2 - size * 0.05 // Shifted up by 5% of the size

    // Top two circles
    const topY = centerY - triangleHeight / 3
    const leftX = centerX - centerDistance / 2
    const rightX = centerX + centerDistance / 2

    // Bottom circle
    const bottomY = centerY + (2 * triangleHeight) / 3

    return (
        <div
            className={`relative ${className}`}
            style={{ width: size, height: size }}
        >
            {/* Top left circle */}
            <div
                className="absolute rounded-full opacity-80"
                style={{
                    backgroundColor: getColor(hue1),
                    width: circleSize,
                    height: circleSize,
                    top: topY,
                    left: leftX,
                    transform: 'translate(-50%, -50%)',
                }}
            />
            {/* Top right circle */}
            <div
                className="absolute rounded-full opacity-70"
                style={{
                    backgroundColor: getColor(hue2),
                    width: circleSize,
                    height: circleSize,
                    top: topY,
                    left: rightX,
                    transform: 'translate(-50%, -50%)',
                }}
            />
            {/* Bottom circle */}
            <div
                className="absolute rounded-full opacity-60"
                style={{
                    backgroundColor: getColor(hue3),
                    width: circleSize,
                    height: circleSize,
                    top: bottomY,
                    left: centerX,
                    transform: 'translate(-50%, -50%)',
                }}
            />
        </div>
    )
}