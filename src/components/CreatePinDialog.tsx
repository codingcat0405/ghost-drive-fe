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

const CreatePinDialog: React.FC = () => {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const { user, setUser } = useUserStore();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleCreatePin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pin !== confirmPin) {
      toast.error("PINs do not match");
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
    } catch (error) {
      console.error(error);
      toast.error("Failed to create PIN");
      setIsLoading(false);
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
      <form onSubmit={handleCreatePin}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enter your PIN</DialogTitle>
            <DialogDescription>
              We use this PIN to encrypt and decrypt your files. We don't save
              your PIN in our database. So if you forget this PIN say "bye bye"
              to all your files.
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
          <div className="flex justify-between items-center gap-2">
            <Label>Confirm PIN</Label>

            <InputOTP
              type="password"
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              value={confirmPin}
              onChange={setConfirmPin}
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
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating PIN..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default CreatePinDialog;
