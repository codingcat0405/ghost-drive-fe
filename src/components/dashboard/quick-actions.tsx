import { Card } from "@/components/ui/card";
import { Upload, FolderPlus, Link, FileText } from "lucide-react";
import { UploadDialog } from "@/components/file-management/upload-dialog";
import { CreateFolderDialog } from "@/components/file-management/create-folder-dialog";
import { ShareDialog } from "@/components/file-management/share-dialog";


export function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <UploadDialog>
        <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer border-border/50 bg-card/50">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 rounded-lg bg-primary/10">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium">Upload Files</span>
          </div>
        </Card>
      </UploadDialog>

      <CreateFolderDialog>
        <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer border-border/50 bg-card/50">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 rounded-lg bg-primary/10">
              <FolderPlus className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium">New Folder</span>
          </div>
        </Card>
      </CreateFolderDialog>

      <ShareDialog fileName="example.pdf">
        <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer border-border/50 bg-card/50">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 rounded-lg bg-primary/10">
              <Link className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium">Share Link</span>
          </div>
        </Card>
      </ShareDialog>

      <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer border-border/50 bg-card/50">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <span className="text-sm font-medium">New Document</span>
        </div>
      </Card>
    </div>
  );
}
