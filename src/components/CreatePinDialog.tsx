import {
  Dialog,
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
  const handleCreatePin = async () => {
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
      toast.success("PIN created successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
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
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create your PIN</DialogTitle>
          <DialogDescription>
            You need provide a PIN to use this App. We will not save your PIN in
            our database.
            <br /> So if you forget this PIN we can'trecover your files.
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
          <Button onClick={handleCreatePin} disabled={isLoading}>
            {isLoading ? "Creating PIN..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePinDialog;
