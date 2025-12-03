"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Copy, Check } from "lucide-react";

interface Secret {
  id: number;
  title: string;
  username?: string;
  password: string;
  createdAt: string;
  category: string;
}

interface ViewSecretDialogProps {
  isOpen: boolean;
  onClose: () => void;
  secret: Secret | null;
}

export default function ViewSecretDialog({
  isOpen,
  onClose,
  secret,
}: ViewSecretDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  if (!secret) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">{secret.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Category Badge */}
          <div className="inline-block px-2 py-1 bg-cyan-600/20 text-cyan-400 rounded text-xs font-medium">
            {secret.category}
          </div>

          {/* Username Field */}
          {secret.username && (
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Username/Email
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 bg-background border border-border rounded text-foreground font-mono text-sm">
                  {secret.username}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(secret.username ?? "", "username")}
                >
                  {copiedField === "username" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Password Field */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Password
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-background border border-border rounded text-foreground font-mono text-sm">
                {showPassword ? secret.password : "••••••••••••"}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(secret.password, "password")}
              >
                {copiedField === "password" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Meta Info */}
          <div className="text-xs text-muted-foreground pt-4 border-t border-border">
            <p>Created: {secret.createdAt}</p>
            <p>Encrypted: Yes</p>
          </div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full bg-transparent"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
