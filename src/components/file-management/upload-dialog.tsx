import type React from "react";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileIcon, X, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import useUserStore from "@/store/user";

import { sanitizeFileName, shortenFileName } from "@/utils/common";
import cryptoUtils from "@/utils/crypto";
import ghostDriveApi from "@/apis/ghost-drive-api";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import DecryptPinDialog from "../DecryptPinDialog";

export function UploadDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { user } = useUserStore();
  const [openPinDialog, setOpenPinDialog] = useState(false);
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState({
    percent: 0,
    stage: "",
  });
  const [uploading, setUploading] = useState(false);
  const [searchParams] = useSearchParams();
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setFile(droppedFiles[0]); // Only take the first file
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]); // Only take the first file
      e.target.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    if (!user.aesKeyPlain) {
      toast.error("Failed to encrypt file!");
      return;
    }
    const objectKey = sanitizeFileName(file.name);
    console.log("file", file);

    try {
      const currentFolderId = searchParams.get("folder")
        ? parseInt(searchParams.get("folder")!)
        : undefined;
      await ghostDriveApi.file.createFileEntry({
        name: file.name,
        objectKey,
        size: file.size,
        mimeType: file.type ?? "application/octet-stream",
        folderId: currentFolderId,
      });
      await cryptoUtils.encryptAndUpload(
        file,
        user.aesKeyPlain,
        objectKey,
        (progress) => {
          console.log(progress);

          setProgress({
            percent: progress.percentage,
            stage: progress.stage,
          });
          if (progress.percentage === 100) {
            setUploading(false);
            setFile(null);
            toast.success(`${file.name} uploaded successfully`);
            setProgress({
              percent: 0,
              stage: "",
            });
            // Invalidate and refetch the files query to update the file grid
            queryClient.invalidateQueries({ queryKey: ["folder-contents"] });
            setOpen(false);
          }
        }
      );
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast.error(`Upload failed: ${error.message}`);
      setUploading(false);
    }
  };

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (!user.aesKeyPlain && isOpen) {
      // If user doesn't have aesKeyPlain, show PIN dialog instead
      setOpenPinDialog(true);
      return;
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>
            Your file will be encrypted before upload. Maximum file size: 5GB
          </DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-border"
          )}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Drop file here</h3>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse
          </p>
          <input
            type="file"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <Button asChild variant="outline">
            <label htmlFor="file-upload" className="cursor-pointer">
              Select File
            </label>
          </Button>
        </div>

        {file && (
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
              <FileIcon className="h-8 w-8 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium truncate">
                    {shortenFileName(file.name)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={() => setFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span>{formatFileSize(file.size)}</span>
                  <span className="flex items-center gap-1 text-primary">
                    <Lock className="h-3 w-3" />
                    Encrypted
                  </span>
                </div>
                <Progress value={progress.percent} className="h-1" />
                <p className="text-xs text-muted-foreground mt-2">
                  {progress.stage}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </DialogContent>
      <DecryptPinDialog
        open={openPinDialog}
        setOpen={setOpenPinDialog}
        onSuccess={() => setOpen(true)}
      />
    </Dialog>
  );
}
