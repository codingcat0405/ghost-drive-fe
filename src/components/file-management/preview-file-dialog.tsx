import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Download, Loader2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shortenFileName } from "@/utils/common";
import { useEffect, useState } from "react";
import useUserStore from "@/store/user";
import { toast } from "sonner";
import cryptoUtils from "@/utils/crypto";

// Helper function to check if file can be previewed
function canPreview(file: {
  id: number;
  name: string;
  type: "file" | "folder";
  size: number;
  mimeType: string;
}): { canPreview: boolean; reason?: string } {
  if (file.mimeType.includes("image")) {
    return { canPreview: true };
  }

  if (file.mimeType.includes("audio")) {
    const sizeInBytes = file.size / 1024 / 1024; // convert to MB
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (sizeInBytes > maxSize) {
      return {
        canPreview: false,
        reason: `Audio file is too large (${file.size}). Maximum size for preview is 10MB.`,
      };
    }
    return { canPreview: true };
  }

  if (file.mimeType === "video") {
    const sizeInBytes = file.size / 1024 / 1024; // convert to MB
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (sizeInBytes > maxSize) {
      return {
        canPreview: false,
        reason: `Video file is too large (${file.size}). Maximum size for preview is 100MB.`,
      };
    }
    return { canPreview: true };
  }

  return {
    canPreview: false,
    reason: "Preview not supported for this file type.",
  };
}

export function PreviewFileDialog({
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
    objectKey: string;
  };
}) {
  if (!file) return null;
  const [decrypting, setDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUserStore();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewInfo = canPreview(file);

  const onDownload = async () => {
    let downloadUrl = previewUrl;
    if (!downloadUrl) {
      downloadUrl = await decryptFile();
    }
    if (!downloadUrl) {
      toast.error("Failed to decrypt file");
      return;
    }
    //download file from the preview url
    const response = await fetch(downloadUrl ?? "");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("File downloaded successfully");
    setOpen(false);
  };
  const decryptFile = async () => {
    try {
      setDecrypting(true);
      if (!user.aesKeyPlain) {
        throw new Error("Pin not verified");
      }
      const blob = await cryptoUtils.decryptAndDownload(
        file.objectKey,
        user.aesKeyPlain,
        file.size
      );
      const url = URL.createObjectURL(blob);

      return url;
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
      setError(error.message);
      return null;
    } finally {
      setDecrypting(false);
    }
  };
  useEffect(() => {
    if (!user.aesKeyPlain) {
      return;
    }
    if (!open) {
      setPreviewUrl(null);
      setDecrypting(false);
      return;
    }
    if (canPreview(file).canPreview) {
      decryptFile().then((url) => {
        if (url) {
          setPreviewUrl(url);
        }
      });
      return;
    }
  }, [open, user.aesKeyPlain]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="truncate">
            {shortenFileName(file.name)}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="flex items-center justify-center">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span>{error}</span>
          </div>
        )}

        {decrypting ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Decrypting file...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {previewInfo.canPreview && !error ? (
              <>
                {file.mimeType.includes("image") && (
                  <div className="flex items-center justify-center bg-muted/50 rounded-lg p-4 min-h-[300px]">
                    <img
                      src={previewUrl ?? ""}
                      alt={file.name}
                      className="max-h-[400px] max-w-full rounded-lg object-contain"
                    />
                  </div>
                )}

                {file.mimeType.includes("audio") && (
                  <div className="flex flex-col items-center justify-center bg-muted/50 rounded-lg p-8 space-y-4">
                    <div className="p-4 rounded-full bg-primary/10">
                      <Music className="h-12 w-12 text-primary" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold">{file.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {file.size}
                      </p>
                    </div>
                    <audio
                      controls
                      className="w-full max-w-sm"
                      src={previewUrl ?? ""}
                    />
                  </div>
                )}

                {file.mimeType.includes("video") && (
                  <div className="flex items-center justify-center bg-muted/50 rounded-lg p-4 min-h-[300px]">
                    <video
                      controls
                      className="max-h-[400px] max-w-full rounded-lg"
                      src={previewUrl ?? ""}
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button onClick={onDownload} className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="flex-1 bg-transparent"
                  >
                    Close
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="p-4 rounded-full bg-destructive/10">
                  <AlertCircle className="h-12 w-12 text-destructive" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-semibold">Preview Not Available</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {previewInfo.reason}
                  </p>
                </div>

                <div className="flex gap-2 pt-4 w-full">
                  <Button onClick={onDownload} className="flex-1" disabled={decrypting}>
                    <Download className="mr-2 h-4 w-4" />
                    {decrypting ? "Decrypting..." : "Download File"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="flex-1 bg-transparent"
                    disabled={decrypting}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}

            <div className="border-t pt-4 text-xs text-muted-foreground space-y-1">
              <p>
                <span className="font-semibold">File:</span>{" "}
                {shortenFileName(file.name)}
              </p>
              {file.size && (
                <p>
                  <span className="font-semibold">Size:</span>{" "}
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
