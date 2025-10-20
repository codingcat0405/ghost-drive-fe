import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PencilIcon } from "lucide-react";
import { getFileExtension, shortenFileName } from "@/utils/common";
import { toast } from "sonner";
import ghostDriveApi from "@/apis/ghost-drive-api";
import { useQueryClient } from "@tanstack/react-query";

export function RenameFileDialog({
  open,
  setOpen,
  file,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  file: {
    id: number;
    name: string;
    type: "file" | "folder";
  };
}) {
  const [newName, setNewName] = useState(file?.name);
  const [isRenaming, setIsRenaming] = useState(false);
  const queryClient = useQueryClient();
  const handleRename = async () => {
    if (!file) return;
    if (!newName.trim() || newName === file?.name) return;

    try {
      setIsRenaming(true);

      if (file.type === "file") {
        await ghostDriveApi.file.updateFileEntry(file.id, {
          name: newName + "." + getFileExtension(file.name),
        });
      } else {
        await ghostDriveApi.folder.updateFolder(file.id, {
          name: newName,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["folder-contents"] });
      queryClient.invalidateQueries({ queryKey: ["move-destinations"] });
      toast.success("File renamed successfully");
      setNewName("");
      setOpen(false);
    } catch (error: any) {
      console.error("Failed to rename file:", error);
      toast.error(error.message);
    } finally {
      setIsRenaming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PencilIcon className="h-5 w-5 text-primary" />
            Rename File
          </DialogTitle>
          <DialogDescription>
            Enter a new name for "{shortenFileName(file?.name)}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-name">
              New {file.type === "file" ? "File" : "Folder"} Name
            </Label>
            <Input
              id="new-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new file name"
              autoFocus
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  newName.trim() &&
                  newName !== file?.name
                ) {
                  handleRename();
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Extension:{" "}
              {file.type === "file"
                ? `.${getFileExtension(file?.name)}`
                : "folder"}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleRename}
            disabled={!newName.trim() || newName === file?.name || isRenaming}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isRenaming ? "Renaming..." : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
