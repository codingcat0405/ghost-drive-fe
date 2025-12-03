"use client"

import { MoreVertical, Lock, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Secret {
  id: number
  title: string
  username?: string
  password: string
  createdAt: string
  category: string
}

const categoryIcons: Record<string, string> = {
  password: "🔐",
  "api-key": "🔑",
  token: "🎫",
  other: "📝",
}

interface VaultGridProps {
  secrets: Secret[]
  onView: (secret: Secret) => void
  onDelete: (secret: Secret) => void
}

export default function VaultGrid({ secrets, onView, onDelete }: VaultGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {secrets.map((secret) => (
        <div
          key={secret.id}
          className="group relative bg-card border border-border rounded-lg p-4 hover:border-cyan-600/50 hover:bg-card/80 transition-all duration-300"
        >
          {/* Header with Icon and Menu */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{categoryIcons[secret.category]}</div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">{secret.title}</h3>
                <p className="text-xs text-muted-foreground">{secret.category.replace("-", " ")}</p>
              </div>
            </div>

            {/* Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onView(secret)} className="cursor-pointer">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(secret)}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Username */}
          <div className="mb-4 p-3 bg-background/50 rounded border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Username</p>
            <p className="text-sm text-foreground font-mono break-all">{secret?.username ?? "_"}</p>
          </div>

          {/* Encrypted Status & Date */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Lock className="h-3 w-3 text-cyan-500" />
              <span>Encrypted</span>
            </div>
            <span>{secret.createdAt}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
