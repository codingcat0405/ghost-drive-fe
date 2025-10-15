import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Lock, Key, Smartphone, Shield, AlertTriangle } from "lucide-react";

export function SecuritySettings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Update Password
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Authenticator App</h4>
                <p className="text-sm text-muted-foreground">
                  Use an app to generate codes
                </p>
              </div>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>

          {twoFactorEnabled && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-sm mb-1">
                    Two-Factor Authentication Enabled
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Your account is now protected with 2FA. You'll need to enter
                    a code from your authenticator app when signing in.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Encryption Keys</CardTitle>
          <CardDescription>
            Manage your end-to-end encryption keys
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">
                  Your Encryption Key
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  This key is used to encrypt and decrypt your files. Keep it
                  safe and never share it.
                </p>
                <code className="text-xs bg-background p-2 rounded block overflow-x-auto">
                  a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
                </code>
              </div>
            </div>
          </div>

          <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm mb-1 text-destructive">
                  Important
                </h4>
                <p className="text-xs text-muted-foreground">
                  If you lose your encryption key, you will not be able to
                  access your files. We cannot recover your data without this
                  key.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">Download Key</Button>
            <Button variant="outline">Regenerate Key</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
