import {
  Dialog,
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
import usePinDialogStore from "@/store/pinDialog";
import useUserStore from "@/store/user";
import cryptoUtils from "@/utils/crypto";

const DecryptPinDialog: React.FC = () => {
  const { open, setOpen } = usePinDialogStore();
  const { user, setUser } = useUserStore();
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDecryptAesKey = async () => {
    if (pin.length !== 6) {
      toast.error("Please enter a 6-digit PIN");
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
    } catch (error: any) {
      console.error(error);
      toast.error("Invalid PIN. Please try again.");
    } finally {
      setIsLoading(false);
      setPin("");
    }
  };
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setPin("");
      }
      setOpen(isOpen);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter your PIN</DialogTitle>
          <DialogDescription>
            Enter your PIN to encrypt/decrypt your files.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center gap-2">
          <Label>PIN</Label>
          <InputOTP
            type="password"
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS}
            value={pin}
            onChange={setPin}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} type="password" />
              <InputOTPSlot index={1} type="password" />
              <InputOTPSlot index={2} type="password" />
              <InputOTPSlot index={3} type="password" />
              <InputOTPSlot index={4} type="password" />
              <InputOTPSlot index={5} type="password" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <DialogFooter>
          <Button onClick={handleDecryptAesKey} disabled={isLoading}>
            {isLoading ? "Decrypting..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DecryptPinDialog;
