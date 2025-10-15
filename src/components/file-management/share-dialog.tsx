
import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Copy, Check, Link2, Clock } from "lucide-react"

export function ShareDialog({ children, fileName }: { children: React.ReactNode; fileName: string }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [expiresEnabled, setExpiresEnabled] = useState(false)
  const [passwordEnabled, setPasswordEnabled] = useState(false)

  const shareLink = "https://ghostdrive.app/s/abc123xyz"

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{fileName}"</DialogTitle>
          <DialogDescription>Create a secure encrypted link to share this file</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Share Link</Label>
            <div className="flex gap-2">
              <Input value={shareLink} readOnly className="flex-1" />
              <Button size="icon" variant="outline" onClick={copyToClipboard}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Password Protection</Label>
                <p className="text-xs text-muted-foreground">Require password to access</p>
              </div>
              <Switch checked={passwordEnabled} onCheckedChange={setPasswordEnabled} />
            </div>

            {passwordEnabled && <Input type="password" placeholder="Enter password" />}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Expiration Date</Label>
                <p className="text-xs text-muted-foreground">Link expires after date</p>
              </div>
              <Switch checked={expiresEnabled} onCheckedChange={setExpiresEnabled} />
            </div>

            {expiresEnabled && (
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type="date" className="pl-10" />
              </div>
            )}
          </div>

          <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
            <div className="flex items-start gap-2">
              <Link2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Files shared via link are still encrypted. Recipients will need to decrypt using the shared key.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Create Link</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
