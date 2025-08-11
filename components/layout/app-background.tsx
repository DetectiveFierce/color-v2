"use client"

export default function AppBackground() {
    return (
        <>
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.015)_1px,transparent_0)] bg-[length:32px_32px] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/2 to-transparent pointer-events-none" />
        </>
    )
}
