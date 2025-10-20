import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  HardDrive,
  ImageIcon,
  Video,
  Music,
  Archive,
  TrendingUp,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ghostDriveApi from "@/apis/ghost-drive-api";
import { bytesToGB } from "@/utils/common";

export function StorageSettings() {
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
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Storage Usage</CardTitle>
          <CardDescription>Monitor your storage consumption</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <HardDrive className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Total Storage</h3>
                  <p className="text-sm text-muted-foreground">
                    {bytesToGB(quotaReport.totalStorage)} GB of{" "}
                    {bytesToGB(quotaReport.storageQuota)} GB used
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-primary">
                {((quotaReport.totalStorage / quotaReport.storageQuota) * 100).toFixed(1)}%
              </span>
            </div>

            <Progress
              value={
                (quotaReport.totalStorage / quotaReport.storageQuota) * 100
              }
              className="h-3"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Images</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {bytesToGB(quotaReport.totalStorageImage, 4)} GB
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-center gap-3">
                <Video className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Videos</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {bytesToGB(quotaReport.totalStorageVideo, 4)} GB
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-center gap-3">
                <Music className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Audio</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {bytesToGB(quotaReport.totalStorageAudio, 4)} GB
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-center gap-3">
                <Archive className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Other</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {bytesToGB(quotaReport.otherStorage, 4)} GB
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Upgrade Storage</CardTitle>
          <CardDescription>
            Get more space for your encrypted files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-border/50 bg-muted/50">
              <h4 className="font-semibold mb-1">Free</h4>
              <p className="text-2xl font-bold mb-2">100 GB</p>
              <p className="text-sm text-muted-foreground mb-4">Current plan</p>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                disabled
              >
                Current Plan
              </Button>
            </div>

            <div className="p-4 rounded-lg border-2 border-primary bg-primary/5 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                Popular
              </div>
              <h4 className="font-semibold mb-1">Pro</h4>
              <p className="text-2xl font-bold mb-2">1 TB</p>
              <p className="text-sm text-muted-foreground mb-4">$9.99/month</p>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Upgrade
              </Button>
            </div>

            <div className="p-4 rounded-lg border border-border/50 bg-muted/50">
              <h4 className="font-semibold mb-1">Business</h4>
              <p className="text-2xl font-bold mb-2">5 TB</p>
              <p className="text-sm text-muted-foreground mb-4">$29.99/month</p>
              <Button variant="outline" className="w-full bg-transparent">
                Upgrade
              </Button>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm mb-1">All plans include:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• End-to-end encryption</li>
                  <li>• Unlimited file uploads</li>
                  <li>• Advanced sharing controls</li>
                  <li>• Priority support</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
