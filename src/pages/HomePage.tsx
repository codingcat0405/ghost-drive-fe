import { FileGrid } from "@/components/dashboard/file-grid";
import { QuickActions } from "@/components/dashboard/quick-actions";
import CreatePinDialog from "@/components/CreatePinDialog";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <QuickActions />
          </div>
        </div>
        <FileGrid />
      </main>
      <CreatePinDialog />
    </div>
  );
}
