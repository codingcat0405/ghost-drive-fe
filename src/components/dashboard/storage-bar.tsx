import ghostDriveApi from "@/apis/ghost-drive-api";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { bytesToGB } from "@/utils/common";
import { useQuery } from "@tanstack/react-query";
import { HardDrive } from "lucide-react";

export function StorageBar() {
  const {
    data: quotaReport = {
      totalStorage: 0,
      storageQuota: 0,
      totalStorageImage: 0,
      totalStorageVideo: 0,
      totalStorageAudio: 0,
      otherStorage: 0,
    },
    isLoading: isLoadingQuotaReport,
  } = useQuery({
    queryKey: ["quota-report"],
    queryFn: () => ghostDriveApi.user.getQuotaReport(),
  });

  if (isLoadingQuotaReport) {
    return <div>Loading...</div>;
  }

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
              {bytesToGB(quotaReport.totalStorage)} GB of{" "}
              {bytesToGB(quotaReport.storageQuota)} GB used
            </p>
          </div>
        </div>
        <span className="text-sm font-medium text-primary">
          {(
            ((quotaReport.totalStorage ?? 0) /
              (quotaReport?.storageQuota ?? 0)) *
            100
          ).toFixed(1)}
          %
        </span>
      </div>

      <Progress value={quotaReport.totalStorage / quotaReport.storageQuota * 100} className="h-2" />

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Documents</p>
          <p className="font-medium">{bytesToGB(quotaReport.totalStorage, 4)} GB</p>
        </div>
        <div>
          <p className="text-muted-foreground">Images</p>
          <p className="font-medium">{bytesToGB(quotaReport.totalStorageImage, 4)} GB</p>
        </div>
        <div>
          <p className="text-muted-foreground">Videos</p>
          <p className="font-medium">{bytesToGB(quotaReport.totalStorageVideo, 4)} GB</p>
        </div>
      </div>
    </Card>
  );
}
