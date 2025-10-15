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

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
}

export function UploadDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: "pending" as const,
    }));

    setFiles((prev) => [...prev, ...uploadFiles]);

    // Simulate upload
    uploadFiles.forEach((uploadFile) => {
      simulateUpload(uploadFile.id);
    });
  };

  const simulateUpload = (fileId: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, status: "uploading" as const } : f
      )
    );

    const interval = setInterval(() => {
      setFiles((prev) => {
        const file = prev.find((f) => f.id === fileId);
        if (!file || file.progress >= 100) {
          clearInterval(interval);
          return prev.map((f) =>
            f.id === fileId
              ? { ...f, progress: 100, status: "complete" as const }
              : f
          );
        }

        return prev.map((f) =>
          f.id === fileId
            ? { ...f, progress: Math.min(f.progress + 10, 100) }
            : f
        );
      });
    }, 200);
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Your files will be encrypted before upload. Maximum file size: 5GB
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
          <h3 className="text-lg font-semibold mb-2">Drop files here</h3>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse
          </p>
          <input
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <Button asChild variant="outline">
            <label htmlFor="file-upload" className="cursor-pointer">
              Select Files
            </label>
          </Button>
        </div>

        {files.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((uploadFile) => (
              <div
                key={uploadFile.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
              >
                <FileIcon className="h-8 w-8 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium truncate">
                      {uploadFile.file.name}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={() => removeFile(uploadFile.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <span>{formatFileSize(uploadFile.file.size)}</span>
                    {uploadFile.status === "complete" && (
                      <span className="flex items-center gap-1 text-primary">
                        <Lock className="h-3 w-3" />
                        Encrypted
                      </span>
                    )}
                  </div>
                  {uploadFile.status !== "complete" && (
                    <Progress value={uploadFile.progress} className="h-1" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
