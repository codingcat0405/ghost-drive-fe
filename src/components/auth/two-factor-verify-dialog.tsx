import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Smartphone, AlertCircle } from "lucide-react";

interface TwoFactorLoginDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onVerify: (code: string) => Promise<void>;
  isVerifying?: boolean;
}

export function TwoFactorVerifyDialog({
  open,
  setOpen,
  onVerify,
  isVerifying = false,
}: TwoFactorLoginDialogProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (code.length === 6) {
      setError("");
      await onVerify(code);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCode("");
      setError("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Enter the 6-digit code from your authenticator app
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Authentication Code</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={setCode}
                  disabled={isVerifying}
                >
                  <InputOTPGroup>
                    <InputOTPSlot type="text" index={0} />
                    <InputOTPSlot type="text" index={1} />
                    <InputOTPSlot type="text" index={2} />
                    <InputOTPSlot type="text" index={3} />
                    <InputOTPSlot type="text" index={4} />
                    <InputOTPSlot type="text" index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-destructive/5 rounded-lg border border-destructive/20 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Open your authenticator app and enter the 6-digit code
            </p>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg border border-border/50 flex items-start gap-2">
            <Smartphone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              The code changes every 30 seconds. If it expires, request a new
              one.
            </p>
          </div>

          <Button
            onClick={handleVerify}
            disabled={code.length !== 6 || isVerifying}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? "Verifying..." : "Verify"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
