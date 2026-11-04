import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Download, Loader2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shortenFileName } from "@/utils/common";
import { useState } from "react";
import useUserStore from "@/store/user";
import { toast } from "sonner";
import { downloadDecryptedFile } from "@/utils/download-decrypted-file";
import { getPreviewKind, useDecryptedFilePreview } from "@/hooks/use-decrypted-file-preview";

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
  const { user } = useUserStore();
  const [downloading, setDownloading] = useState(false);
  const [preview, setPreview] = useDecryptedFilePreview(open, file, user.aesKeyPlain);

  const previewUrl = preview.status === "ready" ? preview.url : null;
  const decrypting = preview.status === "loading";
  const error = preview.status === "error" ? preview.reason : null;

  const onDownload = async () => {
    if (!user.aesKeyPlain) {
      toast.error("Pin not verified");
      return;
    }
    try {
      setDownloading(true);
      const mode = await downloadDecryptedFile(file, user.aesKeyPlain, previewUrl, (message) =>
        toast.error(`Download failed: ${message}`)
      );
      toast.success(
        mode === "streaming"
          ? "Download started — decrypting while downloading"
          : "File downloaded successfully"
      );
      setOpen(false);
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to download file");
    } finally {
      setDownloading(false);
    }
  };

  // Media element failed (network/decrypt error mid-stream or codec unsupported on this device)
  const onMediaError = () =>
    setPreview({
      status: "error",
      reason:
        "Cannot play this file in the browser (unsupported format/codec or decryption failed). Try downloading it.",
    });

  if (!file) return null;
  const sizeInMb = (file.size / 1024 / 1024).toFixed(2);
  const kind = getPreviewKind(file.mimeType);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="truncate">
            {shortenFileName(file.name)}
          </DialogTitle>
        </DialogHeader>

        {decrypting ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Decrypting file...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {previewUrl ? (
              <>
                {kind === "image" && (
                  <div className="flex items-center justify-center bg-muted/50 rounded-lg p-4 min-h-[300px]">
                    <img
                      src={previewUrl}
                      alt={file.name}
                      className="max-h-[400px] max-w-full rounded-lg object-contain"
                    />
                  </div>
                )}

                {kind === "audio" && (
                  <div className="flex flex-col items-center justify-center bg-muted/50 rounded-lg p-8 space-y-4">
                    <div className="p-4 rounded-full bg-primary/10">
                      <Music className="h-12 w-12 text-primary" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold">{file.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {sizeInMb} MB
                      </p>
                    </div>
                    <audio
                      controls
                      preload="metadata"
                      className="w-full max-w-sm"
                      src={previewUrl}
                      onError={onMediaError}
                    />
                  </div>
                )}

                {kind === "video" && (
                  <div className="flex items-center justify-center bg-muted/50 rounded-lg p-4 min-h-[300px]">
                    <video
                      controls
                      playsInline
                      preload="metadata"
                      className="max-h-[400px] max-w-full rounded-lg"
                      src={previewUrl}
                      onError={onMediaError}
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button onClick={onDownload} className="flex-1" disabled={downloading}>
                    <Download className="mr-2 h-4 w-4" />
                    {downloading ? "Preparing..." : "Download"}
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
                  <h3 className="font-semibold">
                    {error ? "Preview Failed" : "Preview Not Available"}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {error ??
                      (preview.status === "unsupported"
                        ? preview.reason
                        : "Verify your PIN to preview this file.")}
                  </p>
                </div>

                <div className="flex gap-2 pt-4 w-full">
                  <Button onClick={onDownload} className="flex-1" disabled={downloading}>
                    <Download className="mr-2 h-4 w-4" />
                    {downloading ? "Preparing..." : "Download File"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="flex-1 bg-transparent"
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
              {file.size > 0 && (
                <p>
                  <span className="font-semibold">Size:</span> {sizeInMb} MB
                </p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
