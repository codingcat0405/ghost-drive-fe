"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface CreateSecretDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    title: string;
    username?: string;
    password: string;
    category: number;
  }) => Promise<void>;
  isLoading: boolean;
}

export default function CreateSecretDialog({
  isOpen,
  onClose,
  onCreate,
  isLoading,
}: CreateSecretDialogProps) {
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState("1");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title  && password) {
      await onCreate({
        title,
        username,
        password,
        category: parseInt(category),
      });
      setTitle("");
      setUsername("");
      setPassword("");
      setCategory("1");
      setShowPassword(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Secret</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a new encrypted credential entry in your vault
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-foreground">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="1">Password</SelectItem>
                <SelectItem value="2">API Key</SelectItem>
                <SelectItem value="3">Token</SelectItem>
                <SelectItem value="-1">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">
              Title*
            </Label>
            <Input
              id="title"
              placeholder="e.g., Facebook, GitHub, Gmail"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background border-border text-foreground"
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-foreground">
              Username/Email
            </Label>
            <Input
              id="username"
              placeholder="user@example.com or leave blank"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-background border-border text-foreground"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              Password/Secret*
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password or secret"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-border text-foreground pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title || !password || isLoading}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {isLoading ? "Creating..." : "Create Secret"}
              {isLoading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
