"use client"

import React, { useMemo } from 'react';
import { Sun, Cloud, Moon, Zap } from 'lucide-react';
import { type Palette } from "@/lib/core/types";
import { hexToRgb, rgbToHsl } from "@/lib/core/color";

interface TemperaturePanelProps {
    palette: Palette;
}

// CIE 1931 color space conversion for more accurate temperature calculations
function rgbToCie1931(r: number, g: number, b: number): { x: number; y: number; z: number } {
    // Convert sRGB to linear RGB
    const toLinear = (c: number) => {
        c = c / 255;
        return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };

    const rLinear = toLinear(r);
    const gLinear = toLinear(g);
    const bLinear = toLinear(b);

    // Convert to CIE XYZ
    const x = rLinear * 0.4124 + gLinear * 0.3576 + bLinear * 0.1805;
    const y = rLinear * 0.2126 + gLinear * 0.7152 + bLinear * 0.0722;
    const z = rLinear * 0.0193 + gLinear * 0.1192 + bLinear * 0.9505;

    return { x, y, z };
}

// Calculate correlated color temperature (CCT) using McCamy's approximation
function calculateCCT(x: number, y: number): number {
    const n = (x - 0.3320) / (y - 0.1858);
    return 449 * Math.pow(n, 3) + 3525 * Math.pow(n, 2) + 6823.3 * n + 5520.33;
}

// Convert CCT to mired (micro reciprocal degree)
function cctToMired(cct: number): number {
    return 1000000 / cct;
}

// More accurate temperature classification based on color science
function classifyTemperature(hue: number, saturation: number, lightness: number, cct?: number): {
    temperature: 'warm' | 'cool' | 'neutral';
    confidence: number;
    cct?: number;
} {
    let temperature: 'warm' | 'cool' | 'neutral';
    let confidence = 0;

    // For very low saturation colors (grays), use CCT if available
    if (saturation < 10) {
        if (cct) {
            if (cct < 4000) {
                temperature = 'warm';
                confidence = 0.9;
            } else if (cct > 7000) {
                temperature = 'cool';
                confidence = 0.9;
            } else {
                temperature = 'neutral';
                confidence = 0.8;
            }
        } else {
            // For grays without CCT, use lightness as proxy
            if (lightness < 30) {
                temperature = 'cool';
                confidence = 0.6;
            } else if (lightness > 70) {
                temperature = 'warm';
                confidence = 0.6;
            } else {
                temperature = 'neutral';
                confidence = 0.7;
            }
        }
    } else {
        // For saturated colors, use improved hue-based classification
        // Warm colors: Reds, oranges, yellows (0°-60° and 330°-360°)
        // Cool colors: Blues, cyans, purples (180°-300°)
        // Neutral colors: Greens, teals (60°-180°)

        if ((hue >= 0 && hue < 60) || (hue >= 330 && hue <= 360)) {
            temperature = 'warm';
            confidence = Math.min(0.9, 0.6 + (saturation / 100) * 0.3);
        } else if (hue >= 180 && hue < 300) {
            temperature = 'cool';
            confidence = Math.min(0.9, 0.6 + (saturation / 100) * 0.3);
        } else {
            temperature = 'neutral';
            confidence = Math.min(0.8, 0.5 + (saturation / 100) * 0.3);
        }
    }

    return { temperature, confidence, cct };
}

