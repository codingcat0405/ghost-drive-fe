"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface Secret {
  id: number;
  title: string;
  username?: string;
  createdAt: string;
  password: string;
  category: string;
}

interface DeleteSecretDialogProps {
  isOpen: boolean
  onClose: () => void
  secret: Secret | null
  onConfirm: () => void
}

export default function DeleteSecretDialog({ isOpen, onClose, secret, onConfirm }: DeleteSecretDialogProps) {
  if (!secret) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle className="text-foreground">Delete Secret</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Are you sure you want to permanently delete "{secret.title}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="flex-1 bg-destructive hover:bg-destructive/90 text-white">
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
