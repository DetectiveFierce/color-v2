"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Pencil, Copy, X, GripVertical } from 'lucide-react'
import { cn } from "@/lib/utils"
import { type Palette } from "@/lib/core/types"
import { ReactSortable } from "react-sortablejs"
import type { SortableEvent } from "sortablejs"

type Props = {
  palettes: Palette[]
  selectedId?: string
  onSelect?: (id: string) => void
  onDelete?: (id: string) => void
  onDuplicate?: (id: string) => Palette | undefined
  onRename?: (id: string, name: string) => void
  onAddRandom?: () => Palette | undefined
  onReorder?: (fromIndex: number, toIndex: number) => void
}

export default function PaletteList({
  palettes = [],
  selectedId = "",
  onSelect = () => { },
  onDelete = () => { },
  onDuplicate = () => undefined,
  onRename = () => { },
  onAddRandom = () => undefined,
  onReorder = () => { },
}: Props) {
  const [editingId, setEditingId] = useState<string>("")
  const [draftName, setDraftName] = useState<string>("")
  const [deletingPalettes, setDeletingPalettes] = useState<Set<string>>(new Set())
  const [addingPalettes, setAddingPalettes] = useState<Set<string>>(new Set())

  // Use refs to store input elements for direct access
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  // Auto-scroll functionality for drag and drop
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isDraggingRef = useRef(false)

  // Handle delete with animation
  const handleDelete = useCallback((paletteId: string) => {
    // Start the delete animation
    setDeletingPalettes(prev => new Set(prev).add(paletteId))

    // Wait for animation to complete before actually deleting
    setTimeout(() => {
      onDelete(paletteId)
      setDeletingPalettes(prev => {
        const newSet = new Set(prev)
        newSet.delete(paletteId)
        return newSet
      })
    }, 300) // Match the CSS animation duration
  }, [onDelete])

  // Handle add new with animation
  const handleAddRandom = useCallback(() => {
    // Call the original onAddRandom to create the new palette
    const newPalette = onAddRandom()

    // Make the new palette transparent initially
    if (newPalette) {
      setAddingPalettes(prev => new Set(prev).add(newPalette.id))
    }

    // Wait for the next render cycle to ensure positioning is complete
    requestAnimationFrame(() => {
      if (newPalette) {
        // Start the add animation after positioning is complete
        // The palette is already transparent, now it will animate in

        // Remove the animation class after animation completes, then select
        setTimeout(() => {
          setAddingPalettes(prev => {
            const newSet = new Set(prev)
            newSet.delete(newPalette.id)
            return newSet
          })
        }, 500) // Slightly longer to account for the initial transparent state
      }
    })
  }, [onAddRandom])

  // Handle duplicate with animation
  const handleDuplicate = useCallback((paletteId: string) => {
    // Call the original onDuplicate to create the duplicate
    const newPalette = onDuplicate(paletteId)

    // Make the new palette transparent initially
    if (newPalette) {
      setAddingPalettes(prev => new Set(prev).add(newPalette.id))
    }

    // Wait for the next render cycle to ensure positioning is complete
    requestAnimationFrame(() => {
      if (newPalette) {
        // Start the add animation after positioning is complete
        // The palette is already transparent, now it will animate in

        // Remove the animation class after animation completes, then select
        setTimeout(() => {
          setAddingPalettes(prev => {
            const newSet = new Set(prev)
            newSet.delete(newPalette.id)
            return newSet
          })
        }, 500) // Slightly longer to account for the initial transparent state
      }
    })

    return newPalette
  }, [onDuplicate])



  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent, paletteId: string) => {
    e.preventDefault()
    const newName = draftName.trim() || palettes.find(p => p.id === paletteId)?.name || ""
    onRename(paletteId, newName)
    setEditingId("")
  }, [draftName, onRename, palettes])

  // Handle blur with validation
  const handleBlur = useCallback((paletteId: string) => {
    const palette = palettes.find(p => p.id === paletteId)
    if (palette) {
      const newName = draftName.trim() || palette.name
      onRename(paletteId, newName)
    }
    setEditingId("")
  }, [draftName, onRename, palettes])

  // Handle escape key to cancel editing
  const handleKeyDown = useCallback((e: React.KeyboardEvent, paletteId: string) => {
    if (e.key === 'Escape') {
      const palette = palettes.find(p => p.id === paletteId)
      if (palette) {
        setDraftName(palette.name)
      }
      setEditingId("")
    }
  }, [palettes])

  // Auto-scroll functionality
  const startAutoScroll = useCallback((direction: 'left' | 'right') => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current)
    }

    const scrollSpeed = 20
    autoScrollIntervalRef.current = setInterval(() => {
      if (scrollContainerRef.current) {
        const currentScroll = scrollContainerRef.current.scrollLeft
        const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth

        let newScroll
        if (direction === 'left') {
          newScroll = Math.max(0, currentScroll - scrollSpeed)
        } else {
          newScroll = Math.min(maxScroll, currentScroll + scrollSpeed)
        }

        scrollContainerRef.current.scrollLeft = newScroll
      }
    }, 16) // ~60fps
  }, [])

  const stopAutoScroll = useCallback(() => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current)
      autoScrollIntervalRef.current = null
    }
  }, [])

  // Handle mouse move for auto-scroll detection
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!scrollContainerRef.current || !isDraggingRef.current) return

    const container = scrollContainerRef.current
    const containerRect = container.getBoundingClientRect()
    const mouseX = event.clientX
    const extendedThreshold = 300 // extended region for easier triggering

    // Check if mouse is in the extended auto-scroll regions
    if (mouseX < containerRect.left + extendedThreshold) {
      startAutoScroll('left')
    } else if (mouseX > containerRect.right - extendedThreshold) {
      startAutoScroll('right')
    } else {
      stopAutoScroll()
    }
  }, [startAutoScroll, stopAutoScroll])

  // Handle sort end
  const handleSortEnd = useCallback((evt: SortableEvent) => {
    const oldIndex = evt.oldIndex
    const newIndex = evt.newIndex

    if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
      onReorder(oldIndex, newIndex)
    }

    // Stop auto-scroll and remove mouse move listener
    isDraggingRef.current = false
    stopAutoScroll()
    document.removeEventListener('mousemove', handleMouseMove)
  }, [onReorder, stopAutoScroll, handleMouseMove])

  // Handle sort start
  const handleSortStart = useCallback(() => {
    isDraggingRef.current = true
    document.addEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoScroll()
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [stopAutoScroll, handleMouseMove])

  // Convert palettes to sortable format
  const sortableItems = palettes.map((palette, index) => ({
    id: palette.id,
    palette,
    index
  }))

  return (
    <div ref={scrollContainerRef} className="overflow-x-auto pb-2">
      <div className="flex gap-3 min-w-max">
        <ReactSortable
          list={sortableItems}
          setList={() => { }} // We handle updates through onReorder
          onEnd={handleSortEnd}
          onStart={handleSortStart}
          className="flex gap-3"
          direction="horizontal"
          scroll={false}
          animation={200}
          ghostClass="sortable-ghost"
          chosenClass="sortable-chosen"
          dragClass="sortable-drag"
        >
          {sortableItems.map((item) => {
            const p = item.palette
            const isSelected = p.id === selectedId
            const isEditing = editingId === p.id
            const isDeleting = deletingPalettes.has(p.id)
            const isAdding = addingPalettes.has(p.id)
            return (
              <div key={p.id} className="palette-item">
                <div
                  className={cn(
                    "group relative w-64 flex-shrink-0",
                    isSelected
                      ? "rounded-xl p-[2px]"
                      : "rounded-xl border border-transparent hover:bg-muted/70 bg-background/80 hover:border-muted-foreground/20 shadow-soft hover:shadow-elevated",
                    // Only apply add/delete animations when not dragging
                    !isDraggingRef.current && isDeleting && "animate-delete-condense",
                    !isDraggingRef.current && isAdding && "animate-add-expand"
                  )}
                  style={{
                    // Don't override opacity during sortable operations
                    opacity: isAdding && !isDraggingRef.current ? 0 : undefined
                  }}
                  role="button"
                  aria-pressed={isSelected}
                  onClick={(e) => {
                    // Prevent click during drag operations
                    if (isDraggingRef.current) {
                      e.preventDefault()
                      return
                    }
                    if (!isDeleting && !isAdding) {
                      onSelect(p.id)
                    }
                  }}
                >
                  {isSelected && !isAdding && (
                    <div
                      className="absolute inset-0 rounded-xl pointer-events-none opacity-0"
                      style={{
                        background: `linear-gradient(135deg, var(--background) 0%, var(--background) 60%, rgba(172, 253, 33, 0.3) 80%, rgba(172, 253, 33, 0.6) 90%, var(--globals-token-500) 95%, var(--globals-token-500) 100%)`,
                        animation: 'borderAppear 1.2s ease-out 0.2s forwards'
                      }}
                    />
                  )}
                  <div className={cn(
                    "flex flex-col gap-3 px-4 py-3 w-full rounded-xl relative z-10",
                    isSelected
                      ? "bg-background/95 shadow-elevated"
                      : ""
                  )}>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {p.baseColors.slice(0, 3).map((color) => (
                          <div
                            key={color.id}
                            className={cn(
                              "h-6 w-6 rounded-md border-2",
                              isSelected ? "border-primary/30" : "border-background/50 group-hover:border-primary/20"
                            )}
                            style={{ background: color.baseHex }}
                            aria-hidden="true"
                            title={color.name}
                          />
                        ))}
                        {p.baseColors.length > 3 && (
                          <div className="h-6 w-6 rounded-md border-2 bg-muted flex items-center justify-center border-background/50 group-hover:border-primary/20">
                            <span className="text-[9px] font-semibold text-muted-foreground">+{p.baseColors.length - 3}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" aria-label="More" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingId(p.id)
                                  setDraftName(p.name)
                                }}
                              >
                                <Pencil className="h-3 w-3 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(p.id)}>
                                <Copy className="h-3 w-3 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAddRandom()}>
                                <Plus className="h-3 w-3 mr-2" />
                                Add Random Color
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(p.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <X className="h-3 w-3 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div
                          className="flex-shrink-0 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing ml-auto"
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </div>
                      </div>
                    </div>
                    <div className="min-w-0 overflow-hidden">
                      {isEditing ? (
                        <form
                          onSubmit={(e) => handleSubmit(e, p.id)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Input
                            ref={(el) => {
                              inputRefs.current[p.id] = el
                            }}
                            size={1}
                            value={draftName}
                            autoFocus
                            onChange={(e) => setDraftName(e.target.value)}
                            onBlur={() => handleBlur(p.id)}
                            onKeyDown={(e) => handleKeyDown(e, p.id)}
                            className="h-7 text-sm"
                          />
                        </form>
                      ) : (
                        <div className="min-w-0">
                          <div className="text-sm font-semibold min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                            {p.name}
                          </div>
                          {p.description && (
                            <div className="text-xs text-muted-foreground truncate mt-1">
                              {p.description}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </ReactSortable>
        {palettes.length === 0 && (
          <div className="text-center py-8 w-64">
            <div className="text-sm text-muted-foreground">No palettes found.</div>
          </div>
        )}
        <div className="group/add-button w-64 h-24 hover:h-28 transition-all duration-300 overflow-hidden flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="w-full h-full opacity-0 group-hover/add-button:opacity-100 transition-all duration-300 text-muted-foreground hover:text-foreground border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40"
            onClick={handleAddRandom}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
