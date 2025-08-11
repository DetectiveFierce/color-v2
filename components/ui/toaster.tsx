"use client"

import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
    const { toasts } = useToast()

    return (
        <ToastProvider>
            {toasts.map(function ({ id, title, description, action, onClick, duration, ...props }) {
                return (
                    <Toast
                        key={id}
                        {...props}
                        duration={duration}
                        onClick={(e) => {
                            // Don't trigger onClick if clicking the close button or its children
                            const target = e.target as HTMLElement
                            if (target.closest('[data-radix-toast-close]') || target.closest('[toast-close]')) {
                                return
                            }
                            onClick?.()
                        }}
                    >
                        <div className="grid gap-1">
                            {title && <ToastTitle>{title}</ToastTitle>}
                            {description && (
                                <ToastDescription>{description}</ToastDescription>
                            )}
                        </div>
                        {action}
                        <ToastClose />
                    </Toast>
                )
            })}
            <ToastViewport />
        </ToastProvider>
    )
} 