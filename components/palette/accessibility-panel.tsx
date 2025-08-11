"use client"

import React, { useMemo } from 'react';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { type Palette } from "@/lib/core/types";
import { hexToRgb } from "@/lib/core/color";

interface AccessibilityPanelProps {
    palette: Palette;
}

export function AccessibilityPanel({ palette }: AccessibilityPanelProps) {
    const analysis = useMemo(() => {
        const colors = palette.baseColors;
        const allColors = colors.flatMap(color =>
            color.shades.map(shade => ({
                hex: shade.hex,
                name: `${color.name} ${shade.shade}`,
                baseName: color.name
            }))
        );

        // Calculate contrast ratio between two colors
        const getContrastRatio = (hex1: string, hex2: string) => {
            const rgb1 = hexToRgb(hex1);
            const rgb2 = hexToRgb(hex2);

            const getLuminance = (r: number, g: number, b: number) => {
                const [rs, gs, bs] = [r, g, b].map(c => {
                    c = c / 255;
                    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
                });
                return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
            };

            const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
            const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

            const lighter = Math.max(l1, l2);
            const darker = Math.min(l1, l2);

            return (lighter + 0.05) / (darker + 0.05);
        };

        // Test common background-foreground combinations
        const testPairs = [];
        const backgrounds = ['#FFFFFF', '#000000', '#F5F5F5', '#333333'];

        for (const color of allColors.slice(0, 8)) { // Limit to first 8 colors for performance
            for (const bg of backgrounds) {
                const ratio = getContrastRatio(color.hex, bg);
                const level = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Fail';

                testPairs.push({
                    background: bg,
                    foreground: color.hex,
                    foregroundName: color.name,
                    ratio: Math.round(ratio * 100) / 100,
                    level,
                    passes: level !== 'Fail'
                });
            }
        }

        const passingPairs = testPairs.filter(pair => pair.passes);
        const overallScore = Math.round((passingPairs.length / testPairs.length) * 100);

        return {
            pairs: testPairs,
            overallScore,
            passingCount: passingPairs.length,
            totalCount: testPairs.length,
            aaCount: testPairs.filter(p => p.level === 'AA').length,
            aaaCount: testPairs.filter(p => p.level === 'AAA').length
        };
    }, [palette]);

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'AAA': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'AA': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
            default: return <XCircle className="h-4 w-4 text-red-600" />;
        }
    };

    return (
        <div className="space-y-4">
            {/* Overall Score */}
            <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                    {analysis.overallScore}%
                </div>
                <div className="text-sm text-muted-foreground">
                    Accessibility Score
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                    {analysis.passingCount} of {analysis.totalCount} combinations pass WCAG
                </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                    <div className="text-lg font-semibold text-green-600">{analysis.aaaCount}</div>
                    <div className="text-xs text-muted-foreground">AAA</div>
                </div>
                <div>
                    <div className="text-lg font-semibold text-yellow-600">{analysis.aaCount}</div>
                    <div className="text-xs text-muted-foreground">AA</div>
                </div>
                <div>
                    <div className="text-lg font-semibold text-red-600">{analysis.totalCount - analysis.passingCount}</div>
                    <div className="text-xs text-muted-foreground">Fail</div>
                </div>
            </div>

            {/* Top Combinations */}
            <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Best Combinations</h4>
                <div className="space-y-2 max-h-72 overflow-auto">
                    {analysis.pairs
                        .filter(pair => pair.passes)
                        .sort((a, b) => b.ratio - a.ratio)
                        .slice(0, 5)
                        .map((pair, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded border min-h-[3rem]">
                                <div className="flex items-center gap-3 flex-1">
                                    <div
                                        className="w-6 h-6 rounded border"
                                        style={{ backgroundColor: pair.background }}
                                    />
                                    <div
                                        className="w-6 h-6 rounded border"
                                        style={{ backgroundColor: pair.foreground }}
                                    />
                                    <span className="text-sm font-mono">{pair.ratio}:1</span>
                                </div>
                                {getLevelIcon(pair.level)}
                            </div>
                        ))}
                </div>
            </div>

            {/* WCAG Guidelines */}
            <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span>AAA: 7:1 ratio (excellent)</span>
                </div>
                <div className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-yellow-600" />
                    <span>AA: 4.5:1 ratio (good)</span>
                </div>
                <div className="flex items-center gap-1">
                    <XCircle className="h-3 w-3 text-red-600" />
                    <span>Fail: Below 4.5:1 ratio</span>
                </div>
            </div>
        </div>
    );
}
