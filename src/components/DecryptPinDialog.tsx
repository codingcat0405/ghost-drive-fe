import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "./ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Button } from "./ui/button";
import { useState } from "react";
import { toast } from "sonner";
import useUserStore from "@/store/user";
import cryptoUtils from "@/utils/crypto";
import { Shield, XCircle, Lock } from "lucide-react";

const DecryptPinDialog: React.FC<{
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess: (aesKeyPlain: string) => void;
}> = ({ open, setOpen, onSuccess }) => {
  const { user, setUser } = useUserStore();
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const handleDecryptAesKey = async () => {
    if (pin.length !== 6) {
      toast.error("Please enter a 6-digit PIN");
      setError("Please enter a 6-digit PIN");
      return;
    }

    try {
      setIsLoading(true);
      const aesKeyPlain = await cryptoUtils.decryptFileEncryptionKey(
        user.aesKeyEncrypted,
        pin
      );

      setUser({
        ...user,
        aesKeyPlain: aesKeyPlain,
      });

      setOpen(false);
      setPin("");
      toast.success("PIN verified successfully");
      onSuccess(aesKeyPlain);
    } catch (error: any) {
      console.error(error);
      setError("Invalid PIN. Please try again.");
      toast.error("Invalid PIN. Please try again.");
    } finally {
      setIsLoading(false);
      setPin("");
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[480px] border-border/50">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">Enter Your PIN</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-base leading-relaxed">
            Enter your PIN to encrypt or decrypt your files
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* PIN Input */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Enter PIN</Label>
            </div>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                value={pin}
                onChange={(value) => {
                  setPin(value);
                  setError("");
                }}
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot
                    type="password"
                    index={0}
                    className="h-14 w-12 text-lg border-border/50"
                  />
                  <InputOTPSlot
                    type="password"
                    index={1}
                    className="h-14 w-12 text-lg border-border/50"
                  />
                  <InputOTPSlot
                    type="password"
                    index={2}
                    className="h-14 w-12 text-lg border-border/50"
                  />
                  <InputOTPSlot
                    type="password"
                    index={3}
                    className="h-14 w-12 text-lg border-border/50"
                  />
                  <InputOTPSlot
                    type="password"
                    index={4}
                    className="h-14 w-12 text-lg border-border/50"
                  />
                  <InputOTPSlot
                    type="password"
                    index={5}
                    className="h-14 w-12 text-lg border-border/50"
                  />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
              <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="border-border/50 bg-transparent"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleDecryptAesKey}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            <Lock className="h-4 w-4 mr-2" /> Unlock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DecryptPinDialog;