export function TemperaturePanel({ palette }: TemperaturePanelProps) {
    const analysis = useMemo(() => {
        const colors = palette.baseColors;

        // Analyze all colors in the palette with improved calculations
        const colorAnalysis = colors.map(color => {
            const { r, g, b } = hexToRgb(color.baseHex);
            const { h, s, l } = rgbToHsl(r, g, b);

            // Calculate CIE 1931 coordinates
            const { x, y } = rgbToCie1931(r, g, b);

            // Calculate CCT (only for colors that can be approximated)
            let cct: number | undefined;
            try {
                cct = calculateCCT(x, y);
                // Filter out unrealistic CCT values
                if (cct < 1000 || cct > 40000) {
                    cct = undefined;
                }
            } catch {
                cct = undefined;
            }

            const { temperature, confidence, cct: finalCct } = classifyTemperature(h, s, l, cct);

            return {
                name: color.name,
                hex: color.baseHex,
                temperature,
                confidence: Math.round(confidence * 100),
                brightness: Math.round(l),
                saturation: Math.round(s),
                hue: Math.round(h),
                cct: finalCct,
                mired: finalCct ? Math.round(cctToMired(finalCct)) : undefined
            };
        });

        // Calculate overall palette metrics
        const avgBrightness = Math.round(
            colorAnalysis.reduce((sum, color) => sum + color.brightness, 0) / colorAnalysis.length
        );

        const avgSaturation = Math.round(
            colorAnalysis.reduce((sum, color) => sum + color.saturation, 0) / colorAnalysis.length
        );

        const avgConfidence = Math.round(
            colorAnalysis.reduce((sum, color) => sum + color.confidence, 0) / colorAnalysis.length
        );

        // Calculate weighted temperature based on confidence
        const temperatureScores = colorAnalysis.reduce((acc, color) => {
            const weight = color.confidence / 100;
            if (color.temperature === 'warm') acc.warm += weight;
            else if (color.temperature === 'cool') acc.cool += weight;
            else acc.neutral += weight;
            return acc;
        }, { warm: 0, cool: 0, neutral: 0 });

        const dominantTemperature = Object.entries(temperatureScores)
            .sort(([, a], [, b]) => b - a)[0][0] as 'warm' | 'cool' | 'neutral';

        // Calculate average CCT for colors that have it
        const colorsWithCct = colorAnalysis.filter(c => c.cct);
        const avgCct = colorsWithCct.length > 0
            ? Math.round(colorsWithCct.reduce((sum, c) => sum + (c.cct || 0), 0) / colorsWithCct.length)
            : undefined;

        // Temperature distribution with confidence weighting
        const temperatureCounts = colorAnalysis.reduce((acc, color) => {
            acc[color.temperature] = (acc[color.temperature] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            colors: colorAnalysis,
            dominantTemperature,
            avgBrightness,
            avgSaturation,
            avgConfidence,
            avgCct,
            temperatureCounts,
            temperatureScores
        };
    }, [palette]);

    const getTemperatureIcon = (temp: string) => {
        switch (temp) {
            case 'warm': return <Sun className="h-4 w-4 text-orange-500" />;
            case 'cool': return <Cloud className="h-4 w-4 text-blue-500" />;
            default: return <Moon className="h-4 w-4 text-gray-500" />;
        }
    };

    const getTemperatureColor = (temp: string) => {
        switch (temp) {
            case 'warm': return 'text-orange-600 bg-orange-100 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800';
            case 'cool': return 'text-blue-600 bg-blue-100 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800';
            default: return 'text-gray-600 bg-gray-100 border-gray-200 dark:bg-gray-950/20 dark:border-gray-800';
        }
    };

    const getCctDescription = (cct?: number) => {
        if (!cct) return 'Not available';
        if (cct < 2000) return 'Candlelight';
        if (cct < 3000) return 'Warm white';
        if (cct < 4000) return 'Cool white';
        if (cct < 5000) return 'Daylight';
        if (cct < 6500) return 'Cool daylight';
        return 'Blue sky';
    };

    return (
        <div className="space-y-4">
            {/* Overall Temperature */}
            <div className="text-center">
                <div className={`inline-flex items-center px-4 py-2 rounded-full font-bold text-lg border ${getTemperatureColor(analysis.dominantTemperature)}`}>
                    {getTemperatureIcon(analysis.dominantTemperature)}
                    <span className="ml-2 capitalize">{analysis.dominantTemperature}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                    Dominant Temperature ({analysis.avgConfidence}% confidence)
                </div>
                {analysis.avgCct && (
                    <div className="text-xs text-muted-foreground mt-1">
                        Avg CCT: {analysis.avgCct}K ({getCctDescription(analysis.avgCct)})
                    </div>
                )}
            </div>

            {/* Brightness & Saturation */}
            <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                    <div className="text-2xl font-semibold">{analysis.avgBrightness}%</div>
                    <div className="text-xs text-muted-foreground">Average Brightness</div>
                    <div className="mt-2 w-full bg-muted rounded-full h-2">
                        <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${analysis.avgBrightness}%` }}
                        />
                    </div>
                </div>
                <div>
                    <div className="text-2xl font-semibold">{analysis.avgSaturation}%</div>
                    <div className="text-xs text-muted-foreground">Average Saturation</div>
                    <div className="mt-2 w-full bg-muted rounded-full h-2">
                        <div
                            className="bg-secondary h-2 rounded-full transition-all"
                            style={{ width: `${analysis.avgSaturation}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Temperature Distribution */}
            <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Temperature Distribution</h4>
                <div className="space-y-2">
                    {Object.entries(analysis.temperatureCounts).map(([temp, count]) => (
                        <div key={temp} className="flex items-center justify-between p-2 bg-muted/30 rounded border">
                            <div className="flex items-center gap-2">
                                {getTemperatureIcon(temp)}
                                <span className="text-sm capitalize">{temp}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-semibold">{count} colors</span>
                                <div className="text-xs text-muted-foreground">
                                    {Math.round(analysis.temperatureScores[temp as keyof typeof analysis.temperatureScores] * 100)}% weight
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Color Breakdown */}
            <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Color Analysis</h4>
                <div className="space-y-2 max-h-32 overflow-auto">
                    {analysis.colors.slice(0, 6).map((color, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-muted/30 rounded border">
                            <div
                                className="w-6 h-6 rounded border"
                                style={{ backgroundColor: color.hex }}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{color.name}</div>
                                <div className="text-xs text-muted-foreground">
                                    B: {color.brightness}% | S: {color.saturation}% | C: {color.confidence}%
                                </div>
                                {color.cct && (
                                    <div className="text-xs text-muted-foreground">
                                        CCT: {color.cct}K
                                    </div>
                                )}
                            </div>
                            {getTemperatureIcon(color.temperature)}
                        </div>
                    ))}
                </div>
            </div>

            {/* Temperature Guide */}
            <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-1">
                    <Sun className="h-3 w-3 text-orange-500" />
                    <span>Warm: Reds, oranges, yellows (0°-60°, 330°-360°)</span>
                </div>
                <div className="flex items-center gap-1">
                    <Cloud className="h-3 w-3 text-blue-500" />
                    <span>Cool: Blues, cyans, purples (180°-300°)</span>
                </div>
                <div className="flex items-center gap-1">
                    <Moon className="h-3 w-3 text-gray-500" />
                    <span>Neutral: Greens, teals (60°-180°)</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                    <Zap className="h-3 w-3 text-yellow-500" />
                    <span>Confidence based on saturation and CCT calculations</span>
                </div>
            </div>
        </div>
    );
}
