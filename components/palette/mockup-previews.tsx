"use client"

import React, { useState } from 'react';
import { Monitor, Smartphone, CreditCard, Palette } from 'lucide-react';
import { type Palette as PaletteType } from "@/lib/core/types";
import { ColorSelectMenu } from '@/components/ui/color-select-menu';

interface MockupPreviewsProps {
    palette: PaletteType;
}

export function MockupPreviews({ palette }: MockupPreviewsProps) {
    const [activeTab, setActiveTab] = useState<'website' | 'mobile' | 'card' | 'logo'>('website');

    const colors = palette.baseColors;

    // Default color assignments with fallbacks
    const [colorAssignments, setColorAssignments] = useState({
        primary: colors[0]?.baseHex || '#3B82F6',
        secondary: colors[1]?.baseHex || '#EF4444',
        accent: colors[2]?.baseHex || '#10B981',
        neutral: colors[3]?.baseHex || '#6B7280',
        background: colors[4]?.baseHex || '#F9FAFB',
    });

    // Update assignments when palette changes
    React.useEffect(() => {
        if (colors.length > 0) {
            setColorAssignments({
                primary: colors[0]?.baseHex || '#3B82F6',
                secondary: colors[1]?.baseHex || '#EF4444',
                accent: colors[2]?.baseHex || '#10B981',
                neutral: colors[3]?.baseHex || '#6B7280',
                background: colors[4]?.baseHex || '#F9FAFB',
            });
        }
    }, [colors]);

    const { primary, secondary, accent, neutral, background } = colorAssignments;

    const handleColorAssignmentChange = (assignment: keyof typeof colorAssignments, value: string) => {
        setColorAssignments(prev => ({
            ...prev,
            [assignment]: value
        }));
    };

    const tabs = [
        { id: 'website', label: 'Website', icon: Monitor },
        { id: 'mobile', label: 'Mobile App', icon: Smartphone },
        { id: 'card', label: 'Business Card', icon: CreditCard },
        { id: 'logo', label: 'Logo', icon: Palette },
    ];

    const WebsiteMockup = () => (
        <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-4xl mx-auto">
            {/* Header */}
            <div style={{ backgroundColor: primary }} className="p-4">
                <div className="flex items-center justify-between text-white">
                    <div className="font-bold text-xl">Your Brand</div>
                    <nav className="hidden md:flex space-x-6">
                        <a href="#" className="hover:opacity-80 transition-opacity">Home</a>
                        <a href="#" className="hover:opacity-80 transition-opacity">About</a>
                        <a href="#" className="hover:opacity-80 transition-opacity">Services</a>
                        <a href="#" className="hover:opacity-80 transition-opacity">Contact</a>
                    </nav>
                    <button
                        style={{ backgroundColor: secondary }}
                        className="px-4 py-2 rounded font-medium hover:opacity-90 transition-opacity"
                    >
                        Get Started
                    </button>
                </div>
            </div>

            {/* Hero Section */}
            <div style={{ backgroundColor: background }} className="p-8 text-center">
                <h1 className="text-4xl font-bold mb-4" style={{ color: primary }}>
                    Welcome to Our Platform
                </h1>
                <p className="text-xl mb-6" style={{ color: neutral }}>
                    Discover amazing features with our beautiful color palette
                </p>
                <button
                    style={{ backgroundColor: accent }}
                    className="px-8 py-3 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity"
                >
                    Learn More
                </button>
            </div>

            {/* Content Section */}
            <div className="p-8 grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((item) => (
                    <div key={item} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                        <div
                            className="w-12 h-12 rounded-lg mb-4"
                            style={{ backgroundColor: item === 2 ? secondary : accent }}
                        />
                        <h3 className="text-xl font-semibold mb-2" style={{ color: primary }}>
                            Feature {item}
                        </h3>
                        <p style={{ color: neutral }}>
                            This is a sample description showcasing how your colors work together.
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );

    const MobileMockup = () => (
        <div className="max-w-sm mx-auto bg-gray-900 rounded-3xl p-2 shadow-2xl">
            <div className="bg-white rounded-2xl overflow-hidden">
                {/* Status Bar */}
                <div style={{ backgroundColor: primary }} className="h-8 flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full opacity-80" />
                </div>

                {/* Header */}
                <div style={{ backgroundColor: primary }} className="p-4 text-white">
                    <h2 className="text-lg font-bold">Mobile App</h2>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4" style={{ backgroundColor: background }}>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex items-center space-x-3">
                            <div
                                className="w-10 h-10 rounded-full"
                                style={{ backgroundColor: accent }}
                            />
                            <div className="flex-1">
                                <h3 className="font-medium" style={{ color: primary }}>Notification</h3>
                                <p className="text-sm" style={{ color: neutral }}>Your colors are looking great!</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {[1, 2].map((item) => (
                            <button
                                key={item}
                                style={{ backgroundColor: item === 1 ? secondary : accent }}
                                className="p-3 rounded-lg text-white font-medium"
                            >
                                Action {item}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white p-4 rounded-lg">
                        <div className="space-y-2">
                            <div className="h-2 rounded" style={{ backgroundColor: primary, width: '100%' }} />
                            <div className="h-2 rounded" style={{ backgroundColor: accent, width: '80%' }} />
                            <div className="h-2 rounded" style={{ backgroundColor: secondary, width: '60%' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const BusinessCardMockup = () => (
        <div className="max-w-md mx-auto">
            {/* Front */}
            <div
                className="w-80 h-48 rounded-lg shadow-xl mb-4 p-6 text-white relative overflow-hidden"
                style={{ backgroundColor: primary }}
            >
                <div
                    className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 -mr-16 -mt-16"
                    style={{ backgroundColor: accent }}
                />
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-1">John Doe</h2>
                    <p className="opacity-90 mb-4">Creative Director</p>
                    <div className="space-y-1 text-sm">
                        <p>john.doe@company.com</p>
                        <p>+1 (555) 123-4567</p>
                        <p>www.company.com</p>
                    </div>
                </div>
            </div>

            {/* Back */}
            <div
                className="w-80 h-48 rounded-lg shadow-xl p-6 border"
                style={{ backgroundColor: background, borderColor: neutral }}
            >
                <div className="h-full flex flex-col justify-center items-center text-center">
                    <div
                        className="w-16 h-16 rounded-lg mb-4 flex items-center justify-center text-white text-2xl font-bold"
                        style={{ backgroundColor: secondary }}
                    >
                        JD
                    </div>
                    <h3 className="text-lg font-semibold" style={{ color: primary }}>
                        Your Company Name
                    </h3>
                    <p style={{ color: neutral }}>
                        Building the future with great design
                    </p>
                </div>
            </div>
        </div>
    );

    const LogoMockup = () => (
        <div className="max-w-lg mx-auto space-y-8">
            {/* Primary Logo */}
            <div className="text-center p-8 bg-white rounded-lg shadow-lg">
                <div className="flex items-center justify-center space-x-3 mb-4">
                    <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold"
                        style={{ backgroundColor: primary }}
                    >
                        B
                    </div>
                    <span
                        className="text-3xl font-bold"
                        style={{ color: primary }}
                    >
                        Brand
                    </span>
                </div>
                <p style={{ color: neutral }}>Primary Logo Version</p>
            </div>

            {/* Logo Variations */}
            <div className="grid grid-cols-2 gap-4">
                <div
                    className="p-6 rounded-lg text-center"
                    style={{ backgroundColor: primary }}
                >
                    <div className="flex items-center justify-center space-x-2 text-white">
                        <div
                            className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold"
                            style={{ backgroundColor: accent }}
                        >
                            B
                        </div>
                        <span className="text-xl font-bold">Brand</span>
                    </div>
                    <p className="text-white opacity-80 text-sm mt-2">Dark Background</p>
                </div>

                <div
                    className="p-6 rounded-lg text-center border"
                    style={{ backgroundColor: background, borderColor: neutral }}
                >
                    <div className="flex items-center justify-center space-x-2">
                        <div
                            className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold text-white"
                            style={{ backgroundColor: secondary }}
                        >
                            B
                        </div>
                        <span
                            className="text-xl font-bold"
                            style={{ color: primary }}
                        >
                            Brand
                        </span>
                    </div>
                    <p style={{ color: neutral }} className="text-sm mt-2">Light Background</p>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'website':
                return <WebsiteMockup />;
            case 'mobile':
                return <MobileMockup />;
            case 'card':
                return <BusinessCardMockup />;
            case 'logo':
                return <LogoMockup />;
            default:
                return <WebsiteMockup />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="border-b border-border">
                <nav className="flex space-x-8">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id as 'website' | 'mobile' | 'card' | 'logo')}
                            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                                }`}
                        >
                            <Icon size={18} />
                            <span>{label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="min-h-96">
                {renderContent()}
            </div>

            {/* Color Reference */}
            <div className="mt-8 p-4 bg-muted/50 rounded-lg border">
                <h4 className="text-sm font-semibold text-foreground mb-3">Color Assignments</h4>
                <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Primary</label>
                            <ColorSelectMenu
                                value={primary}
                                onValueChange={(value) => handleColorAssignmentChange('primary', value)}
                                colors={colors}
                                placeholder="Select primary color"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Secondary</label>
                            <ColorSelectMenu
                                value={secondary}
                                onValueChange={(value) => handleColorAssignmentChange('secondary', value)}
                                colors={colors}
                                placeholder="Select secondary color"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Accent</label>
                            <ColorSelectMenu
                                value={accent}
                                onValueChange={(value) => handleColorAssignmentChange('accent', value)}
                                colors={colors}
                                placeholder="Select accent color"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Neutral</label>
                            <ColorSelectMenu
                                value={neutral}
                                onValueChange={(value) => handleColorAssignmentChange('neutral', value)}
                                colors={colors}
                                placeholder="Select neutral color"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Background</label>
                            <ColorSelectMenu
                                value={background}
                                onValueChange={(value) => handleColorAssignmentChange('background', value)}
                                colors={colors}
                                placeholder="Select background color"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
