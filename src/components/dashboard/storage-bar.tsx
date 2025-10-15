import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HardDrive } from "lucide-react";

export function StorageBar() {
  const usedStorage = 45.2; // GB
  const totalStorage = 100; // GB
  const percentage = (usedStorage / totalStorage) * 100;

  return (
    <Card className="p-6 border-border/50 bg-card/50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <HardDrive className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Storage</h3>
            <p className="text-sm text-muted-foreground">
              {usedStorage} GB of {totalStorage} GB used
            </p>
          </div>
        </div>
        <span className="text-sm font-medium text-primary">
          {percentage.toFixed(1)}%
        </span>
      </div>

      <Progress value={percentage} className="h-2" />

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Documents</p>
          <p className="font-medium">12.4 GB</p>
        </div>
        <div>
          <p className="text-muted-foreground">Images</p>
          <p className="font-medium">18.7 GB</p>
        </div>
        <div>
          <p className="text-muted-foreground">Videos</p>
          <p className="font-medium">14.1 GB</p>
        </div>
      </div>
    </Card>
  );
}
