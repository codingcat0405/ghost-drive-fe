
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { HardDrive, FileText, ImageIcon, Video, Music, Archive, TrendingUp } from "lucide-react"

export function StorageSettings() {
  const usedStorage = 45.2 // GB
  const totalStorage = 100 // GB
  const percentage = (usedStorage / totalStorage) * 100

  const storageBreakdown = [
    { type: "Documents", size: 12.4, icon: FileText, color: "text-blue-500" },
    { type: "Images", size: 18.7, icon: ImageIcon, color: "text-green-500" },
    { type: "Videos", size: 14.1, icon: Video, color: "text-purple-500" },
    { type: "Audio", size: 3.2, icon: Music, color: "text-orange-500" },
    { type: "Archives", size: 2.8, icon: Archive, color: "text-yellow-500" },
  ]

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
                    {usedStorage} GB of {totalStorage} GB used
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-primary">{percentage.toFixed(1)}%</span>
            </div>

            <Progress value={percentage} className="h-3" />
          </div>

          <div className="space-y-3">
            {storageBreakdown.map((item) => (
              <div
                key={item.type}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  <span className="font-medium">{item.type}</span>
                </div>
                <span className="text-sm text-muted-foreground">{item.size} GB</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Upgrade Storage</CardTitle>
          <CardDescription>Get more space for your encrypted files</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-border/50 bg-muted/50">
              <h4 className="font-semibold mb-1">Free</h4>
              <p className="text-2xl font-bold mb-2">100 GB</p>
              <p className="text-sm text-muted-foreground mb-4">Current plan</p>
              <Button variant="outline" className="w-full bg-transparent" disabled>
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
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Upgrade</Button>
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
  )
}
