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
import { Smartphone, AlertCircle, Loader2 } from "lucide-react";
import ghostDriveApi from "@/apis/ghost-drive-api";
import { toast } from "sonner";

interface TwoFactorSetupDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onComplete: (isEnabled: boolean) => void;
  secret: string;
  qrCode: string;
}

export function TwoFactorSetupDialog({
  open,
  setOpen,
  onComplete,
  secret,
  qrCode,
}: TwoFactorSetupDialogProps) {
  const [step, setStep] = useState<"qr" | "verify">("qr");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Mock QR code data - in production, generate this from backend

  const handleVerify = async () => {
    try {
      setIsLoading(true);
      const success = await ghostDriveApi.twoFactor.enable(verificationCode);
      if (!success) {
        throw new Error("Failed to enable 2FA");
      }
      toast.success("2FA enabled successfully");
      onComplete(true);
      handleClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
      onComplete(false);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep("qr");
    setVerificationCode("");
    setError("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            {step === "qr"
              ? "Scan this QR code with your authenticator app"
              : "Enter the 6-digit code from your authenticator app"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {step === "qr" && (
            <>
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-white rounded-lg">
                  <img
                    src={qrCode || "/placeholder.svg"}
                    alt="2FA QR Code"
                    className="w-48 h-48"
                  />
                </div>

                <div className="w-full p-4 bg-muted/50 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">
                    Can't scan? Enter this code manually:
                  </p>
                  <code className="text-sm font-mono bg-background p-2 rounded block text-center break-all">
                    {secret}
                  </code>
                </div>

                <div className="w-full p-3 bg-primary/5 rounded-lg border border-primary/20 flex items-start gap-2">
                  <Smartphone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Use Google Authenticator, Microsoft Authenticator, or Authy
                    to scan the QR code.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setStep("verify")}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                I've Scanned the Code
              </Button>
            </>
          )}

          {step === "verify" && (
            <>
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>Verification Code</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={verificationCode}
                      onChange={setVerificationCode}
                      disabled={isLoading}
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
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep("qr");
                    setError("");
                  }}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleVerify}
                  disabled={verificationCode.length !== 6 || isLoading}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Enable"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
