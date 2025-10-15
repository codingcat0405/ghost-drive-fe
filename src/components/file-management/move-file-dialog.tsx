import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folder, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderItem {
  id: string;
  name: string;
  path: string;
}

const mockFolders: FolderItem[] = [
  { id: "1", name: "Work Documents", path: "/Work Documents" },
  { id: "2", name: "Personal Photos", path: "/Personal Photos" },
  { id: "3", name: "Design Assets", path: "/Design Assets" },
  { id: "4", name: "Projects", path: "/Projects" },
  { id: "5", name: "Archive", path: "/Archive" },
];

export function MoveFileDialog({
  children,
  fileName,
}: {
  children: React.ReactNode;
  fileName: string;
}) {
  const [open, setOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  const handleMove = async () => {
    if (!selectedFolder) return;

    setIsMoving(true);

    // TODO: Implement actual file move with your Elysia backend
    await new Promise((resolve) => setTimeout(resolve, 500));

    setIsMoving(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move "{fileName}"</DialogTitle>
          <DialogDescription>Select a destination folder</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-64 rounded-lg border border-border">
          <div className="p-2 space-y-1">
            {mockFolders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                  selectedFolder === folder.id
                    ? "bg-primary/10 border border-primary"
                    : "hover:bg-muted/50"
                )}
              >
                <Folder
                  className={cn(
                    "h-5 w-5",
                    selectedFolder === folder.id
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                />
                <span className="flex-1 font-medium">{folder.name}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={!selectedFolder || isMoving}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isMoving ? "Moving..." : "Move Here"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
