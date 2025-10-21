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
import {
  Lock,
  Key,
  Smartphone,
  Shield,
  CheckCircle2,
  X,
  Loader2,
  EyeOff,
  Eye,
  Copy,
  Check,
} from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { toast } from "sonner";
import useUserStore from "@/store/user";
import cryptoUtils from "@/utils/crypto";
import ghostDriveApi from "@/apis/ghost-drive-api";
import DecryptPinDialog from "../DecryptPinDialog";
import { shortenFileName } from "@/utils/common";

export function SecuritySettings() {
  const { user, setUser } = useUserStore();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinUpdateSuccess, setPinUpdateSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleUpdatePin = async () => {
    setIsLoading(true);
    if (newPin !== confirmPin) {
      toast.error("PINs do not match");
      return;
    }
    if (newPin.length !== 6) {
      toast.error("Please enter a 6-digit PIN");
      return;
    }
    if (currentPin.length !== 6) {
      toast.error("Please enter a 6-digit PIN");
      return;
    }
    try {
      const aesKeyPlain = await cryptoUtils.decryptFileEncryptionKey(
        user.aesKeyEncrypted,
        currentPin
      );
      const newEncryptedKey = await cryptoUtils.encryptFileEncryptionKey(
        aesKeyPlain,
        newPin
      );
      const updatedUser = await ghostDriveApi.user.updateAesKeyEncrypted(
        newEncryptedKey
      );
      setUser({
        ...user,
        aesKeyEncrypted: updatedUser.aesKeyEncrypted,
      });
      setPinUpdateSuccess(true);
      toast.success("PIN updated successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
      setPinUpdateSuccess(false);
    } finally {
      setIsLoading(false);
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const pinMatch = newPin === confirmPin && newPin.length === 6;

  const [showEncryptionKey, setShowEncryptionKey] = useState(false);
  const [openPinDialog, setOpenPinDialog] = useState(false);
  const maskedKey = "•".repeat(10);
  const [keyCopied, setKeyCopied] = useState(false);
  const handleEyeClick = () => {
    if (showEncryptionKey) {
      setShowEncryptionKey(false);
      return;
    }
    setOpenPinDialog(true);
  };

  const handleUpdatePassword = async () => {
    if (
      currentPassword.length === 0 ||
      newPassword.length === 0 ||
      confirmPassword.length === 0
    ) {
      toast.error("Please enter all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      setIsLoading(true);
      const updatedUser = await ghostDriveApi.user.updatePassword({
        oldPassword: currentPassword,
        newPassword: newPassword,
      });
      setUser(updatedUser);
      toast.success("Password updated successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };
  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(user.aesKeyEncrypted);
      setKeyCopied(true);
      toast.success("Encryption key copied to clipboard");
      setTimeout(() => setKeyCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy key:", err);
    }
  };

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

          <Button
            onClick={handleUpdatePassword}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Update Password"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Update Encryption PIN</CardTitle>
          <CardDescription>
            Change your 6-digit PIN used for file encryption and decryption
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="current-pin">Current PIN</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={currentPin}
                  onChange={setCurrentPin}
                >
                  <InputOTPGroup>
                    <InputOTPSlot type="password" index={0} />
                    <InputOTPSlot type="password" index={1} />
                    <InputOTPSlot type="password" index={2} />
                    <InputOTPSlot type="password" index={3} />
                    <InputOTPSlot type="password" index={4} />
                    <InputOTPSlot type="password" index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="new-pin">New PIN</Label>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={newPin} onChange={setNewPin}>
                  <InputOTPGroup>
                    <InputOTPSlot type="password" index={0} />
                    <InputOTPSlot type="password" index={1} />
                    <InputOTPSlot type="password" index={2} />
                    <InputOTPSlot type="password" index={3} />
                    <InputOTPSlot type="password" index={4} />
                    <InputOTPSlot type="password" index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="confirm-pin">Confirm New PIN</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={confirmPin}
                  onChange={setConfirmPin}
                >
                  <InputOTPGroup>
                    <InputOTPSlot type="password" index={0} />
                    <InputOTPSlot type="password" index={1} />
                    <InputOTPSlot type="password" index={2} />
                    <InputOTPSlot type="password" index={3} />
                    <InputOTPSlot type="password" index={4} />
                    <InputOTPSlot type="password" index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {confirmPin.length === 6 && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  {pinMatch ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span className="text-sm text-primary">PINs match</span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 text-destructive" />
                      <span className="text-sm text-destructive">
                        PINs do not match
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {pinUpdateSuccess && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-sm mb-1">
                    PIN Updated Successfully
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Your encryption PIN has been updated. Use your new PIN to
                    decrypt files.
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleUpdatePin}
            disabled={!pinMatch || currentPin.length !== 6 || isLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Update PIN
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
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-background p-2 rounded flex-1 overflow-x-auto font-mono">
                    {showEncryptionKey ? shortenFileName(user.aesKeyEncrypted) : maskedKey}
                  </code>
                  {showEncryptionKey && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyKey}
                      className="flex-shrink-0 bg-transparent"
                      title="Copy encryption key"
                    >
                      {keyCopied ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEyeClick}
                    className="flex-shrink-0 bg-transparent"
                  >
                    {showEncryptionKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {showEncryptionKey && (
                  <p className="text-xs text-primary mt-2">
                    ✓ Key is visible. Click the eye icon to hide it.
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <DecryptPinDialog
        open={openPinDialog}
        setOpen={setOpenPinDialog}
        onSuccess={() => setShowEncryptionKey(true)}
      />
    </div>
  );
}
