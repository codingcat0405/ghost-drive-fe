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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folder, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ghostDriveApi from "@/apis/ghost-drive-api";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import { shortenFileName } from "@/utils/common";

export function MoveFileDialog({
  file,
  open,
  setOpen,
}: {
  file: {
    id: number;
    name: string;
    type: "file" | "folder";
  };
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [searchParams] = useSearchParams();
  const currentFolderId = searchParams.get("folder")
    ? parseInt(searchParams.get("folder")!)
    : undefined;
  const { data: moveDestinations = [] } = useQuery({
    queryKey: [
      "move-destinations",
      { sourceFolderId: currentFolderId, type: file.type },
    ],
    queryFn: ({ queryKey }) =>
      ghostDriveApi.folder.getMoveDestinations(queryKey[1] as any),
  });

  const queryClient = useQueryClient();
  const handleMove = async () => {
    if (!selectedFolder) return;
    try {
      setIsMoving(true);
      if (file.type === "folder") {
        await ghostDriveApi.folder.updateFolder(file.id, {
          parentId: selectedFolder,
          name: file.name,
        });
      } else {
        await ghostDriveApi.file.updateFileEntry(file.id, {
          folderId: selectedFolder,
          name: file.name,
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["folder-contents", { folderId: currentFolderId }],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "move-destinations",
          { sourceFolderId: currentFolderId, type: file.type },
        ],
      });
      toast.success("File moved successfully");
      setOpen(false);
    } catch (error: any) {
      console.error("Failed to move file:", error);
      toast.error(error.message);
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move "{shortenFileName(file.name)}"</DialogTitle>
          <DialogDescription>Select a destination folder</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-64 rounded-lg border border-border">
          <div className="p-2 space-y-1">
            {moveDestinations.map((folder) => (
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
                <span className="flex-1 font-medium">{folder.path}</span>
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
