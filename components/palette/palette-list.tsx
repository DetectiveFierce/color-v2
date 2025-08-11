"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Pencil, Copy, X } from 'lucide-react'
import { cn } from "@/lib/utils"
import { type Palette } from "@/lib/core/types"

type Props = {
  palettes: Palette[]
  selectedId?: string
  onSelect?: (id: string) => void
  onDelete?: (id: string) => void
  onDuplicate?: (id: string) => void
  onRename?: (id: string, name: string) => void
  onAddRandom?: () => void
}

export default function PaletteList({
  palettes = [],
  selectedId = "",
  onSelect = () => { },
  onDelete = () => { },
  onDuplicate = () => { },
  onRename = () => { },
  onAddRandom = () => { },
}: Props) {
  const [editingId, setEditingId] = useState<string>("")
  const [draftName, setDraftName] = useState<string>("")

  return (
    <div className="flex gap-3 w-full">
      {palettes.map((p) => {
        const isSelected = p.id === selectedId
        const isEditing = editingId === p.id
        return (
          <div
            key={p.id}
            className={cn(
              "group relative transition-all duration-500 ease-out w-64 flex-shrink-0",
              isSelected
                ? "rounded-xl p-[2px]"
                : "rounded-xl border border-transparent hover:bg-muted/70 bg-background/80 hover:border-muted-foreground/20 shadow-soft hover:shadow-elevated"
            )}
            role="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(p.id)}
          >
            {isSelected && (
              <div
                className="absolute inset-0 rounded-xl pointer-events-none opacity-0"
                style={{
                  background: `linear-gradient(135deg, var(--background) 0%, var(--background) 60%, rgba(172, 253, 33, 0.3) 80%, rgba(172, 253, 33, 0.6) 90%, var(--globals-token-500) 95%, var(--globals-token-500) 100%)`,
                  animation: 'borderAppear 1.2s ease-out 0.2s forwards'
                }}
              />
            )}
            <div className={cn(
              "flex flex-col gap-3 px-4 py-3 transition-all duration-200 w-full rounded-xl relative z-10",
              isSelected
                ? "bg-background/95 shadow-elevated"
                : ""
            )}>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {p.baseColors.slice(0, 3).map((color, index) => (
                    <div
                      key={color.id}
                      className={cn(
                        "h-6 w-6 rounded-md border-2 transition-all duration-200",
                        isSelected ? "border-primary/30" : "border-background/50 group-hover:border-primary/20"
                      )}
                      style={{ background: color.hex }}
                      aria-hidden="true"
                      title={color.name}
                    />
                  ))}
                  {p.baseColors.length > 3 && (
                    <div className="h-6 w-6 rounded-md border-2 bg-muted flex items-center justify-center transition-all duration-200 border-background/50 group-hover:border-primary/20">
                      <span className="text-[9px] font-semibold text-muted-foreground">+{p.baseColors.length - 3}</span>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
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
                      <DropdownMenuItem onClick={() => onDuplicate(p.id)}>
                        <Copy className="h-3 w-3 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAddRandom()}>
                        <Plus className="h-3 w-3 mr-2" />
                        Add Random Color
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(p.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <X className="h-3 w-3 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="min-w-0 overflow-hidden">
                {isEditing ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      onRename(p.id, draftName.trim() || p.name)
                      setEditingId("")
                    }}
                  >
                    <Input
                      size={1 as any}
                      value={draftName}
                      autoFocus
                      onChange={(e) => setDraftName(e.target.value)}
                      onBlur={() => {
                        onRename(p.id, draftName.trim() || p.name)
                        setEditingId("")
                      }}
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
        )
      })}
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
          onClick={onAddRandom}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
