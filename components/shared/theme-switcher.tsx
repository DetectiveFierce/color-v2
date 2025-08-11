"use client";

import React from "react";
import { useTheme } from "@/lib/theme";
import "@theme-toggles/react/css/Within.css";

interface ThemeSwitcherProps {
    isDark: boolean;
    onToggle: () => void;
    size?: "sm" | "md" | "lg";
    className?: string;
    showLabel?: boolean;
    label?: string;
}

export function ThemeSwitcher({
    isDark,
    onToggle,
    size = "md",
    className = "",
    showLabel = false,
    label = "Toggle theme"
}: ThemeSwitcherProps) {
    const sizeClasses = {
        sm: "h-7 w-12",
        md: "h-9 w-16",
        lg: "h-11 w-20"
    };

    const iconSizeClasses = {
        sm: "h-5 w-5",
        md: "h-7 w-7",
        lg: "h-9 w-9"
    };

    const iconInnerSizeClasses = {
        sm: "h-3 w-3",
        md: "h-4 w-4",
        lg: "h-5 w-5"
    };

    const handleToggle = () => {
        onToggle();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
        }
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <button
                onClick={handleToggle}
                onKeyDown={handleKeyDown}
                className={`relative inline-flex items-center rounded-full transition-all duration-300 shadow-subtle hover:shadow-soft cursor-pointer focus:outline-none select-none theme-toggle ${isDark ? 'theme-toggle--toggled' : 'theme-toggle--untoggled'} ${sizeClasses[size]} ${isDark
                    ? "border-0"
                    : "border-0"
                    }`}
                style={isDark ? { backgroundColor: 'rgba(74, 55, 108, 0.6)' } : { backgroundColor: 'var(--globals-primary-400)' }}
                role="switch"
                aria-checked={isDark}
                aria-label={label}
                title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                tabIndex={0}
            >
                <span
                    className={`inline-flex items-center justify-center rounded-full shadow-md transition-all duration-1000 ${iconSizeClasses[size]} ${isDark
                        ? "translate-x-8 bg-[var(--globals-bg-800)]"
                        : "translate-x-1 bg-white"
                        }`}
                >
                    <span className={`transition-all duration-1000 ${iconInnerSizeClasses[size]} ${isDark ? 'text-blue-400' : 'text-yellow-500'}`}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="1em"
                            height="1em"
                            fill="currentColor"
                            aria-hidden="true"
                            className="theme-toggle__within"
                            viewBox="0 0 32 32"
                            style={{ "--theme-toggle__within--duration": "750ms" } as React.CSSProperties}
                        >
                            <clipPath id="a">
                                <path d="M0 0h32v32H0Zm6 16a1 1 0 0 0 20 0 1 1 0 0 0-20 0" />
                            </clipPath>
                            <g clipPath="url(#a)">
                                <path d="M30.7 21.3 27.1 16l3.7-5.3c.4-.5.1-1.3-.6-1.4l-6.3-1.1-1.1-6.3c-.1-.6-.8-.9-1.4-.6L16 5l-5.4-3.7c-.5-.4-1.3-.1-1.4.6l-1 6.3-6.4 1.1c-.6.1-.9.9-.6 1.3L4.9 16l-3.7 5.3c-.4.5-.1 1.3.6 1.4l6.3 1.1 1.1 6.3c.1.6.8.9 1.4.6l5.3-3.7 5.3 3.7c.5.4 1.3.1 1.4-.6l1.1-6.3 6.3-1.1c.8-.1 1.1-.8.7-1.4zM16 25.1c-5.1 0-9.1-4.1-9.1-9.1 0-5.1 4.1-9.1 9.1-9.1s9.1 4.1 9.1 9.1c0 5.1-4 9.1-9.1 9.1z" />
                            </g>
                            <path
                                d="M16 7.7c-4.6 0-8.2 3.7-8.2 8.2s3.6 8.4 8.2 8.4 8.2-3.7 8.2-8.2-3.6-8.4-8.2-8.4zm0 14.4c-3.4 0-6.1-2.9-6.1-6.2s2.7-6.1 6.1-6.1c3.4 0 6.1 2.9 6.1 6.2s-2.7 6.1-6.1 6.1z"
                                className="theme-toggle__within__circle"
                            />
                            <path
                                d="M16 9.5c-3.6 0-6.4 2.9-6.4 6.4s2.8 6.5 6.4 6.5 6.4-2.9 6.4-6.4-2.8-6.5-6.4-6.5z"
                                className="theme-toggle__within__inner"
                            />
                        </svg>
                    </span>
                </span>
            </button>
            {showLabel && (
                <span className="ml-2 text-sm text-muted-foreground">
                    {label}
                </span>
            )}
        </div>
    );
}

// Wrapper component for this project's theme system
export default function ThemeSwitcherWrapper() {
    const { isDark, setTheme } = useTheme();

    return (
        <ThemeSwitcher
            isDark={isDark}
            onToggle={() => setTheme(isDark ? "light" : "dark")}
            size="md"
        />
    );
}

// Usage example for other projects:
// import { ThemeSwitcher } from './components/ThemeSwitcher';
// 
// function App() {
//   const [isDark, setIsDark] = useState(false);
//   
//   return (
//     <ThemeSwitcher
//       isDark={isDark}
//       onToggle={() => setIsDark(!isDark)}
//       size="md"
//       showLabel={true}
//       label="Theme"
//     />
//   );
// } 