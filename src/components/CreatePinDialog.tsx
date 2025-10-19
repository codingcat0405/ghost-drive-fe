import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import cryptoUtils from "@/utils/crypto";
import ghostDriveApi from "@/apis/ghost-drive-api";
import { useEffect, useState } from "react";
import useUserStore from "@/store/user";
import { AlertTriangle, Shield, Lock, XCircle } from "lucide-react";

const CreatePinDialog: React.FC = () => {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const { user, setUser } = useUserStore();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const handleCreatePin = async () => {
    if (pin.length !== 6) {
      toast.error("Please enter a 6-digit PIN");
      setError("Please enter a 6-digit PIN");
      return;
    }
    if (confirmPin.length !== 6) {
      toast.error("Please enter a 6-digit PIN");
      setError("Please enter a 6-digit PIN");
      return;
    }
    if (pin !== confirmPin) {
      toast.error("PINs do not match");
      setError("PINs do not match");
      return;
    }
    try {
      setIsLoading(true);
      const aesKey = await cryptoUtils.generateFileEncryptionKey();
      const aesKeyEncrypted = await cryptoUtils.encryptFileEncryptionKey(
        aesKey,
        pin
      );
      const updatedUser = await ghostDriveApi.user.updateAesKeyEncrypted(
        aesKeyEncrypted
      );
      setUser({
        ...user,
        aesKeyEncrypted: updatedUser.aesKeyEncrypted,
        aesKeyPlain: aesKey,
      });
      setOpen(false);
      toast.success("PIN created successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
      setIsLoading(false);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (user.id && !user.aesKeyEncrypted) {
      setOpen(true);
    }
  }, [user]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[480px] border-border/50">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">
                Create Encryption PIN
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-base leading-relaxed">
            Your PIN encrypts and decrypts your files locally. We never store
            your PIN on our servers.
          </DialogDescription>

          <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-200/90 leading-relaxed">
              <strong className="font-semibold">Important:</strong> If you
              forget this PIN, your files cannot be recovered. Store it safely.
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* PIN Input */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Create PIN</Label>
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

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Confirm PIN</Label>
            </div>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                value={confirmPin}
                onChange={(value) => {
                  setConfirmPin(value);
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
            onClick={handleCreatePin}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            <Lock className="h-4 w-4 mr-2" />
            Create PIN
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePinDialog;
