import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import ghostDriveApi from "@/apis/ghost-drive-api";

export function ConfirmDeleteDialog({
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
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const handleConfirm = async () => {
    try {
      if (!file) return;
      setIsDeleting(true);
      if (file.type === "file") {
        await ghostDriveApi.file.deleteFileEntry(file.id);
      } else {
        await ghostDriveApi.folder.deleteFolder(file.id);
      }
      queryClient.invalidateQueries({ queryKey: ["folder-contents"] });
      queryClient.invalidateQueries({ queryKey: ["move-destinations"] });
      toast.success("File deleted successfully");
      setOpen(false);
    } catch (error: any) {
      console.error("Failed to delete file:", error);
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[400px] border-border/50">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 ring-1 ring-destructive/20">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-xl">Delete File</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              "{file?.name}"
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-border/50 bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isDeleting}
            variant="destructive"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
