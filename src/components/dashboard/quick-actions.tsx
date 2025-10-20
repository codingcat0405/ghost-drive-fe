import { Card } from "@/components/ui/card";
import { Upload, FolderPlus } from "lucide-react";
import { UploadDialog } from "@/components/file-management/upload-dialog";
import { CreateFolderDialog } from "@/components/file-management/create-folder-dialog";

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UploadDialog>
        <Card className="p-6 hover:bg-accent/50 transition-all duration-200 cursor-pointer border-border/50 bg-gradient-to-br from-card/80 to-card/40 hover:shadow-lg hover:shadow-primary/10">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-4 rounded-xl bg-primary/15 group-hover:bg-primary/20 transition-colors">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Upload Files</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Add files to your secure storage
              </p>
            </div>
          </div>
        </Card>
      </UploadDialog>

      <CreateFolderDialog>
        <Card className="p-6 hover:bg-accent/50 transition-all duration-200 cursor-pointer border-border/50 bg-gradient-to-br from-card/80 to-card/40 hover:shadow-lg hover:shadow-primary/10">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-4 rounded-xl bg-primary/15 group-hover:bg-primary/20 transition-colors">
              <FolderPlus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold">New Folder</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Organize your files
              </p>
            </div>
          </div>
        </Card>
      </CreateFolderDialog>
    </div>
  );
}
