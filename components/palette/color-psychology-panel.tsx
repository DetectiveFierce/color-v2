"use client"

import React, { useMemo, useState } from 'react';
import { Heart, Zap, Target, ExternalLink } from 'lucide-react';
import { type Palette } from "@/lib/core/types";
import { hexToRgb, rgbToHsl } from "@/lib/core/color";
import { ColorSelectMenu } from '@/components/ui/color-select-menu';

interface ColorPsychologyPanelProps {
    palette: Palette;
}

export function ColorPsychologyPanel({ palette }: ColorPsychologyPanelProps) {
    const colors = palette.baseColors;
    const [selectedColor, setSelectedColor] = useState(colors[0]?.baseHex || '#000000');

    // Update selected color when palette changes
    React.useEffect(() => {
        if (colors.length > 0) {
            setSelectedColor(colors[0]?.baseHex || '#000000');
        }
    }, [colors]);

    const analysis = useMemo(() => {
        const { h, s, l } = rgbToHsl(hexToRgb(selectedColor).r, hexToRgb(selectedColor).g, hexToRgb(selectedColor).b);

        // Enhanced color psychology analysis based on colorpsychology.org
        const getMood = (hue: number, saturation: number, lightness: number) => {
            const moods = [];

            // Red spectrum (0-30°)
            if (hue >= 0 && hue < 15) {
                moods.push('Passionate', 'Energetic', 'Bold', 'Powerful');
            } else if (hue >= 15 && hue < 30) {
                moods.push('Warm', 'Comforting', 'Nurturing', 'Stimulating');
            }
            // Orange spectrum (30-45°)
            else if (hue >= 30 && hue < 45) {
                moods.push('Enthusiastic', 'Adventurous', 'Confident', 'Sociable');
            }
            // Yellow-Orange spectrum (45-60°)
            else if (hue >= 45 && hue < 60) {
                moods.push('Optimistic', 'Creative', 'Intellectual', 'Cheerful');
            }
            // Yellow spectrum (60-75°)
            else if (hue >= 60 && hue < 75) {
                moods.push('Joyful', 'Energetic', 'Intellectual', 'Clarity');
            }
            // Yellow-Green spectrum (75-90°)
            else if (hue >= 75 && hue < 90) {
                moods.push('Fresh', 'Harmonious', 'Balanced', 'Growth');
            }
            // Green spectrum (90-150°)
            else if (hue >= 90 && hue < 120) {
                moods.push('Natural', 'Peaceful', 'Balanced', 'Harmonious');
            } else if (hue >= 120 && hue < 150) {
                moods.push('Refreshing', 'Stable', 'Growth', 'Fertility');
            }
            // Blue-Green spectrum (150-180°)
            else if (hue >= 150 && hue < 180) {
                moods.push('Calming', 'Trustworthy', 'Reliable', 'Professional');
            }
            // Blue spectrum (180-240°)
            else if (hue >= 180 && hue < 210) {
                moods.push('Peaceful', 'Serene', 'Stable', 'Dependable');
            } else if (hue >= 210 && hue < 240) {
                moods.push('Intellectual', 'Corporate', 'Technology', 'Depth');
            }
            // Purple spectrum (240-300°)
            else if (hue >= 240 && hue < 270) {
                moods.push('Creative', 'Imaginative', 'Wise', 'Mysterious');
            } else if (hue >= 270 && hue < 300) {
                moods.push('Luxurious', 'Royal', 'Spiritual', 'Elegant');
            }
            // Magenta spectrum (300-360°)
            else {
                moods.push('Dynamic', 'Bold', 'Energetic', 'Passionate');
            }

            // Saturation-based mood modifiers
            if (saturation > 85) moods.push('Vibrant', 'Intense');
            else if (saturation > 60) moods.push('Rich', 'Expressive');
            else if (saturation > 30) moods.push('Muted', 'Subdued');
            else moods.push('Soft', 'Gentle');

            // Lightness-based mood modifiers
            if (lightness > 80) moods.push('Clean', 'Pure');
            else if (lightness > 60) moods.push('Bright', 'Lively');
            else if (lightness > 40) moods.push('Balanced', 'Moderate');
            else if (lightness > 20) moods.push('Deep', 'Sophisticated');
            else moods.push('Mysterious', 'Elegant');

            return moods.slice(0, 4);
        };

        const getAssociations = (hue: number, saturation: number, lightness: number) => {
            const associations = [];

            // Red associations
            if (hue >= 0 && hue < 15) {
                associations.push('Fire', 'Blood', 'Sunset', 'Roses');
            } else if (hue >= 15 && hue < 30) {
                associations.push('Autumn', 'Terracotta', 'Clay', 'Earth');
            }
            // Orange associations
            else if (hue >= 30 && hue < 45) {
                associations.push('Sunset', 'Citrus', 'Marmalade', 'Amber');
            }
            // Yellow-Orange associations
            else if (hue >= 45 && hue < 60) {
                associations.push('Golden Hour', 'Honey', 'Marigold', 'Sunshine');
            }
            // Yellow associations
            else if (hue >= 60 && hue < 75) {
                associations.push('Sunlight', 'Lemon', 'Butter', 'Daffodils');
            }
            // Yellow-Green associations
            else if (hue >= 75 && hue < 90) {
                associations.push('Spring', 'Fresh Grass', 'Lime', 'New Growth');
            }
            // Green associations
            else if (hue >= 90 && hue < 120) {
                associations.push('Forest', 'Meadows', 'Emerald', 'Nature');
            } else if (hue >= 120 && hue < 150) {
                associations.push('Ocean Depths', 'Jade', 'Sage', 'Olive');
            }
            // Blue-Green associations
            else if (hue >= 150 && hue < 180) {
                associations.push('Tropical Waters', 'Teal', 'Seafoam', 'Aqua');
            }
            // Blue associations
            else if (hue >= 180 && hue < 210) {
                associations.push('Sky', 'Ocean', 'Sapphire', 'Azure');
            } else if (hue >= 210 && hue < 240) {
                associations.push('Deep Sea', 'Navy', 'Cobalt', 'Royal Blue');
            }
            // Purple associations
            else if (hue >= 240 && hue < 270) {
                associations.push('Lavender', 'Violet', 'Amethyst', 'Twilight');
            } else if (hue >= 270 && hue < 300) {
                associations.push('Royal Purple', 'Grapes', 'Orchid', 'Majesty');
            }
            // Magenta associations
            else {
                associations.push('Fuchsia', 'Magenta', 'Electric Pink', 'Vibrance');
            }

            // Saturation-based associations
            if (saturation > 80) associations.push('Neon', 'Electric');
            else if (saturation < 30) associations.push('Pastel', 'Dusty');

            // Lightness-based associations
            if (lightness > 80) associations.push('Pure', 'Crisp');
            else if (lightness < 20) associations.push('Deep', 'Rich');

            return associations.slice(0, 4);
        };

        const getUseCases = (hue: number, saturation: number, lightness: number) => {
            const useCases = [];

            // Red spectrum use cases
            if (hue >= 0 && hue < 30) {
                if (saturation > 70) useCases.push('Emergency alerts', 'Call-to-action buttons', 'Warning systems');
                else useCases.push('Warm accents', 'Comforting backgrounds', 'Food industry');
            }
            // Orange spectrum use cases
            else if (hue >= 30 && hue < 60) {
                if (saturation > 70) useCases.push('Action buttons', 'Success indicators', 'Energy brands');
                else useCases.push('Friendly interfaces', 'Creative tools', 'Youth-oriented designs');
            }
            // Green spectrum use cases
            else if (hue >= 60 && hue < 150) {
                if (hue < 120) useCases.push('Success states', 'Growth indicators', 'Nature themes');
                else useCases.push('Eco-friendly branding', 'Health products', 'Financial stability');
            }
            // Blue spectrum use cases
            else if (hue >= 150 && hue < 240) {
                if (hue < 210) useCases.push('Trust indicators', 'Professional themes', 'Calming interfaces');
                else useCases.push('Technology brands', 'Corporate designs', 'Information displays');
            }
            // Purple spectrum use cases
            else if (hue >= 240 && hue < 300) {
                if (hue < 270) useCases.push('Creative platforms', 'Artistic tools', 'Innovation themes');
                else useCases.push('Luxury brands', 'Premium products', 'Spiritual content');
            }
            // Magenta spectrum use cases
            else {
                useCases.push('Bold statements', 'Attention-grabbing elements', 'Dynamic content');
            }

            // Saturation-based use cases
            if (saturation > 80) useCases.push('High-impact branding');
            else if (saturation < 30) useCases.push('Subtle backgrounds', 'Text colors');

            // Lightness-based use cases
            if (lightness > 80) useCases.push('Clean interfaces', 'Minimalist designs');
            else if (lightness < 30) useCases.push('Sophisticated themes', 'Elegant layouts');

            return useCases.slice(0, 3);
        };

        return {
            mood: getMood(h, s, l),
            associations: getAssociations(h, s, l),
            useCases: getUseCases(h, s, l),
            selectedColor: {
                hex: selectedColor,
                hsl: { h, s, l }
            }
        };
    }, [selectedColor]);

    return (
        <div className="space-y-6">
            {/* Color Selection */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Select Color to Analyze</label>
                <ColorSelectMenu
                    value={selectedColor}
                    onValueChange={setSelectedColor}
                    colors={colors}
                    placeholder="Choose a color from your palette"
                />
            </div>

            {/* Selected Color Display */}
            <div className="text-center">
                <div
                    className="w-16 h-16 rounded-full mx-auto mb-3 shadow-lg border-2 border-border"
                    style={{ backgroundColor: analysis.selectedColor.hex }}
                />
                <div className="font-mono font-medium text-sm">
                    {analysis.selectedColor.hex.toUpperCase()}
                </div>
                <div className="text-xs text-muted-foreground">
                    HSL({Math.round(analysis.selectedColor.hsl.h)}°, {Math.round(analysis.selectedColor.hsl.s)}%, {Math.round(analysis.selectedColor.hsl.l)}%)
                </div>
            </div>

            {/* Mood Analysis */}
            <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Mood
                </h4>
                <div className="flex flex-wrap gap-1">
                    {analysis.mood.map((mood, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                        >
                            {mood}
                        </span>
                    ))}
                </div>
            </div>

            {/* Associations */}
            <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Associations
                </h4>
                <div className="flex flex-wrap gap-1">
                    {analysis.associations.map((association, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 bg-secondary/10 text-secondary-foreground rounded-full text-xs font-medium"
                        >
                            {association}
                        </span>
                    ))}
                </div>
            </div>

            {/* Use Cases */}
            <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Suggested Use Cases
                </h4>
                <div className="space-y-2">
                    {analysis.useCases.map((useCase, index) => (
                        <div
                            key={index}
                            className="p-2 bg-muted/50 rounded-lg border text-center"
                        >
                            <span className="font-medium text-sm capitalize">{useCase}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Source Link */}
            <div className="text-center pt-2">
                <a
                    href="https://www.colorpsychology.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    <span>Source: Color Psychology</span>
                    <ExternalLink className="h-3 w-3" />
                </a>
            </div>
        </div>
    );
}
