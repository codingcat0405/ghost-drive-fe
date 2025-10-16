import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { DialogClose, DialogFooter, DialogHeader } from "./ui/dialog";
import { Label } from "./ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Button } from "./ui/button";
import { useState } from "react";

const DecryptPinDiaglog: React.FC<{
  open: boolean;
  setOpen: (open: boolean) => void;
}> = ({ open, setOpen }) => {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDecryptAesKey = async () => {};
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
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

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleDecryptAesKey} disabled={isLoading}>
              {isLoading ? "Creating PIN..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default DecryptPinDiaglog;
