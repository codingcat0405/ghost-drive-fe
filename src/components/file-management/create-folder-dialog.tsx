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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Folder } from "lucide-react";
import { toast } from "sonner";
import ghostDriveApi from "@/apis/ghost-drive-api";
import { useSearchParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

export function CreateFolderDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  //get current folder id from url
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const handleCreate = async () => {
    if (!folderName.trim()) return;

    try {
      setIsCreating(true);
      const currentFolderId = searchParams.get("folder")
        ? parseInt(searchParams.get("folder")!)
        : undefined;
      await ghostDriveApi.folder.createFolder({
        name: folderName,
        parentId: currentFolderId,
      });

      setFolderName("");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["folder-contents"] });
      queryClient.invalidateQueries({ queryKey: ["move-destinations"] });
      toast.success("Folder created successfully");
    } catch (error: any) {
      console.error("Failed to create folder:", error);
      toast.error(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            Create a new encrypted folder to organize your files
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <div className="relative">
              <Folder className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="folder-name"
                placeholder="My Documents"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreate();
                  }
                }}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!folderName.trim() || isCreating}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isCreating ? "Creating..." : "Create Folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
