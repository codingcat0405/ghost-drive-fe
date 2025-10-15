import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SettingsTabs } from "@/components/settings/settings-tabs"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and security preferences</p>
        </div>

        <SettingsTabs />
      </main>
    </div>
  )
}
