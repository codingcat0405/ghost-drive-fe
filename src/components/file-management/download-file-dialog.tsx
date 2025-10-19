import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, AlertCircle, ImageIcon, VideoIcon } from "lucide-react";

export function DownloadFileDialog({
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
    size: number;
    mimeType: string;
  };
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Download File
          </DialogTitle>
          <DialogDescription>"{file.name}"</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Preview Section */}
          <div className="rounded-lg border border-border bg-muted/30 p-4 min-h-48 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <AlertCircle className="h-12 w-12 text-muted-foreground/50" />
              <div className="text-center">
                <p className="font-medium">Preview Not Supported</p>
                <p className="text-xs mt-1">
                  This file type cannot be previewed please download the file to
                  view it.
                </p>
              </div>
            </div>
          </div>

          {/* File Info */}
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg border border-border/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">File Name:</span>
              <span className="font-medium truncate">{file.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">File Size:</span>
              <span className="font-medium">100 MB</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">File Type:</span>
              <span className="font-medium flex items-center gap-1">
                {file.mimeType.includes("image") && (
                  <ImageIcon className="h-4 w-4" />
                )}
                {file.mimeType.includes("video") && (
                  <VideoIcon className="h-4 w-4" />
                )}
                {file.mimeType}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {}}
            disabled={false}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
