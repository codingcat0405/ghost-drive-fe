import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSettings } from "@/components/settings/account-settings";
import { SecuritySettings } from "@/components/settings/security-settings";
import { StorageSettings } from "@/components/settings/storage-settings";
import { User, Shield, HardDrive } from "lucide-react";

export function SettingsTabs() {
  return (
    <Tabs defaultValue="account" className="space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-3">
        <TabsTrigger value="account" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Account</span>
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">Security</span>
        </TabsTrigger>
        <TabsTrigger value="storage" className="flex items-center gap-2">
          <HardDrive className="h-4 w-4" />
          <span className="hidden sm:inline">Storage</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="account">
        <AccountSettings />
      </TabsContent>

      <TabsContent value="security">
        <SecuritySettings />
      </TabsContent>

      <TabsContent value="storage">
        <StorageSettings />
      </TabsContent>
    </Tabs>
  );
}
