import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { FileGrid } from "@/components/dashboard/file-grid"
import { StorageBar } from "@/components/dashboard/storage-bar"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <QuickActions />
            <StorageBar />
          </div>
        </div>

        <FileGrid />
      </main>
    </div>
  )
}
